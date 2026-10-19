/**
 * Adaptador Stone SmartPOS (Deeplink, sem SDK) — Etapa B.
 * Mesma interface `PaymentProvider` do adaptador Cielo. Não há credenciais no
 * app: o Deeplink da Stone não usa token.
 */
import { useEffect, useMemo } from 'react';
import { ConfigModel } from '../models/ConfigModel';
import { useStoneDeepLink, StoneResponse } from '../hooks/useStoneDeepLink';
import { incProviderWaiting, decProviderWaiting } from '../terminal/state';
import { PaymentProvider, PaymentRequest, PaymentResult, ReversalRequest, TransactionType } from './types';

/** Stone: sem credenciais; basta o provedor estar selecionado. */
export function isStoneConfigured(config: ConfigModel): boolean {
  return config.provider === 'STONE';
}

/** Normaliza o retorno do Deeplink para `providerData` (o que a API grava). */
export function stoneProviderData(data: StoneResponse, terminalId?: string) {
  return {
    atk: data.atk ?? '',
    itk: data.itk ?? '',
    authorizationCode: data.authorization_code ?? '',
    brand: data.brand ?? '',
    panMasked: data.pan ?? '',
    entryMode: data.entry_mode ?? '',
    installmentCount: Number(data.installment_count ?? 1) || 1,
    transactionType: (data.transaction_type ?? '') as TransactionType | '',
    orderId: data.order_id ?? '',
    cardholderName: data.cardholder_name ?? '',
    terminalId: terminalId ?? '',
  };
}

export function useStoneProvider(config: ConfigModel): PaymentProvider {
  const { sendPayment, sendCancel, printText, isWaiting } = useStoneDeepLink();
  const terminalId = config.terminalId;

  useEffect(() => {
    if (!isWaiting) return;
    incProviderWaiting();
    return () => decProviderWaiting();
  }, [isWaiting]);

  return useMemo<PaymentProvider>(() => ({
    name: 'STONE',
    isWaiting,
    isConfigured: () => isStoneConfigured(config),

    async pay(req: PaymentRequest): Promise<PaymentResult> {
      const installments = req.transactionType === 'CREDIT' ? Math.max(req.installments, 1) : 1;
      const r = await sendPayment({
        amountCents: req.amountCents,
        transactionType: req.transactionType,
        installments,
        orderId: req.reference,
      });
      if (!r.success) return { success: false, error: r.error, canceledByUser: r.canceledByUser };
      const d = r.data;
      const pd = stoneProviderData(d, terminalId);
      return {
        success: true,
        transactionType: (pd.transactionType || req.transactionType) as TransactionType,
        installments: pd.installmentCount || installments,
        amountCents: Number(d.amount) > 0 ? Math.round(Number(d.amount)) : req.amountCents,
        brand: pd.brand,
        authCode: pd.authorizationCode,
        nsu: pd.authorizationCode,
        providerData: pd,
        rawResponse: d,
      };
    },

    async reverse({ alvo }: ReversalRequest): Promise<PaymentResult> {
      if (!alvo.atk) {
        // A API já devolve alvo.atk = null; o app não tenta o Deeplink.
        return { success: false, error: 'Pagamento sem ATK; estornar pelo portal da Stone.' };
      }
      const r = await sendCancel({ amountCents: alvo.valorCents, atk: alvo.atk });
      if (!r.success) return { success: false, error: r.error, canceledByUser: r.canceledByUser };
      const pd = stoneProviderData(r.data, terminalId);
      return {
        success: true,
        transactionType: (alvo.transactionType as TransactionType) || 'CREDIT',
        installments: alvo.installments,
        amountCents: alvo.valorCents,
        brand: pd.brand,
        authCode: pd.authorizationCode,
        nsu: pd.authorizationCode,
        providerData: { ...pd, atk: pd.atk || alvo.atk },
        rawResponse: r.data,
      };
    },

    async print(text: string): Promise<void> {
      await printText(text);
    },
  }), [config, terminalId, isWaiting, sendPayment, sendCancel, printText]);
}
