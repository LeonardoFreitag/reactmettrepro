/**
 * Inbox global das respostas de Deep Link da maquineta (`order://…`).
 *
 * Problema que resolve: o Pix demora minutos e o Android pode recriar a
 * Activity ou matar o processo enquanto o app da Cielo/Stone está na frente.
 * Nesse caso a resposta (`order://response` na Cielo, `order://…` na Stone)
 * chega como intent de LANÇAMENTO — só `Linking.getInitialURL()` a vê — e a
 * Promise do hook que iniciou o pagamento já não existe.
 *
 * O inbox é montado uma vez em `App.tsx` (`startInbox`): trata a URL inicial
 * e o evento `url`, decodifica a resposta (parsers puros de `cieloCallback.ts`
 * e `stoneCallback.ts`), casa com o pagamento pendente persistido
 * (`pending.ts`) pela `reference` e:
 *
 *  - fluxo do garçom (pendente sem `cobrancaId`): monta o corpo de
 *    `POST /pagamentos` e enfileira na fila de saída (`sync/outbox.ts`, tipo
 *    `pagamento`) — SEMPRE, com ou sem tela esperando; se esta cobrança
 *    completou o total da conta e não há tela esperando (cold start), enfileira
 *    também o `fechaConta` (impressão única);
 *  - modo Terminal / Cobranças (pendente com `cobrancaId`): só grava quando
 *    não há ninguém esperando (cold start) — em processo, `executarCobranca`
 *    continua gravando o PATCH como antes;
 *  - entrega o resultado ao hook que estiver esperando (`registerWaiter`), para
 *    `sendPayment/sendReversal/printText` resolverem como sempre;
 *  - notifica assinantes (`subscribeInbox`) para a tela da comanda recarregar.
 */
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CieloResult, cieloReferenceOf, isCieloCallbackUrl, parseCieloCallbackUrl } from './cieloCallback';
import {
  StoneResult, interpretStoneResponse, isStoneCallbackUrl, parseStoneQuery, stoneProviderData, stoneReferenceOf,
} from './stoneCallback';
import { normalizeCieloOk, toCieloPaymentCode } from './cieloMapping';
import { PendingPayment, completaTotal, concluirPendente, getPendentes, matchPendente } from './pending';
import type { PaymentOk, PaymentProviderName, TransactionType } from './types';
import {
  PagamentoBody, enqueueFechaConta, enqueuePagamento, enqueuePatch, registrarConcluida,
} from '../sync/outbox';
import { buildDesfecho } from '../sync/cobrancasApi';
import { getCurrentCobrancaId, setCurrentCobrancaId } from '../terminal/state';

const KEY_LAST_URL = 'inbox.lastUrl';

// ── Quem está esperando uma resposta (hooks) ────────────────────────────────

type CieloWaiter = { provider: 'CIELO'; resolve: (r: CieloResult) => void };
type StoneWaiter = { provider: 'STONE'; expectAtk: boolean; resolve: (r: StoneResult) => void };
export type Waiter = CieloWaiter | StoneWaiter;

let waiter: Waiter | null = null;

/** Registra o hook que disparou o Deep Link. Devolve o unregister. */
export function registerWaiter(w: Waiter): () => void {
  waiter = w;
  return () => { if (waiter === w) waiter = null; };
}

export function hasWaiter(): boolean { return waiter !== null; }

// ── Assinantes ──────────────────────────────────────────────────────────────

export type InboxEvento = {
  provider: PaymentProviderName;
  ok: boolean;
  pendente: PendingPayment | null;
  /** O inbox gravou o pagamento (fila `pagamento` ou PATCH da cobrança). */
  gravado: boolean;
  /** O pagamento gravado completou o total da conta (fechaConta enfileirado se cold start). */
  completouTotal: boolean;
  /** Havia um hook esperando (resposta entregue a ele). */
  entregue: boolean;
};

type Listener = (e: InboxEvento) => void;
const listeners = new Set<Listener>();
function notify(e: InboxEvento) { listeners.forEach(l => { try { l(e); } catch {} }); }

export function subscribeInbox(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** idLocal dos pagamentos que este processo já enfileirou (evita gravar duas vezes). */
const gravados = new Set<string>();
export function foiGravadoPeloInbox(idLocal: string): boolean { return gravados.has(idLocal); }

// ── Montagem do corpo de POST /pagamentos ───────────────────────────────────

export function montarPagamentoBody(pendente: PendingPayment, ok: PaymentOk): PagamentoBody {
  return {
    provider: pendente.provider,
    origem: pendente.origem,
    codVenda: pendente.codVenda,
    cobrancaId: pendente.cobrancaId ?? null,
    transactionType: ok.transactionType,
    installments: Math.max(ok.installments, 1),
    amountCents: pendente.amountCents,
    totalCents: pendente.totalCents,
    providerData: { ...ok.providerData, reference: pendente.reference, idLocal: pendente.idLocal },
    rawResponse: ok.rawResponse,
    ...(pendente.terminalId ? { terminalId: pendente.terminalId } : {}),
    itens: pendente.itens.length
      ? pendente.itens.map(s => ({ codItem: Number(s.codigo), codConjuga: s.codConjuga, qtde: s.qtde, valor: s.valor }))
      : undefined,
    resumo: { authCode: ok.authCode, brand: ok.brand, nsu: ok.nsu },
  };
}

/**
 * Grava o pagamento aprovado conforme o tipo de pendente. Devolve o que fez.
 * `temWaiter` = há um hook esperando (fluxo em processo).
 */
async function gravar(pendente: PendingPayment, ok: PaymentOk, temWaiter: boolean): Promise<{ gravado: boolean; completou: boolean }> {
  if (gravados.has(pendente.idLocal)) return { gravado: true, completou: false };

  if (pendente.cobrancaId) {
    // Modo Terminal / Cobranças: em processo, executarCobranca grava o PATCH.
    if (temWaiter) return { gravado: false, completou: false };
    const desfecho = buildDesfecho(pendente.terminalId ?? '', pendente.provider, { success: true, value: ok });
    await enqueuePatch(pendente.cobrancaId, desfecho);
    await registrarConcluida({
      cobrancaId: pendente.cobrancaId,
      descricao: pendente.descricao,
      valorCents: pendente.amountCents,
      status: 'approved',
      em: new Date().toISOString(),
    });
    try {
      if ((await getCurrentCobrancaId()) === pendente.cobrancaId) await setCurrentCobrancaId(null);
    } catch {}
    gravados.add(pendente.idLocal);
    return { gravado: true, completou: false };
  }

  // Fluxo do garçom: POST /pagamentos pela fila (reenvio automático; API idempotente).
  await enqueuePagamento(pendente.idLocal, montarPagamentoBody(pendente, ok));
  gravados.add(pendente.idLocal);
  const completou = completaTotal(pendente);
  // Sem tela esperando (cold start), ninguém chamará onCieloComplete: fecha a conta
  // pela fila, depois do pagamento (ordem da fila), uma única vez.
  if (completou && !temWaiter && pendente.origem === 'M') await enqueueFechaConta(pendente.codVenda);
  return { gravado: true, completou };
}

// ── Tratamento por provedor ─────────────────────────────────────────────────

async function tratarCielo(url: string): Promise<InboxEvento> {
  const result = parseCieloCallbackUrl(url);
  const w = waiter?.provider === 'CIELO' ? waiter : null;
  const pendentes = (await getPendentes()).filter(p => p.provider === 'CIELO');
  const pendente = matchPendente(result.success ? cieloReferenceOf(result) : '', pendentes);

  let gravado = false;
  let completou = false;
  if (result.success && pendente) {
    const ok = normalizeCieloOk(result, toCieloPaymentCode(pendente), pendente);
    ({ gravado, completou } = await gravar(pendente, ok, !!w));
  }
  if (pendente && (gravado || !result.success)) await concluirPendente(pendente.idLocal);

  if (w) { waiter = null; w.resolve(result); }
  return { provider: 'CIELO', ok: result.success, pendente, gravado, completouTotal: completou, entregue: !!w };
}

async function tratarStone(url: string): Promise<InboxEvento> {
  const data = parseStoneQuery(url);
  const w = waiter?.provider === 'STONE' ? waiter : null;
  // Sem hook esperando (cold start) só pode ser um pagamento: exige ATK.
  const result = interpretStoneResponse(data, w ? w.expectAtk : true);
  const pendentes = (await getPendentes()).filter(p => p.provider === 'STONE');
  const pendente = matchPendente(stoneReferenceOf(data), pendentes);

  let gravado = false;
  let completou = false;
  if (result.success && pendente) {
    const pd = stoneProviderData(data, pendente.terminalId);
    const ok: PaymentOk = {
      success: true,
      transactionType: (pd.transactionType || pendente.transactionType) as TransactionType,
      installments: pd.installmentCount || pendente.installments,
      amountCents: Number(data.amount) > 0 ? Math.round(Number(data.amount)) : pendente.amountCents,
      brand: pd.brand,
      authCode: pd.authorizationCode,
      nsu: pd.authorizationCode,
      providerData: { ...pd, reference: pendente.reference },
      rawResponse: data,
    };
    ({ gravado, completou } = await gravar(pendente, ok, !!w));
  }
  if (pendente && (gravado || !result.success)) await concluirPendente(pendente.idLocal);

  if (w) { waiter = null; w.resolve(result); }
  return { provider: 'STONE', ok: result.success, pendente, gravado, completouTotal: completou, entregue: !!w };
}

// ── Entrada ─────────────────────────────────────────────────────────────────

const emAndamento = new Set<string>();
let ultimaUrl: string | null | undefined; // undefined = ainda não lida do storage

/**
 * Trata uma URL de retorno. Idempotente para a MESMA URL quando não há hook
 * esperando (o Android reentrega a intent inicial ao reabrir pelo "recentes").
 * Com hook esperando, sempre entrega (impressões repetidas têm retorno igual).
 */
export async function handleDeepLinkUrl(url: string | null | undefined): Promise<InboxEvento | null> {
  if (!url || !url.startsWith('order://')) return null;
  if (emAndamento.has(url)) return null;
  if (!waiter) {
    if (ultimaUrl === undefined) {
      try { ultimaUrl = await AsyncStorage.getItem(KEY_LAST_URL); } catch { ultimaUrl = null; }
    }
    if (url === ultimaUrl) return null;
  }
  emAndamento.add(url);
  try {
    const ev = isCieloCallbackUrl(url) ? await tratarCielo(url)
      : isStoneCallbackUrl(url) ? await tratarStone(url)
      : null;
    ultimaUrl = url;
    try { await AsyncStorage.setItem(KEY_LAST_URL, url); } catch {}
    if (ev) notify(ev);
    return ev;
  } catch {
    return null;
  } finally {
    emAndamento.delete(url);
  }
}

let started: Promise<void> | null = null;

/**
 * Liga o inbox (idempotente). A Promise resolve depois de tratar a URL inicial
 * (cold start) — a recuperação de pendentes deve esperar por ela.
 */
export function startInbox(): Promise<void> {
  if (started) return started;
  started = (async () => {
    Linking.addEventListener('url', ({ url }) => { void handleDeepLinkUrl(url); });
    try {
      const initial = await Linking.getInitialURL();
      if (initial) await handleDeepLinkUrl(initial);
    } catch {}
  })();
  return started;
}
