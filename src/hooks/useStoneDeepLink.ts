/**
 * Deep Link da Stone SmartPOS (sem SDK), espelho do useCieloDeepLink.
 *
 *  Pagamento:   payment-app://pay?return_scheme=order&amount=<centavos>&editable_amount=0
 *               &transaction_type=<CREDIT|DEBIT|VOUCHER|INSTANT_PAYMENT>
 *               &installment_type=<NONE|MERCHANT>&installment_count=<n>&order_id=<ref>
 *  Cancelamento: cancel-app://cancel?return_scheme=order&amount=<centavos>&editable_amount=0&atk=<atk>
 *  Impressão:    printer-app://print?return_scheme=order&...  (só se a homologação exigir)
 *
 * Retorno no scheme do app (`order://…`) com os parâmetros na query string:
 *  atk, authorization_code, brand, cardholder_name, itk, pan, entry_mode,
 *  installment_count, transaction_type, order_id, amount, e `reason`/`status` em erro.
 * Mesmos nomes de parâmetro do app "AutoMax Stone POS" (homologado 14/09/2026).
 *
 * O callback da Cielo é `order://response` — este hook ignora essa URL, e o da
 * Cielo ignora as demais, então os dois listeners convivem.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Linking } from 'react-native';

const RETURN_SCHEME = 'order';
const CIELO_CALLBACK_PREFIX = 'order://response';
const STONE_PAY_URI = 'payment-app://pay';
const STONE_CANCEL_URI = 'cancel-app://cancel';
const STONE_PRINT_URI = 'printer-app://print';

export type StoneResponse = Record<string, string>;

export type StoneResult =
  | { success: true; data: StoneResponse }
  | { success: false; error: string; canceledByUser?: boolean; data?: StoneResponse };

function parseQuery(url: string): StoneResponse {
  const params: StoneResponse = {};
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return params;
  url.slice(qIdx + 1).split('&').forEach(pair => {
    const eq = pair.indexOf('=');
    if (eq === -1) return;
    const k = pair.substring(0, eq);
    const v = pair.substring(eq + 1);
    if (!k) return;
    try { params[k] = decodeURIComponent(v.replace(/\+/g, ' ')); } catch { params[k] = v; }
  });
  return params;
}

const FAIL_STATUS = ['error', 'fail', 'failed', 'declined', 'denied', 'unauthorized', 'canceled', 'cancelled', 'refused'];

/** Interpreta o retorno da Stone: sucesso quando não há `reason`/status de falha. */
export function interpretStoneResponse(data: StoneResponse, expectAtk: boolean): StoneResult {
  const reason = (data.reason ?? data.error ?? data.error_message ?? '').trim();
  const status = (data.status ?? data.result ?? '').trim().toLowerCase();
  const failed = !!reason || FAIL_STATUS.includes(status);
  if (failed) {
    const msg = reason || `Operação não aprovada (${status || 'sem status'})`;
    return { success: false, error: msg, canceledByUser: /cancel/i.test(status) || /cancelad/i.test(msg), data };
  }
  if (expectAtk && !data.atk) {
    return { success: false, error: 'Retorno da Stone sem ATK.', data };
  }
  return { success: true, data };
}

export function useStoneDeepLink() {
  const [isWaiting, setIsWaiting] = useState(false);
  const resolveRef = useRef<((r: StoneResult) => void) | null>(null);
  const expectAtkRef = useRef(true);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLinkUrl);
    return () => subscription.remove();
  }, []);

  function handleDeepLinkUrl({ url }: { url: string }) {
    if (!url.startsWith(`${RETURN_SCHEME}://`)) return;
    if (url.startsWith(CIELO_CALLBACK_PREFIX)) return; // callback da Cielo
    if (!resolveRef.current) return;                    // nenhuma operação Stone pendente
    try {
      const data = parseQuery(url);
      settle(interpretStoneResponse(data, expectAtkRef.current));
    } catch {
      settle({ success: false, error: 'Erro ao processar retorno da Stone.' });
    }
  }

  function settle(result: StoneResult) {
    setIsWaiting(false);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }

  function open(uri: string, expectAtk: boolean, openError: string): Promise<StoneResult> {
    setIsWaiting(true);
    expectAtkRef.current = expectAtk;
    return new Promise<StoneResult>(resolve => {
      resolveRef.current = resolve;
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
    if (resolveRef.current) settle({ success: false, error: 'Operação cancelada pelo operador.', canceledByUser: true });
  }, []);

  return { sendPayment, sendCancel, printText, cancelWait, isWaiting };
}
