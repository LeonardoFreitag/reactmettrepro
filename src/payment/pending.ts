/**
 * Registro persistido (AsyncStorage) do pagamento em andamento na maquineta.
 *
 * É gravado ANTES do `Linking.openURL` do provedor e apagado quando o
 * pagamento termina (aprovado, recusado ou cancelado). Se o Android matar o
 * processo enquanto o cliente lê o QR Code do Pix, a resposta `order://…`
 * chega como intent de lançamento: o inbox (`deepLinkInbox.ts`) casa a resposta
 * com este registro pela `reference` e grava o pagamento mesmo sem a tela que
 * o iniciou. Um registro sem resposta ao iniciar o app vira a pergunta
 * "Cobrança em aberto…" (`PendingRecovery`).
 *
 * `reference` é estruturada e única por tentativa: `<origem>:<codVenda>:<idLocal>`.
 * A Cielo ecoa `reference` na ordem; a Stone ecoa `order_id`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import type { PaymentProviderName, TransactionType } from './types';

const KEY_PENDING = 'payment.pending';

export type PendingOrigem = 'M' | 'B' | 'E';

/** Item (ou fatia) da comanda coberto pela cobrança — mesmo formato de `SelecaoItem`. */
export type PendingItem = {
  codigo: string;
  codConjuga: number;
  qtde: number;
  valor: number;
};

export type PendingPayment = {
  idLocal: string;
  provider: PaymentProviderName;
  origem: PendingOrigem;
  codVenda: number;
  /** Preenchido no modo Terminal / Cobranças (o desfecho vai por PATCH /cobrancas/:id). */
  cobrancaId?: string | null;
  terminalId?: string;
  amountCents: number;
  totalCents: number;
  /** Quanto já estava recebido quando esta cobrança começou (centavos). */
  paidBeforeCents: number;
  transactionType: TransactionType;
  installments: number;
  voucherKind?: 'REFEICAO' | 'ALIMENTACAO';
  itens: PendingItem[];
  reference: string;
  /** Texto para os alertas (ex.: "Comanda 12"). */
  descricao: string;
  iniciadoEm: string; // ISO
};

export type PendingInput = Omit<PendingPayment, 'idLocal' | 'reference' | 'iniciadoEm'>;

export function buildReference(origem: PendingOrigem, codVenda: number, idLocal: string): string {
  return `${origem}:${codVenda}:${idLocal}`;
}

export function parseReference(ref: string | null | undefined): { origem: PendingOrigem; codVenda: number; idLocal: string } | null {
  if (!ref) return null;
  const m = /^([MBE]):(\d+):([0-9a-fA-F-]{8,})$/.exec(ref.trim());
  if (!m) return null;
  return { origem: m[1] as PendingOrigem, codVenda: Number(m[2]), idLocal: m[3] };
}

/** Casa a resposta com um pendente: pela `reference`; na falta, pelo único pendente existente. */
export function matchPendente(reference: string | null | undefined, pendentes: PendingPayment[]): PendingPayment | null {
  const ref = (reference ?? '').trim();
  if (ref) {
    const exato = pendentes.find(p => p.reference === ref);
    if (exato) return exato;
    const parsed = parseReference(ref);
    if (parsed) {
      const porId = pendentes.find(p => p.idLocal === parsed.idLocal);
      if (porId) return porId;
    }
  }
  return pendentes.length === 1 ? pendentes[0] : null;
}

/** Esta cobrança, aprovada, completa o total da conta? (regra da impressão única). */
export function completaTotal(p: Pick<PendingPayment, 'paidBeforeCents' | 'amountCents' | 'totalCents'>): boolean {
  if (p.totalCents <= 0) return false;
  return p.paidBeforeCents + p.amountCents >= p.totalCents - 1; // tolerância de 1 centavo
}

async function readAll(): Promise<PendingPayment[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PENDING);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
async function writeAll(list: PendingPayment[]): Promise<void> {
  await AsyncStorage.setItem(KEY_PENDING, JSON.stringify(list));
}

export const getPendentes = readAll;

export async function findPendente(idLocal: string): Promise<PendingPayment | null> {
  return (await readAll()).find(p => p.idLocal === idLocal) ?? null;
}

/** Grava o pendente (antes do Deep Link) e devolve o registro com `idLocal` e `reference`. */
export async function iniciarPendente(input: PendingInput): Promise<PendingPayment> {
  const idLocal = uuid.v4() as string;
  const p: PendingPayment = {
    ...input,
    idLocal,
    reference: buildReference(input.origem, input.codVenda, idLocal),
    iniciadoEm: new Date().toISOString(),
  };
  const list = await readAll();
  list.push(p);
  await writeAll(list);
  return p;
}

export async function concluirPendente(idLocal: string): Promise<void> {
  const list = await readAll();
  const next = list.filter(p => p.idLocal !== idLocal);
  if (next.length !== list.length) await writeAll(next);
}

export async function limparPendentes(): Promise<void> {
  await writeAll([]);
}
