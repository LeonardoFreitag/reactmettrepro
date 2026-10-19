/**
 * Chamadas HTTP do módulo de cobranças (/cobrancas/*), com X-Api-Key via setUrl.
 * A base URL vem da empresa selecionada (companyEdit) no Redux.
 */
import { AxiosInstance } from 'axios';
import { store } from '../store/createStore';
import { setUrl } from '../services/api';
import { Cobranca } from '../models/CobrancaModel';
import { PaymentOk, PaymentProviderName, TransactionType } from '../payment/types';

export function getApi(): AxiosInstance | null {
  const company = store.getState().companyEdit.data;
  if (!company?.ip) return null;
  return setUrl(company.ip, company.porta);
}

export function getConfig() {
  return store.getState().configEdit.data;
}

export type DesfechoStatus = 'approved' | 'declined' | 'canceled' | 'error';

export type DesfechoBody = {
  terminalId: string;
  provider: PaymentProviderName;
  status: DesfechoStatus;
  motivoErro?: string | null;
  pagamento?: {
    transactionType: TransactionType;
    installments: number;
    amountCents: number;
    providerData: Record<string, unknown>;
    rawResponse: unknown;
  } | null;
};

/** Monta o corpo do PATCH a partir do resultado do provedor. */
export function buildDesfecho(
  terminalId: string,
  provider: PaymentProviderName,
  result: { success: true; value: PaymentOk } | { success: false; error: string; canceledByUser?: boolean },
): DesfechoBody {
  if (result.success) {
    const v = result.value;
    return {
      terminalId, provider, status: 'approved', motivoErro: null,
      pagamento: {
        transactionType: v.transactionType,
        installments: Math.max(v.installments, 1),
        amountCents: v.amountCents,
        providerData: v.providerData,
        rawResponse: v.rawResponse,
      },
    };
  }
  return {
    terminalId, provider,
    status: result.canceledByUser ? 'canceled' : 'declined',
    motivoErro: (result.error ?? '').slice(0, 200),
    pagamento: null,
  };
}

// ── Chamadas diretas (usadas quando há rede; a fila de saída usa as mesmas URLs) ──

export async function fetchPendentes(terminalId: string): Promise<Cobranca[]> {
  const api = getApi();
  if (!api) throw new Error('Empresa não selecionada');
  const { data } = await api.get<Cobranca[]>('/cobrancas/pendentes', { params: { terminalId }, timeout: 4000 });
  return data ?? [];
}

export async function fetchCards(filtro: { entregador?: number; mesas?: boolean }): Promise<Cobranca[]> {
  const api = getApi();
  if (!api) throw new Error('Empresa não selecionada');
  const params: Record<string, string | number> = {};
  if (filtro.entregador != null) params.entregador = filtro.entregador;
  if (filtro.mesas) params.mesas = 1;
  const { data } = await api.get<Cobranca[]>('/cobrancas/cards', { params, timeout: 6000 });
  return data ?? [];
}

export async function fetchCobranca(id: string): Promise<Cobranca | null> {
  const api = getApi();
  if (!api) throw new Error('Empresa não selecionada');
  try {
    const { data } = await api.get<Cobranca>(`/cobrancas/${id}`, { timeout: 4000 });
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

/** POST claim direto. Devolve 'ok' | 'conflict' | lança em erro de rede. */
export async function claimCobranca(id: string, terminalId: string): Promise<{ ok: true; cobranca: Cobranca } | { ok: false; status: string }> {
  const api = getApi();
  if (!api) throw new Error('Empresa não selecionada');
  try {
    const { data } = await api.post<Cobranca>(`/cobrancas/${id}/claim`, { terminalId }, { timeout: 5000 });
    return { ok: true, cobranca: data };
  } catch (err: any) {
    if (err?.response?.status === 409) return { ok: false, status: String(err.response.data?.status ?? '') };
    throw err;
  }
}

export async function cancelarCobranca(id: string): Promise<void> {
  const api = getApi();
  if (!api) throw new Error('Empresa não selecionada');
  await api.post(`/cobrancas/${id}/cancelar`, {}, { timeout: 5000 });
}
