/**
 * Junta o que o servidor sabe (GET /pagamentos/M/:mesa) com o que ainda está
 * na fila de saída (aprovado na maquineta, POST /pagamentos pendente) e com o
 * que o servidor recusou nesta sessão (o operador segue mesmo assim).
 * Funções puras — testáveis sem React.
 */
import type { PagamentoRecord } from '../../models/CobrancaModel';
import type { OutboxItem, PagamentoBody } from '../../sync/outbox';
import type { PagoPorItem } from './FechamentoModal';

export type ItemFila = OutboxItem & { body: PagamentoBody };

/** Chave de dedupe entre servidor e fila (o servidor não devolve o idLocal). */
function chave(p: { authCode?: string; nsu?: string; valorPago: number }): string {
  const auth = (p.authCode ?? '').trim();
  const nsu = (p.nsu ?? '').trim();
  if (!auth && !nsu) return '';
  return `${auth}|${nsu}|${p.valorPago.toFixed(2)}`;
}

export function filaParaRecord(item: ItemFila): PagamentoRecord {
  const b = item.body;
  return {
    id: -Math.abs(hash(item.id)),
    provider: b.provider,
    transactionType: b.transactionType,
    meioPagamento: String(b.providerData?.paymentCode ?? b.transactionType),
    bandeira: b.resumo?.brand ?? '',
    valorPago: b.amountCents / 100,
    authCode: b.resumo?.authCode ?? '',
    nsu: b.resumo?.nsu ?? '',
    pendenteSync: true,
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h || 1;
}

/**
 * Lista final: servidor + fila (sem os que o servidor já tem) + rejeitados
 * (sem os que o servidor/fila já têm).
 */
export function mesclarPagamentos(
  servidor: PagamentoRecord[],
  fila: ItemFila[],
  rejeitados: PagamentoRecord[] = [],
): PagamentoRecord[] {
  const vistos = new Set(servidor.map(chave).filter(Boolean));
  const out = [...servidor];
  for (const it of fila) {
    const r = filaParaRecord(it);
    const k = chave(r);
    if (k && vistos.has(k)) continue;
    if (k) vistos.add(k);
    out.push(r);
  }
  for (const r of rejeitados) {
    const k = chave(r);
    if (k && vistos.has(k)) continue;
    if (k) vistos.add(k);
    out.push(r);
  }
  return out;
}

/** Soma os itens cobertos pelos pagamentos da fila (e rejeitados) ao mapa vindo do servidor. */
export function somarItens(base: PagoPorItem, itens: Array<PagamentoBody['itens']>): PagoPorItem {
  const next: PagoPorItem = { ...base };
  for (const lista of itens) {
    for (const it of lista ?? []) {
      const k = String(it.codItem);
      const cur = next[k] ?? { qtde: 0, valor: 0 };
      next[k] = { qtde: cur.qtde + it.qtde, valor: Math.round((cur.valor + it.valor) * 100) / 100 };
    }
  }
  return next;
}
