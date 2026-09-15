import { useState, useRef, useCallback } from 'react';
import { setUrl } from '../services/api';

export type NfceStatus = 'idle' | 'aguardando' | 'emitida' | 'erro' | 'timeout';

export type NfceDados = {
  id: number;
  chaveAcesso: string;
  numeroNota: number;
  serie: number;
  qrcodeUrl: string;
  danfeTexto: string;
  valorTotal: number;
};

type NfceState = {
  status: NfceStatus;
  dados: NfceDados | null;
  mensagemErro: string | null;
};

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS       = 90_000;

export function useNfce() {
  const [state, setState] = useState<NfceState>({
    status:       'idle',
    dados:        null,
    mensagemErro: null,
  });

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const solicitacaoIdRef = useRef<number | null>(null);
  const ipRef   = useRef<string>('');
  const portaRef = useRef<string | undefined>(undefined);

  function stopPolling() {
    if (intervalRef.current)  clearInterval(intervalRef.current);
    if (timeoutRef.current)   clearTimeout(timeoutRef.current);
    intervalRef.current  = null;
    timeoutRef.current   = null;
  }

  function startPolling() {
    intervalRef.current = setInterval(async () => {
      const id = solicitacaoIdRef.current;
      if (!id) return;

      try {
        const api = setUrl(ipRef.current, portaRef.current);
        const { data } = await api.get(`/nfce/status/${id}`);

        if (data.status === 'EMITIDA') {
          stopPolling();
          setState({
            status: 'emitida',
            dados: {
              id:           data.id,
              chaveAcesso:  data.chaveAcesso  ?? '',
              numeroNota:   data.numeroNota   ?? 0,
              serie:        data.serie        ?? 0,
              qrcodeUrl:    data.qrcodeUrl    ?? '',
              danfeTexto:   data.danfeTexto   ?? '',
              valorTotal:   data.valorTotal   ?? 0,
            },
            mensagemErro: null,
          });
        } else if (data.status === 'ERRO') {
          stopPolling();
          setState({
            status:       'erro',
            dados:        null,
            mensagemErro: data.mensagemErro ?? 'Erro desconhecido na emissão.',
          });
        }
        // PENDENTE ou PROCESSANDO: continua polling
      } catch {
        // Falha de rede: ignora e tenta no próximo ciclo
      }
    }, POLL_INTERVAL_MS);

    // Timeout global
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setState({
        status:       'timeout',
        dados:        null,
        mensagemErro: 'Tempo esgotado. Verifique a emissão no sistema.',
      });
    }, TIMEOUT_MS);
  }

  /**
   * Solicita a emissão de uma NFC-e e inicia o polling de status.
   */
  const solicitar = useCallback(async (params: {
    ip: string;
    porta?: string;
    codMesa: number;
    cpfCliente?: string;
  }): Promise<void> => {
    stopPolling();
    setState({ status: 'aguardando', dados: null, mensagemErro: null });

    ipRef.current    = params.ip;
    portaRef.current = params.porta;

    try {
      const api = setUrl(params.ip, params.porta);
      const { data } = await api.post('/nfce/solicitar', {
        codMesa:    params.codMesa,
        cpfCliente: params.cpfCliente ?? null,
      });

      solicitacaoIdRef.current = data.id;
      startPolling();
    } catch {
      setState({
        status:       'erro',
        dados:        null,
        mensagemErro: 'Não foi possível enviar a solicitação para o servidor.',
      });
    }
  }, []);

  /**
   * Cancela o polling (ex: operador pulou a emissão).
   */
  const cancelar = useCallback(() => {
    stopPolling();
    setState({ status: 'idle', dados: null, mensagemErro: null });
  }, []);

  /**
   * Reseta o estado para permitir nova emissão.
   */
  const resetar = useCallback(() => {
    stopPolling();
    solicitacaoIdRef.current = null;
    setState({ status: 'idle', dados: null, mensagemErro: null });
  }, []);

  return {
    status:       state.status,
    dados:        state.dados,
    mensagemErro: state.mensagemErro,
    solicitar,
    cancelar,
    resetar,
  };
}
