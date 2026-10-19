import { useEffect, useState } from 'react';
import {
  subscribe, getQueue, getErros, getConcluidas, getLocalStatusMap,
  OutboxItem, OutboxErro, CobrancaConcluida,
} from './outbox';

export type OutboxSnapshot = {
  queue: OutboxItem[];
  erros: OutboxErro[];
  concluidas: CobrancaConcluida[];
  localStatus: Record<string, 'claimed' | 'pending_sync'>;
  pendentes: number;
};

const EMPTY: OutboxSnapshot = { queue: [], erros: [], concluidas: [], localStatus: {}, pendentes: 0 };

/** Snapshot reativo da fila de saída (badge "N a sincronizar", erros, concluídas). */
export function useOutbox(): OutboxSnapshot {
  const [snap, setSnap] = useState<OutboxSnapshot>(EMPTY);

  useEffect(() => {
    let alive = true;
    async function refresh() {
      const [queue, erros, concluidas, localStatus] = await Promise.all([
        getQueue(), getErros(), getConcluidas(), getLocalStatusMap(),
      ]);
      if (alive) setSnap({ queue, erros, concluidas, localStatus, pendentes: queue.length });
    }
    refresh();
    const unsub = subscribe(refresh);
    return () => { alive = false; unsub(); };
  }, []);

  return snap;
}
