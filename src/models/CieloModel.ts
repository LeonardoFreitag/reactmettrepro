// ─── Request ────────────────────────────────────────────────────────────────

export interface CieloPaymentItem {
  name: string;
  quantity: number;
  sku: string;
  unitOfMeasure: string;
  unitPrice: number; // em centavos
}

export interface CieloPaymentRequest {
  accessToken: string;
  clientID: string;
  reference?: string;
  email?: string;
  installments: number;
  items: CieloPaymentItem[];
  paymentCode: string; // ex: "CREDITO_AVISTA", "DEBITO_AVISTA", "PIX"
  value: string;       // total em centavos como string (ex: "1000" = R$10,00)
}

// ─── Response ───────────────────────────────────────────────────────────────

export interface CieloPaymentFields {
  statusCode: string;        // "0" = PIX, "1" = autorizado, "2" = cancelado
  primaryProductCode: string;
  primaryProductName: string;
  secondaryProductName: string;
  merchantCode: string;
  numberOfQuotas: string;
  hasPassword: string;
  hasSignature: string;
  applicationName: string;
  paymentTransactionId: string;
  pan: string;
  cityState: string;
  merchantName: string;
  merchantAddress: string;
  productName: string;
}

export interface CieloPaymentEntry {
  id: string;
  amount: number;
  authCode: string;
  cieloCode: string;
  brand: string;
  mask: string;
  installments: number;
  terminal: string;
  merchantCode: string;
  applicationName: string;
  externalId: string;
  requestDate: string;
  paymentFields: CieloPaymentFields;
}

export interface CieloPaymentResponse {
  id: string;
  reference: string;
  status: string;
  type: string;
  price: number;
  paidAmount: number;
  pendingAmount: number;
  createdAt: string;
  updatedAt: string;
  payments: CieloPaymentEntry[];
}

export interface CieloPaymentError {
  code: number;   // 1=cancelado pelo usuário, 2=erro genérico, 3=erro pagamento, 4=erro autenticação
  reason: string;
}

// ─── Opções de meio de pagamento oferecidas ao operador ─────────────────────

export type CieloPaymentMethod = {
  code: string;
  label: string;
};

export const CIELO_PAYMENT_METHODS: CieloPaymentMethod[] = [
  { code: 'CREDITO_AVISTA',      label: 'Crédito à vista' },
  { code: 'CREDITO_PARCELADO_LOJA', label: 'Crédito parcelado' },
  { code: 'DEBITO_AVISTA',       label: 'Débito à vista' },
  { code: 'PIX',                 label: 'Pix' },
  { code: 'VOUCHER_REFEICAO',    label: 'Vale refeição' },
  { code: 'VOUCHER_ALIMENTACAO', label: 'Vale alimentação' },
];
