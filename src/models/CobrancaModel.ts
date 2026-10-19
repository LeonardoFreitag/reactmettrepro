import { TransactionType } from '../payment/types';

export type CobrancaStatus =
  | 'pending' | 'sent_to_terminal' | 'approved' | 'declined' | 'canceled' | 'expired' | 'error';

export type CobrancaAlvo = {
  pagamentoId: number;
  provider: string;
  atk: string | null;
  cieloOrderId: string | null;
  authCode: string | null;
  cieloCode: string | null;
  valorCents: number;
  transactionType: string;
  installments: number;
};

/** DTO de COBRANCAS_TERMINAL devolvido pela API (/cobrancas/*). */
export type Cobranca = {
  id: string;
  origem: 'M' | 'B' | 'E';
  codVenda: number;
  valorCents: number;
  tipoPre: TransactionType | null;
  parcelasPre: number;
  modo: 'A' | 'D';
  operacao: 'P' | 'C';
  alvoPagamentoId: number | null;
  terminalId: string | null;
  codEntregador: number | null;
  descricao: string | null;
  externalRef: string | null;
  status: CobrancaStatus;
  cancelRequested: boolean;
  provider: 'CIELO' | 'STONE' | null;
  pagamentoId: number | null;
  motivoErro: string | null;
  consumido: boolean;
  criadoEm: string;
  expiraEm: string | null;
  atualizadoEm: string;
  alvo: CobrancaAlvo | null;
};

export const ORIGEM_LABEL: Record<Cobranca['origem'], string> = {
  M: 'Mesa',
  B: 'Balcão',
  E: 'Entrega',
};

/** Item da venda já coberto por pagamentos válidos (GET /pagamentos → itensPagos). */
export type ItemPagoRecord = {
  codItem: number;      // MESAS_ITENS.CODIGO
  codConjuga: number;   // >0 quando combinado
  qtde: number;
  valor: number;        // em R$
};

/** Pagamento já registrado, no formato de GET /pagamentos/:origem/:codVenda. */
export type PagamentoRecord = {
  id: number;
  provider: string;
  transactionType: string;
  meioPagamento: string;
  bandeira: string;
  valorPago: number;      // em R$
  authCode: string;
  nsu: string;
  estornado?: boolean;
  consumido?: boolean;
  /** true = aprovado na maquineta mas ainda na fila de saída (servidor não tem). */
  pendenteSync?: boolean;
};
