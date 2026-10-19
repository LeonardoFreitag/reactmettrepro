/**
 * Adaptador Cielo Smart — envolve o `useCieloDeepLink` existente (sem alterar
 * o comportamento do Deep Link) e o expõe pela interface `PaymentProvider`.
 * O de/para puro (paymentCode, normalização da resposta) está em cieloMapping.ts.
 */
import { useEffect, useMemo } from 'react';
import { useCieloDeepLink } from '../hooks/useCieloDeepLink';
import { ConfigModel } from '../models/ConfigModel';
import { incProviderWaiting, decProviderWaiting } from '../terminal/state';
import { normalizeCieloFail, normalizeCieloOk, toCieloPaymentCode } from './cieloMapping';
import { PaymentProvider, PaymentRequest, PaymentResult, ReversalRequest, TransactionType } from './types';

export { toCieloPaymentCode, fromCieloPaymentCode } from './cieloMapping';

export function useCieloProvider(config: ConfigModel): PaymentProvider {
  const { sendPayment, sendReversal, printText, isWaiting } = useCieloDeepLink();
  const accessToken = config.cieloAccessToken ?? '';
  const clientID = config.cieloClientId ?? '';

  // Sinaliza globalmente "maquineta ocupada" (o poller do modo Terminal não dispara
  // por cima; a tela fica acesa — expo-keep-awake — enquanto o cliente paga).
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
      return result.success ? normalizeCieloOk(result, paymentCode, req) : normalizeCieloFail(result);
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
      if (!result.success) return normalizeCieloFail(result);
      const tt = (alvo.transactionType as TransactionType) || 'CREDIT';
      return normalizeCieloOk(result, 'ESTORNO', {
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
