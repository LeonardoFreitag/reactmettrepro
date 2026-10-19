/**
 * Interface única de pagamento na maquineta (Cielo Smart hoje, Stone SmartPOS na Etapa B).
 * Os adaptadores ficam em ./cielo.ts e ./stone.ts; `usePaymentProvider()` em ./index.ts.
 */
import type { CobrancaAlvo } from '../models/CobrancaModel';

export type TransactionType = 'CREDIT' | 'DEBIT' | 'VOUCHER' | 'INSTANT_PAYMENT';
export type PaymentProviderName = 'CIELO' | 'STONE';

export type CieloItem = {
  name: string;
  quantity: number;
  sku: string;
  unitPrice: number; // centavos
};

export type PaymentRequest = {
  amountCents: number;
  transactionType: TransactionType;
  /**
   * Nº de parcelas. `1` = à vista. `0` = "a maquineta pergunta" (só Cielo;
   * comportamento do fluxo atual "Crédito parcelado").
   */
  installments: number;
  /** Referência/identificador (COBRANCAS_TERMINAL.EXTERNAL_REF ou id). */
  reference: string;
  /** Só Cielo usa (itens da ordem). Opcional: sem itens, envia 1 item genérico. */
  items?: CieloItem[];
  /** Só Cielo: VOUCHER_REFEICAO (default) ou VOUCHER_ALIMENTACAO. */
  voucherKind?: 'REFEICAO' | 'ALIMENTACAO';
};

export type PaymentOk = {
  success: true;
  transactionType: TransactionType;
  installments: number;
  amountCents: number;
  brand: string;
  authCode: string;
  nsu: string;
  /** Campos específicos do provedor, enviados em `providerData` para a API. */
  providerData: Record<string, unknown>;
  /** Resposta crua da maquineta (vai para PAYLOAD_JSON). */
  rawResponse: unknown;
};

export type PaymentFail = {
  success: false;
  error: string;
  errorCode?: number;
  canceledByUser?: boolean;
};

export type PaymentResult = PaymentOk | PaymentFail;

export type ReversalRequest = { alvo: CobrancaAlvo };

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  pay(req: PaymentRequest): Promise<PaymentResult>;
  reverse(req: ReversalRequest): Promise<PaymentResult>;
  print?(text: string): Promise<void>;
  isConfigured(): boolean;
  /** true enquanto aguarda o retorno do app da maquineta. */
  readonly isWaiting: boolean;
}

/** Opções oferecidas ao operador (substitui CIELO_PAYMENT_METHODS na UI). */
export type PaymentMethodOption = {
  key: string;
  label: string;
  transactionType: TransactionType;
  installments: number;
  voucherKind?: 'REFEICAO' | 'ALIMENTACAO';
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { key: 'CREDIT_1',         label: 'Crédito à vista',   transactionType: 'CREDIT',          installments: 1 },
  { key: 'CREDIT_N',         label: 'Crédito parcelado', transactionType: 'CREDIT',          installments: 0 },
  { key: 'DEBIT',            label: 'Débito à vista',    transactionType: 'DEBIT',           installments: 1 },
  { key: 'PIX',              label: 'Pix',               transactionType: 'INSTANT_PAYMENT', installments: 1 },
  { key: 'VOUCHER_REFEICAO', label: 'Vale refeição',     transactionType: 'VOUCHER',         installments: 1, voucherKind: 'REFEICAO' },
  { key: 'VOUCHER_ALIM',     label: 'Vale alimentação',  transactionType: 'VOUCHER',         installments: 1, voucherKind: 'ALIMENTACAO' },
];

export function transactionTypeLabel(tt: string | null | undefined, installments = 1): string {
  switch (tt) {
    case 'CREDIT': return installments > 1 ? `Crédito ${installments}x` : 'Crédito';
    case 'DEBIT': return 'Débito';
    case 'INSTANT_PAYMENT': return 'Pix';
    case 'VOUCHER': return 'Voucher';
    default: return tt ?? '';
  }
}

/** Rótulo para MEIO_PAGAMENTO cru (Cielo: CREDITO_AVISTA…; Stone: CREDIT…). */
export function meioPagamentoLabel(code: string): string {
  const map: Record<string, string> = {
    CREDITO_AVISTA: 'Crédito à vista',
    CREDITO_PARCELADO_LOJA: 'Crédito parcelado',
    CREDITO_PARCELADO_EMISSOR: 'Crédito parcelado (emissor)',
    DEBITO_AVISTA: 'Débito à vista',
    PIX: 'Pix',
    VOUCHER_REFEICAO: 'Vale refeição',
    VOUCHER_ALIMENTACAO: 'Vale alimentação',
    CREDIT: 'Crédito',
    DEBIT: 'Débito',
    INSTANT_PAYMENT: 'Pix',
    VOUCHER: 'Voucher',
  };
  return map[code] ?? code;
}
