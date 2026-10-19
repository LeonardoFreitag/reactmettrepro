/**
 * Estado compartilhado do modo "Terminal de pagamento" (attended):
 * - `busy`: uma cobrança está sendo atendida (o poller pausa);
 * - `apiOnline`: último ciclo do poller conseguiu falar com a API;
 * - `falhasSeguidas` / `ultimaConsultaOkEm`: alimentam o aviso de "sem comunicação"
 *   da tela de espera, que só acusa depois de algumas falhas seguidas para não
 *   confundir um soluço de rede com queda;
 * - id da cobrança em andamento persistido em AsyncStorage (recuperação após reinício).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const KEY_CURRENT = 'terminal.current';
/** Tag do expo-keep-awake: a tela não apaga enquanto a maquineta aguarda o cliente (Pix demora). */
const KEEP_AWAKE_TAG = 'maquineta';

/** Falhas seguidas antes de a tela de espera declarar "sem comunicação". */
export const FALHAS_ATE_AVISAR = 3;

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() { listeners.forEach(l => { try { l(); } catch {} }); }

const state = {
  busy: false,
  apiOnline: true,
  lastError: '' as string,
  /** Nº de provedores aguardando retorno do app da maquineta (qualquer tela). */
  providerWaiting: 0,
  /** Consultas ao `GET /cobrancas/pendentes` que falharam em sequência. */
  falhasSeguidas: 0,
  /** Momento (ms) da última consulta bem-sucedida; null antes da primeira. */
  ultimaConsultaOkEm: null as number | null,
};

export type TerminalState = typeof state;

export function getTerminalState(): TerminalState { return { ...state }; }

export function setBusy(v: boolean) { if (state.busy !== v) { state.busy = v; notify(); } }

/**
 * Resultado de um ciclo do poller. Sempre atualiza os contadores (mesmo quando
 * `apiOnline` não muda), porque é a sequência de falhas que interessa.
 */
export function setApiOnline(v: boolean, err = '') {
  const antes = { online: state.apiOnline, erro: state.lastError, falhas: state.falhasSeguidas, ok: state.ultimaConsultaOkEm };
  state.apiOnline = v;
  state.lastError = err;
  if (v) {
    state.falhasSeguidas = 0;
    state.ultimaConsultaOkEm = Date.now();
  } else {
    state.falhasSeguidas += 1;
  }
  const mudou = antes.online !== state.apiOnline || antes.erro !== state.lastError
    || antes.falhas !== state.falhasSeguidas || antes.ok !== state.ultimaConsultaOkEm;
  if (mudou) notify();
}

/** true quando as falhas passaram do limite — é o que a tela de espera mostra. */
export function semComunicacao(s: TerminalState = state): boolean {
  return s.falhasSeguidas >= FALHAS_ATE_AVISAR;
}

export function incProviderWaiting() {
  state.providerWaiting += 1;
  if (state.providerWaiting === 1) activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
  notify();
}
export function decProviderWaiting() {
  state.providerWaiting = Math.max(0, state.providerWaiting - 1);
  if (state.providerWaiting === 0) deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
  notify();
}
export function subscribeTerminal(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export async function setCurrentCobrancaId(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(KEY_CURRENT, id);
  else await AsyncStorage.removeItem(KEY_CURRENT);
}
export async function getCurrentCobrancaId(): Promise<string | null> {
  try { return await AsyncStorage.getItem(KEY_CURRENT); } catch { return null; }
}
