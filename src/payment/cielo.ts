/**
 * Adaptador Cielo Smart — envolve o `useCieloDeepLink` existente (sem alterar
 * o comportamento do Deep Link) e o expõe pela interface `PaymentProvider`.
 */
import { useEffect, useMemo } from 'react';
import { useCieloDeepLink, CieloResult } from '../hooks/useCieloDeepLink';
import { CieloPaymentResponse } from '../models/CieloModel';
import { ConfigModel } from '../models/ConfigModel';
import { incProviderWaiting, decProviderWaiting } from '../terminal/state';
import {
  PaymentProvider, PaymentRequest, PaymentResult, ReversalRequest, TransactionType,
} from './types';

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

function normalizeOk(
  result: Extract<CieloResult, { success: true }>,
  paymentCode: string,
  req: { transactionType: TransactionType; installments: number; amountCents: number },
): PaymentResult {
  const data: CieloPaymentResponse = result.data;
  const p = data.payments?.[0];
  const fields = p?.paymentFields;
  return {
    success: true,
    transactionType: req.transactionType,
    installments: Number(p?.installments) > 0 ? Number(p!.installments) : Math.max(req.installments, 1),
    amountCents: Number(p?.amount) > 0 ? Math.round(Number(p!.amount)) : req.amountCents,
    brand: p?.brand ?? '',
    authCode: p?.authCode ?? '',
    nsu: fields?.paymentTransactionId ?? p?.externalId ?? '',
    providerData: { paymentCode },
    rawResponse: data,
  };
}

function normalizeFail(result: Extract<CieloResult, { success: false }>): PaymentResult {
  return {
    success: false,
    error: result.error,
    errorCode: result.errorCode,
    // Cielo: code 1 = cancelado pelo usuário
    canceledByUser: result.errorCode === 1 || /cancelad/i.test(result.error ?? ''),
  };
}

export function useCieloProvider(config: ConfigModel): PaymentProvider {
  const { sendPayment, sendReversal, printText, isWaiting } = useCieloDeepLink();
  const accessToken = config.cieloAccessToken ?? '';
  const clientID = config.cieloClientId ?? '';

  // Sinaliza globalmente "maquineta ocupada" (o poller do modo Terminal não dispara por cima).
  useEffect(() => {
    if (!isWaiting) return;
    incProviderWaiting();
    return () => decProviderWaiting();
  }, [isWaiting]);

  return useMemo<PaymentProvider>(() => ({
    name: 'CIELO',
    isWaiting,
    isConfigured: () => !!(accessToken && clientID),

    async pay(req: PaymentRequest): Promise<PaymentResult> {
      const paymentCode = toCieloPaymentCode(req);
      const items = req.items && req.items.length > 0
        ? req.items
        : [{ name: req.reference || 'Cobrança', quantity: 1, sku: 'COBRANCA', unitPrice: req.amountCents }];

      const result = await sendPayment({
        accessToken,
        clientID,
        totalCents: req.amountCents,
        items,
        paymentCode,
        reference: req.reference,
        // 0 = "a Cielo pergunta" (fluxo do garçom); n>1 = pré-seleção do caixa/operador.
        installments: req.transactionType === 'CREDIT' && req.installments > 1 ? req.installments : 0,
      });
      return result.success ? normalizeOk(result, paymentCode, req) : normalizeFail(result);
    },

    async reverse({ alvo }: ReversalRequest): Promise<PaymentResult> {
      if (!alvo.cieloOrderId || !alvo.authCode) {
        return { success: false, error: 'Pagamento sem id/autorização Cielo; estorne pelo portal ou pela maquineta.' };
      }
      const result = await sendReversal({
        accessToken,
        clientID,
        id: alvo.cieloOrderId,
        authCode: alvo.authCode,
        cieloCode: alvo.cieloCode ?? '',
      });
      if (!result.success) return normalizeFail(result);
      const tt = (alvo.transactionType as TransactionType) || 'CREDIT';
      return normalizeOk(result, 'ESTORNO', {
        transactionType: tt,
        installments: alvo.installments,
        amountCents: alvo.valorCents,
      });
    },

    async print(text: string): Promise<void> {
      await printText(text);
    },
  }), [accessToken, clientID, isWaiting, sendPayment, sendReversal, printText]);
}
