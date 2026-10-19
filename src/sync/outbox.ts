/**
 * Fila de saída persistida (AsyncStorage) para desfechos de cobrança.
 *
 * Tudo que o app precisa contar à API sobre uma cobrança (claim, PATCH de
 * desfecho, cancelar) passa por aqui: se a API estiver fora do ar, o item fica
 * guardado e o *drainer* reenvia — a cada 10 s, ao voltar ao primeiro plano e
 * sob demanda (`drainNow`). Um `PATCH` nunca é descartado por tempo: a
 * transação já aconteceu na maquineta.
 *
 * Regras de remoção: 2xx; `409` em `claim` (outro terminal atendeu / já
 * encerrada); `PATCH` repetido devolve 200 (API idempotente). `4xx` diferente
 * de 409 vai para `erros` (mostrado na tela Cobranças). Erro de rede / 5xx:
 * mantém e interrompe o ciclo (processamento em ordem).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { getApi } from './cobrancasApi';
import type { DesfechoBody } from './cobrancasApi';

const KEY_OUTBOX = 'outbox';
const KEY_ERROS = 'outbox.erros';
const KEY_CONCLUIDAS = 'cobrancas.concluidas';
const DRAIN_INTERVAL_MS = 10_000;
const MAX_CONCLUIDAS = 50;

export type OutboxTipo = 'claim' | 'patch' | 'cancelar';

export type OutboxItem = {
  id: string;            // id do item na fila
  tipo: OutboxTipo;
  cobrancaId: string;
  body: Record<string, unknown>;
  criadoEm: string;      // ISO
  tentativas: number;
  ultimoErro?: string;
};

export type OutboxErro = OutboxItem & { httpStatus: number; resposta?: unknown; em: string };

/** Registro local de card já cobrado nesta maquineta (para a seção "Concluídas"). */
export type CobrancaConcluida = {
  cobrancaId: string;
  descricao: string;
  valorCents: number;
  status: 'approved' | 'declined' | 'canceled' | 'error';
  em: string;            // ISO
};

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() { listeners.forEach(l => { try { l(); } catch {} }); }

/** Assina mudanças (fila, erros, concluídas). Devolve o unsubscribe. */
export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

// ── Persistência ────────────────────────────────────────────────────────────

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const getQueue = () => readJson<OutboxItem[]>(KEY_OUTBOX, []);
export const getErros = () => readJson<OutboxErro[]>(KEY_ERROS, []);
export const getConcluidas = () => readJson<CobrancaConcluida[]>(KEY_CONCLUIDAS, []);

export async function clearErros(): Promise<void> {
  await writeJson(KEY_ERROS, []);
  notify();
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Enfileira um item e tenta drenar em seguida (não espera). */
export async function enqueue(tipo: OutboxTipo, cobrancaId: string, body: Record<string, unknown>): Promise<OutboxItem> {
  const item: OutboxItem = { id: newId(), tipo, cobrancaId, body, criadoEm: new Date().toISOString(), tentativas: 0 };
  const queue = await getQueue();
  queue.push(item);
  await writeJson(KEY_OUTBOX, queue);
  notify();
  void drainNow();
  return item;
}

export const enqueueClaim = (cobrancaId: string, terminalId: string) =>
  enqueue('claim', cobrancaId, { terminalId });
export const enqueuePatch = (cobrancaId: string, desfecho: DesfechoBody) =>
  enqueue('patch', cobrancaId, desfecho as unknown as Record<string, unknown>);
export const enqueueCancelar = (cobrancaId: string) =>
  enqueue('cancelar', cobrancaId, {});

export async function registrarConcluida(c: CobrancaConcluida): Promise<void> {
  const list = (await getConcluidas()).filter(x => x.cobrancaId !== c.cobrancaId);
  list.unshift(c);
  await writeJson(KEY_CONCLUIDAS, list.slice(0, MAX_CONCLUIDAS));
  notify();
}

/** Estado local de uma cobrança derivado da fila: em cobrança / a sincronizar. */
export async function getLocalStatusMap(): Promise<Record<string, 'claimed' | 'pending_sync'>> {
  const queue = await getQueue();
  const map: Record<string, 'claimed' | 'pending_sync'> = {};
  for (const it of queue) {
    if (it.tipo === 'patch' || it.tipo === 'cancelar') map[it.cobrancaId] = 'pending_sync';
    else if (!map[it.cobrancaId]) map[it.cobrancaId] = 'claimed';
  }
  return map;
}

// ── Drainer ─────────────────────────────────────────────────────────────────

let draining = false;
let timer: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove(): void } | null = null;

type SendResult = { done: true } | { done: false; fatal: false } | { done: false; fatal: true; httpStatus: number; resposta?: unknown };

async function send(item: OutboxItem): Promise<SendResult> {
  const api = getApi();
  if (!api) return { done: false, fatal: false };
  try {
    if (item.tipo === 'claim') {
      await api.post(`/cobrancas/${item.cobrancaId}/claim`, item.body, { timeout: 8000 });
    } else if (item.tipo === 'patch') {
      await api.patch(`/cobrancas/${item.cobrancaId}`, item.body, { timeout: 15000 });
    } else {
      await api.post(`/cobrancas/${item.cobrancaId}/cancelar`, {}, { timeout: 8000 });
    }
    return { done: true };
  } catch (err: any) {
    const status: number | undefined = err?.response?.status;
    if (!status) return { done: false, fatal: false };           // rede
    if (status >= 500) return { done: false, fatal: false };     // servidor — tenta depois
    if (status === 409 && item.tipo === 'claim') return { done: true }; // outro terminal / encerrada
    if (status === 409 && item.tipo === 'cancelar') return { done: true }; // já encerrada
    return { done: false, fatal: true, httpStatus: status, resposta: err?.response?.data };
  }
}

/** Remove um item da fila persistida relendo-a (segura contra enqueue concorrente). */
async function removeFromQueue(id: string): Promise<void> {
  const cur = await getQueue();
  await writeJson(KEY_OUTBOX, cur.filter(i => i.id !== id));
}

/**
 * Processa a fila em ordem. Seguro chamar em paralelo (reentrância protegida).
 * Nunca grava uma cópia local da fila: cada remoção/atualização relê o storage,
 * para não apagar itens enfileirados durante um `send` (ex.: PATCH gravado
 * enquanto o app voltava ao foreground).
 */
export async function drainNow(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    const queue = await getQueue();
    if (queue.length === 0) return;
    let changed = false;

    for (const item of queue) {
      const r = await send(item);
      if (r.done) {
        await removeFromQueue(item.id);
        changed = true;
        continue;
      }
      if (r.fatal) {
        const erros = await getErros();
        erros.unshift({ ...item, httpStatus: r.httpStatus, resposta: r.resposta, em: new Date().toISOString() });
        await writeJson(KEY_ERROS, erros.slice(0, 100));
        await removeFromQueue(item.id);
        changed = true;
        continue;
      }
      // erro de rede: registra tentativa e para (mantém a ordem)
      const cur = await getQueue();
      await writeJson(KEY_OUTBOX, cur.map(i => i.id === item.id ? { ...i, tentativas: i.tentativas + 1 } : i));
      changed = true;
      break;
    }

    if (changed) notify();
  } finally {
    draining = false;
  }
}

/** Inicia o drainer (idempotente): intervalo de 10 s + volta ao primeiro plano. */
export function startDrainer(): void {
  if (timer) return;
  timer = setInterval(() => { void drainNow(); }, DRAIN_INTERVAL_MS);
  appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') void drainNow();
  });
  void drainNow();
}

export function stopDrainer(): void {
  if (timer) { clearInterval(timer); timer = null; }
  if (appStateSub) { appStateSub.remove(); appStateSub = null; }
}
