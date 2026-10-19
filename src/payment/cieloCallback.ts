/**
 * Parser puro do callback da Cielo Smart (`order://response?response=<base64>&responsecode=<n>`).
 *
 * Separado do hook `useCieloDeepLink` para ser usado também pelo inbox global
 * (cold start via `Linking.getInitialURL()`) e testado sem React Native.
 */
import { decodeBase64 } from '../utils/base64';
import { CieloPaymentError, CieloPaymentResponse } from '../models/CieloModel';

export const CIELO_CALLBACK_URL = 'order://response';

export type CieloResult =
  | { success: true; data: CieloPaymentResponse }
  | { success: false; error: string; errorCode?: number };

export function isCieloCallbackUrl(url: string | null | undefined): boolean {
  return !!url && url.startsWith(CIELO_CALLBACK_URL);
}

/** Query string → objeto (sem depender de URLSearchParams, ausente no Hermes antigo). */
export function parseQueryString(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const qIdx = url.indexOf('?');
  if (qIdx === -1) return params;
  url.slice(qIdx + 1).split('&').forEach(pair => {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) return;
    const k = pair.substring(0, eqIdx);
    const v = pair.substring(eqIdx + 1);
    if (!k) return;
    try { params[k] = decodeURIComponent(v); } catch { params[k] = v; }
  });
  return params;
}

/**
 * Decodifica a resposta da Cielo. Nunca lança: qualquer problema vira
 * `{ success: false, error }`.
 */
export function parseCieloCallbackUrl(url: string): CieloResult {
  try {
    const params = parseQueryString(url);
    const responseB64 = params['response'];
    if (!responseB64) return { success: false, error: 'Resposta inválida da Cielo.' };

    let json: string;
    try {
      // Emulador retorna base64 com quebras de linha (MIME wrap) — remover antes de decodificar.
      json = decodeBase64(responseB64.replace(/\s+/g, ''));
    } catch {
      return { success: false, error: 'Erro ao decodificar resposta da Cielo.' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(json);
    } catch {
      return { success: false, error: 'Erro ao interpretar JSON da Cielo.' };
    }

    if (parsed && typeof parsed.code === 'number') {
      const err = parsed as CieloPaymentError;
      return { success: false, error: err.reason, errorCode: err.code };
    }
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Resposta inválida da Cielo.' };
    }
    return { success: true, data: parsed as CieloPaymentResponse };
  } catch {
    return { success: false, error: 'Erro ao processar retorno da Cielo.' };
  }
}

/** `reference` ecoada pela Cielo na ordem (usada para casar com o pagamento pendente). */
export function cieloReferenceOf(result: CieloResult): string {
  return result.success ? String(result.data?.reference ?? '') : '';
}
