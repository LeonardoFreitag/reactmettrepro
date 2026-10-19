/**
 * De/para puro entre a interface `PaymentProvider` e o Deep Link da Cielo:
 * `transactionType+installments ↔ paymentCode` e normalização da resposta.
 * Sem React — usado pelo adaptador (`cielo.ts`) e pelo inbox (cold start).
 */
import { CieloPaymentResponse } from '../models/CieloModel';
import type { CieloResult } from './cieloCallback';
import type { PaymentOk, PaymentRequest, PaymentResult, TransactionType } from './types';

/** transactionType + installments → paymentCode da Cielo. */
export function toCieloPaymentCode(req: Pick<PaymentRequest, 'transactionType' | 'installments' | 'voucherKind'>): string {
  switch (req.transactionType) {
    case 'CREDIT':
      return req.installments === 1 ? 'CREDITO_AVISTA' : 'CREDITO_PARCELADO_LOJA';
    case 'DEBIT':
      return 'DEBITO_AVISTA';
    case 'INSTANT_PAYMENT':
      return 'PIX';
    case 'VOUCHER':
      return req.voucherKind === 'ALIMENTACAO' ? 'VOUCHER_ALIMENTACAO' : 'VOUCHER_REFEICAO';
    default:
      return 'CREDITO_AVISTA';
  }
}

/** paymentCode da Cielo → transactionType normalizado. */
export function fromCieloPaymentCode(code: string): TransactionType {
  const c = (code ?? '').toUpperCase();
  if (c.startsWith('DEBITO')) return 'DEBIT';
  if (c.startsWith('PIX')) return 'INSTANT_PAYMENT';
  if (c.startsWith('VOUCHER')) return 'VOUCHER';
  return 'CREDIT';
}

/**
 * Pix na Cielo: `paymentFields.primaryProductName` contém "PIX" (FAQ Cielo
 * Smart); o `authCode` é o E2E ID de 32 caracteres.
 */
export function cieloRespostaEhPix(data: CieloPaymentResponse | undefined): boolean {
  const name = String(data?.payments?.[0]?.paymentFields?.primaryProductName ?? '').toUpperCase();
  return name.includes('PIX');
}

export function normalizeCieloOk(
  result: Extract<CieloResult, { success: true }>,
  paymentCode: string,
  req: { transactionType: TransactionType; installments: number; amountCents: number; reference?: string },
): PaymentOk {
  const data: CieloPaymentResponse = result.data;
  const p = data.payments?.[0];
  const fields = p?.paymentFields;
  const transactionType: TransactionType =
    paymentCode !== 'ESTORNO' && cieloRespostaEhPix(data) ? 'INSTANT_PAYMENT' : req.transactionType;
  return {
    success: true,
    transactionType,
    installments: Number(p?.installments) > 0 ? Number(p!.installments) : Math.max(req.installments, 1),
    amountCents: Number(p?.amount) > 0 ? Math.round(Number(p!.amount)) : req.amountCents,
    brand: p?.brand ?? '',
    authCode: p?.authCode ?? '',
    nsu: fields?.paymentTransactionId ?? p?.externalId ?? '',
    providerData: {
      paymentCode,
      // `reference` estruturada (<origem>:<codVenda>:<idLocal>) — a API grava em REFERENCIA.
      reference: req.reference ?? data.reference ?? '',
    },
    rawResponse: data,
  };
}

export function normalizeCieloFail(result: Extract<CieloResult, { success: false }>): PaymentResult {
  return {
    success: false,
    error: result.error,
    errorCode: result.errorCode,
    // Cielo: code 1 = cancelado pelo usuário
    canceledByUser: result.errorCode === 1 || /cancelad/i.test(result.error ?? ''),
  };
}
