/**
 * Parser puro do retorno da Stone SmartPOS (Deeplink, sem SDK).
 *
 * Retorno no scheme do app (`order://…`, exceto `order://response`, que é da
 * Cielo) com os parâmetros na query string: atk, authorization_code, brand,
 * cardholder_name, itk, pan, entry_mode, installment_count, transaction_type,
 * order_id, amount, e `reason`/`status` em erro. Mesmos nomes do app
 * "AutoMax Stone POS" (homologado 14/09/2026).
 *
 * Separado do hook para o inbox global (cold start) e para os testes.
 */
import type { TransactionType } from './types';
import { CIELO_CALLBACK_URL } from './cieloCallback';

export const STONE_RETURN_SCHEME = 'order';

export type StoneResponse = Record<string, string>;

export type StoneResult =
  | { success: true; data: StoneResponse }
  | { success: false; error: string; canceledByUser?: boolean; data?: StoneResponse };

export function isStoneCallbackUrl(url: string | null | undefined): boolean {
  return !!url && url.startsWith(`${STONE_RETURN_SCHEME}://`) && !url.startsWith(CIELO_CALLBACK_URL);
}

export function parseStoneQuery(url: string): StoneResponse {
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

/** `order_id` ecoado pela Stone (= `reference` enviada no `payment-app://pay`). */
export function stoneReferenceOf(data: StoneResponse | undefined): string {
  return String(data?.order_id ?? data?.reference ?? '');
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
