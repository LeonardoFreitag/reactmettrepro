export type PaymentProviderName = 'CIELO' | 'STONE';

export interface ConfigModel {
  ip: string;
  destino: boolean;
  keyboardHasLetters: boolean;
  cieloClientId: string;
  cieloAccessToken: string;
  cobrServico: string;   // 'S' | 'N'
  perServico: number;    // ex: 10 = 10%

  // ── Maquineta / cobranças (15/09/2026) ──────────────────────────────────
  /** Provedor de pagamento deste aparelho. Instalações antigas: 'CIELO'. */
  provider: PaymentProviderName;
  /** Identificador desta maquineta — o caixa configura o mesmo valor no PDV. */
  terminalId: string;
  /** Enviada em X-Api-Key nas rotas /cobrancas e POST /pagamentos (vazia = não envia). */
  apiKey: string;
  /** Liga o polling do modo "Terminal de pagamento" (attended). */
  modoTerminalAtivo: boolean;
  /** Mostra a tela "Cobranças" (cards detached). */
  cobrancasAtivas: boolean;
}

export const CONFIG_DEFAULTS: ConfigModel = {
  ip: '',
  destino: false,
  keyboardHasLetters: false,
  cieloClientId: '',
  cieloAccessToken: '',
  cobrServico: 'N',
  perServico: 0,
  provider: 'CIELO',
  terminalId: '',
  apiKey: '',
  modoTerminalAtivo: false,
  cobrancasAtivas: false,
};

/** Preenche campos ausentes (configs salvas por versões antigas do app). */
export function normalizeConfig(partial: Partial<ConfigModel> | null | undefined): ConfigModel {
  const p = partial ?? {};
  return {
    ...CONFIG_DEFAULTS,
    ...p,
    provider: p.provider === 'STONE' ? 'STONE' : 'CIELO',
    terminalId: (p.terminalId ?? '').trim(),
    apiKey: (p.apiKey ?? '').trim(),
    modoTerminalAtivo: !!p.modoTerminalAtivo,
    cobrancasAtivas: !!p.cobrancasAtivas,
  };
}
