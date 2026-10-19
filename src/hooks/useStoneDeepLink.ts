/**
 * Deep Link da Stone SmartPOS (sem SDK), espelho do useCieloDeepLink.
 *
 *  Pagamento:   payment-app://pay?return_scheme=order&amount=<centavos>&editable_amount=0
 *               &transaction_type=<CREDIT|DEBIT|VOUCHER|INSTANT_PAYMENT>
 *               &installment_type=<NONE|MERCHANT>&installment_count=<n>&order_id=<ref>
 *  Cancelamento: cancel-app://cancel?return_scheme=order&amount=<centavos>&editable_amount=0&atk=<atk>
 *  Impressão:    printer-app://print?return_scheme=order&...  (só se a homologação exigir)
 *
 * O retorno (`order://…`, query string) é lido pelo inbox global
 * (payment/deepLinkInbox.ts), inclusive no cold start; o parser puro está em
 * payment/stoneCallback.ts. Este hook só registra quem espera.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { STONE_RETURN_SCHEME, StoneResponse, StoneResult, interpretStoneResponse } from '../payment/stoneCallback';
import { registerWaiter } from '../payment/deepLinkInbox';

export type { StoneResponse, StoneResult };
export { interpretStoneResponse };

const RETURN_SCHEME = STONE_RETURN_SCHEME;
const STONE_PAY_URI = 'payment-app://pay';
const STONE_CANCEL_URI = 'cancel-app://cancel';
const STONE_PRINT_URI = 'printer-app://print';

export function useStoneDeepLink() {
  const [isWaiting, setIsWaiting] = useState(false);
  const settleRef = useRef<((r: StoneResult) => void) | null>(null);
  const unregisterRef = useRef<(() => void) | null>(null);

  useEffect(() => () => {
    unregisterRef.current?.();
    unregisterRef.current = null;
    settleRef.current = null;
  }, []);

  function open(uri: string, expectAtk: boolean, openError: string): Promise<StoneResult> {
    setIsWaiting(true);
    return new Promise<StoneResult>(resolve => {
      const settle = (r: StoneResult) => {
        if (settleRef.current !== settle) return;
        settleRef.current = null;
        unregisterRef.current?.();
        unregisterRef.current = null;
        setIsWaiting(false);
        resolve(r);
      };
      settleRef.current = settle;
      unregisterRef.current = registerWaiter({ provider: 'STONE', expectAtk, resolve: settle });
      Linking.openURL(uri).catch(() => settle({ success: false, error: openError }));
    });
  }

  const sendPayment = useCallback((params: {
    amountCents: number;
    transactionType: 'CREDIT' | 'DEBIT' | 'VOUCHER' | 'INSTANT_PAYMENT';
    installments: number;
    orderId: string;
  }): Promise<StoneResult> => {
    const n = Math.max(1, Math.floor(params.installments || 1));
    // installment_type: NONE à vista, MERCHANT (parcelado loja, sem juros) — validado na homologação do AutoMax.
    const installmentType = n > 1 ? 'MERCHANT' : 'NONE';
    const q = [
      `return_scheme=${RETURN_SCHEME}`,
      `amount=${Math.round(params.amountCents)}`,
      'editable_amount=0',
      `transaction_type=${params.transactionType}`,
      `installment_type=${installmentType}`,
      `installment_count=${n}`,
      `order_id=${encodeURIComponent(params.orderId)}`,
    ].join('&');
    return open(`${STONE_PAY_URI}?${q}`, true,
      'Não foi possível abrir o app de pagamento da Stone. Verifique se este aparelho é uma SmartPOS Stone.');
  }, []);

  const sendCancel = useCallback((params: { amountCents: number; atk: string }): Promise<StoneResult> => {
    const q = [
      `return_scheme=${RETURN_SCHEME}`,
      `amount=${Math.round(params.amountCents)}`,
      'editable_amount=0',
      `atk=${encodeURIComponent(params.atk)}`,
    ].join('&');
    return open(`${STONE_CANCEL_URI}?${q}`, false,
      'Não foi possível abrir o app de cancelamento da Stone.');
  }, []);

  const printText = useCallback((text: string): Promise<StoneResult> => {
    // Formato do printer-app varia por versão; usado só se a homologação exigir.
    const q = `return_scheme=${RETURN_SCHEME}&content=${encodeURIComponent(text)}`;
    return open(`${STONE_PRINT_URI}?${q}`, false, 'Não foi possível acionar a impressora da Stone.');
  }, []);

  const cancelWait = useCallback(() => {
    settleRef.current?.({ success: false, error: 'Operação cancelada pelo operador.', canceledByUser: true });
  }, []);

  return { sendPayment, sendCancel, printText, cancelWait, isWaiting };
}
