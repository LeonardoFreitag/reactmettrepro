/**
 * Tela "Terminal de pagamento" (attended): aberta pelo TerminalRunner quando o
 * caixa enfileira uma cobrança para esta maquineta. Dispara o Deep Link
 * sozinha (pagamento ou estorno), mostra "Aguardando cliente…" e devolve o
 * desfecho pela fila de saída.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { usePaymentProvider, transactionTypeLabel } from '../../payment';
import { Cobranca, ORIGEM_LABEL } from '../../models/CobrancaModel';
import { MetodoPagamentoModal, MetodoEscolhido } from '../../components/MetodoPagamentoModal';
import { executarCobranca, descricaoCobranca } from '../../sync/executarCobranca';
import { enqueuePatch } from '../../sync/outbox';
import { fetchCobranca } from '../../sync/cobrancasApi';
import { setBusy, setCurrentCobrancaId } from '../../terminal/state';

type Nav = NativeStackNavigationProp<AppStackParamList, 'terminal'>;
type Rt = RouteProp<AppStackParamList, 'terminal'>;

type Fase = 'escolher_tipo' | 'aguardando' | 'resultado';
const RESULT_MS = 1500;
const CANCEL_POLL_MS = 2500;

export function Terminal() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const insets = useSafeAreaInsets();
  const config = useSelector((s: RootState) => s.configEdit.data);
  const provider = usePaymentProvider();

  const cobranca: Cobranca = params.cobranca;
  const terminalId = config.terminalId;
  const isEstorno = cobranca.operacao === 'C';
  const precisaTipo = !isEstorno && cobranca.tipoPre == null;

  const [fase, setFase] = useState<Fase>(precisaTipo ? 'escolher_tipo' : 'aguardando');
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const started = useRef(false);
  const finished = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBusy(true);
    return () => {
      setBusy(false);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Bloqueia o botão voltar enquanto a cobrança está em andamento.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => fase !== 'resultado');
    return () => sub.remove();
  }, [fase]);

  async function encerrar(ok: boolean, texto: string) {
    if (finished.current) return;
    finished.current = true;
    setResultado({ ok, texto });
    setFase('resultado');
    try { await setCurrentCobrancaId(null); } catch {}
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setBusy(false);
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('comandas');
    }, RESULT_MS);
  }

  async function disparar(metodo: MetodoEscolhido | null) {
    if (started.current) return;
    started.current = true;
    setFase('aguardando');
    try {
      if (!provider.isConfigured()) {
        await enqueuePatch(cobranca.id, {
          terminalId, provider: provider.name, status: 'error',
          motivoErro: 'Provedor de pagamento não configurado nesta maquineta', pagamento: null,
        });
        await encerrar(false, 'Maquineta não configurada');
        return;
      }
      const { desfecho, result } = await executarCobranca(provider, terminalId, cobranca, metodo);
      if (desfecho.status === 'approved') {
        const auth = result.success ? result.authCode : '';
        await encerrar(true, isEstorno ? 'Estorno aprovado' : `Aprovado${auth ? ` — Aut. ${auth}` : ''}`);
      } else if (desfecho.status === 'canceled') {
        await encerrar(false, 'Cancelado');
      } else {
        await encerrar(false, desfecho.motivoErro || 'Não aprovado');
      }
    } catch (err: any) {
      try {
        await enqueuePatch(cobranca.id, {
          terminalId, provider: provider.name, status: 'error',
          motivoErro: String(err?.message ?? err).slice(0, 200), pagamento: null,
        });
      } catch {}
      await encerrar(false, 'Erro ao acionar a maquineta');
    }
  }

  // Dispara automaticamente quando não precisa escolher tipo.
  useEffect(() => {
    if (!precisaTipo) void disparar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enquanto o Deep Link ainda não abriu (escolha de tipo), o caixa pode pedir cancelamento.
  useEffect(() => {
    if (fase !== 'escolher_tipo') return;
    const t = setInterval(async () => {
      try {
        const atual = await fetchCobranca(cobranca.id);
        if (atual?.cancelRequested || (atual && atual.status !== 'sent_to_terminal')) {
          await cancelarLocal('Cancelamento solicitado pelo caixa');
        }
      } catch {}
    }, CANCEL_POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  async function cancelarLocal(motivo: string) {
    if (started.current) return;
    started.current = true;
    await enqueuePatch(cobranca.id, {
      terminalId, provider: provider.name, status: 'canceled', motivoErro: motivo, pagamento: null,
    });
    await encerrar(false, 'Cancelado');
  }

  const valor = (cobranca.valorCents / 100).toFixed(2);
  const tipo = cobranca.tipoPre ? transactionTypeLabel(cobranca.tipoPre, cobranca.parcelasPre) : '';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 16, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.badgeRow}>
        <Feather name={isEstorno ? 'rotate-ccw' : 'credit-card'} size={16} color={COLORS.CYAN_300} />
        <Text style={styles.badge}>{isEstorno ? 'ESTORNO' : 'COBRANÇA'} · {ORIGEM_LABEL[cobranca.origem] ?? cobranca.origem} · Terminal {terminalId}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.desc}>{descricaoCobranca(cobranca)}</Text>
        <Text style={styles.valor}>R$ {valor}</Text>
        {!!tipo && <Text style={styles.tipo}>{tipo}</Text>}

        {fase === 'aguardando' && (
          <View style={styles.waitBox}>
            <ActivityIndicator size="large" color={COLORS.CYAN_300} />
            <Text style={styles.waitText}>{isEstorno ? 'Estornando na maquineta…' : 'Aguardando cliente…'}</Text>
            <Text style={styles.waitSub}>A tela do provedor assume o controle. Cancele por lá se necessário.</Text>
          </View>
        )}

        {fase === 'resultado' && resultado && (
          <View style={styles.waitBox}>
            <Feather name={resultado.ok ? 'check-circle' : 'x-circle'} size={64} color={resultado.ok ? COLORS.SUCCESS : COLORS.DANGER} />
            <Text style={[styles.resultText, { color: resultado.ok ? COLORS.SUCCESS : COLORS.DANGER }]}>{resultado.texto}</Text>
          </View>
        )}
      </View>

      {fase === 'escolher_tipo' && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelarLocal('Cancelado pelo operador na maquineta')}>
          <Feather name="x" size={18} color={COLORS.WHITE} />
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      )}

      <MetodoPagamentoModal
        isOpen={fase === 'escolher_tipo'}
        titulo="Tipo de pagamento"
        valorCents={cobranca.valorCents}
        descricao={descricaoCobranca(cobranca)}
        tipoPre={cobranca.tipoPre}
        parcelasPre={cobranca.parcelasPre}
        onConfirm={m => disparar(m)}
        onCancel={() => cancelarLocal('Cancelado pelo operador na maquineta')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 24 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  badge: { color: COLORS.CYAN_300, fontSize: 12, fontFamily: FONT_FAMILY.BOLD, letterSpacing: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  desc: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.LG, textAlign: 'center' },
  valor: { color: COLORS.GOLD_500, fontSize: 56, fontFamily: FONT_FAMILY.BOLD },
  tipo: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.MD },
  waitBox: { alignItems: 'center', gap: 12, marginTop: 32, paddingHorizontal: 16 },
  waitText: { color: COLORS.WHITE, fontSize: FONT_SIZE.XL, fontFamily: FONT_FAMILY.BOLD },
  waitSub: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM, textAlign: 'center' },
  resultText: { fontSize: FONT_SIZE.XL, fontFamily: FONT_FAMILY.BOLD, textAlign: 'center' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 8, backgroundColor: COLORS.DANGER },
  cancelText: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
});
