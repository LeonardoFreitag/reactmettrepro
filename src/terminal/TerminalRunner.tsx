/**
 * Poller do modo "Terminal de pagamento" (attended).
 *
 * Quando `modoTerminalAtivo` e `terminalId` estão configurados e o app está em
 * primeiro plano numa tela de plantão (a de espera ou a lista de comandas),
 * consulta `GET /cobrancas/pendentes?terminalId=` a cada 2,5 s.
 * Ao receber uma cobrança: `POST /claim` (409 → ignora) e navega para a tela
 * `terminal`, que dispara o Deep Link e devolve o desfecho.
 *
 * Também recupera, ao iniciar, uma cobrança que ficou `sent_to_terminal` neste
 * aparelho (id guardado em AsyncStorage) e pergunta ao operador o que houve.
 *
 * Montado uma única vez em App.tsx (não renderiza nada).
 */
import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/combineReducers';
import { navigationRef } from '../routes/navigationRef';
import { claimCobranca, fetchCobranca, fetchPendentes } from '../sync/cobrancasApi';
import { enqueuePatch, getLocalStatusMap } from '../sync/outbox';
import { getTerminalState, setApiOnline, setBusy, getCurrentCobrancaId, setCurrentCobrancaId } from './state';
import { ehRotaDePlantao, modoTerminalConfigurado } from './ativo';

const POLL_MS = 2500;

export function TerminalRunner() {
  const config = useSelector((s: RootState) => s.configEdit.data);
  const company = useSelector((s: RootState) => s.companyEdit.data);
  // Sem provedor configurado o poller não atende (senão consumiria e recusaria todas as cobranças).
  const active = modoTerminalConfigurado(config) && !!company.ip;
  const terminalId = config.terminalId;
  const provider = config.provider;

  const inFlight = useRef(false);
  const recoveredFor = useRef<string | null>(null);

  // ── Recuperação após reinício ───────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const key = `${company.ip}|${terminalId}`;
    if (recoveredFor.current === key) return;
    recoveredFor.current = key;

    (async () => {
      const id = await getCurrentCobrancaId();
      if (!id) return;
      // A resposta da maquineta pode ter chegado no cold start (Linking.getInitialURL):
      // nesse caso o inbox já enfileirou o PATCH e não há o que perguntar.
      if ((await getLocalStatusMap())[id] === 'pending_sync') {
        await setCurrentCobrancaId(null);
        return;
      }
      let cobranca = null;
      try {
        cobranca = await fetchCobranca(id);
      } catch {
        return; // sem rede agora — tenta no próximo início
      }
      if (!cobranca || cobranca.status !== 'sent_to_terminal') {
        await setCurrentCobrancaId(null);
        return;
      }
      const valor = (cobranca.valorCents / 100).toFixed(2);
      Alert.alert(
        'Cobrança em aberto',
        `A cobrança "${cobranca.descricao ?? cobranca.externalRef ?? id}" de R$ ${valor} ficou em aberto quando o app foi fechado.\n\nEla foi paga na maquineta?`,
        [
          {
            text: 'Não — cancelar',
            style: 'destructive',
            onPress: async () => {
              await enqueuePatch(id, {
                terminalId, provider, status: 'canceled',
                motivoErro: 'Cancelada: app reiniciou antes do retorno da maquineta', pagamento: null,
              });
              await setCurrentCobrancaId(null);
            },
          },
          {
            text: 'Sim, foi paga',
            onPress: async () => {
              // Sem retorno do provedor não gravamos approved: marcamos erro com motivo
              // para o caixa conferir na maquineta e lançar manualmente.
              await enqueuePatch(id, {
                terminalId, provider, status: 'error',
                motivoErro: 'App reiniciou após o pagamento: conferir comprovante na maquineta e lançar manualmente',
                pagamento: null,
              });
              await setCurrentCobrancaId(null);
            },
          },
        ],
        { cancelable: false },
      );
    })();
  }, [active, company.ip, terminalId, provider]);

  // ── Polling ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    let alive = true;

    async function tick() {
      if (!alive || inFlight.current) return;
      if (AppState.currentState !== 'active') return;
      if (getTerminalState().busy || getTerminalState().providerWaiting > 0) return;
      if (!navigationRef.isReady()) return;
      // Só atende a partir das telas de plantão (espera e lista de comandas): evita abrir
      // o Terminal por baixo de um Modal (FechamentoModal / MetodoPagamentoModal) e duas
      // esperas de Deep Link simultâneas.
      if (!ehRotaDePlantao(navigationRef.getCurrentRoute()?.name)) return;

      inFlight.current = true;
      try {
        const lista = await fetchPendentes(terminalId);
        setApiOnline(true);
        const cobranca = lista[0];
        if (!cobranca || getTerminalState().busy) return;

        setBusy(true);
        let claimed;
        try {
          claimed = await claimCobranca(cobranca.id, terminalId);
        } catch (err: any) {
          setApiOnline(false, err?.message ?? 'claim');
          setBusy(false);
          return;
        }
        if (!claimed.ok) { setBusy(false); return; } // outro terminal / encerrada

        await setCurrentCobrancaId(cobranca.id);
        navigationRef.navigate('terminal', { cobranca: claimed.cobranca });
        // `busy` volta a false quando a tela Terminal encerrar.
      } catch (err: any) {
        setApiOnline(false, err?.message ?? 'rede');
      } finally {
        inFlight.current = false;
      }
    }

    const timer = setInterval(tick, POLL_MS);
    void tick();
    return () => { alive = false; clearInterval(timer); };
  }, [active, terminalId, company.ip]);

  return null;
}
