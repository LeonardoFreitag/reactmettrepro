/**
 * Tela "Cobranças" (detached, offline-first): cards gerados pelo caixa.
 *  - "Minhas entregas": GET /cobrancas/cards?entregador=<funcionário logado>
 *  - "Mesas":           GET /cobrancas/cards?mesas=1 (qualquer aparelho)
 * A última lista boa fica em AsyncStorage (`cobrancas.cache`) e é o que a tela
 * mostra sem rede. O toque no card → confirmação do tipo → claim (direto ou pela
 * fila) → provider.pay/reverse → desfecho na fila de saída.
 * Nunca dispara Deep Link sozinha.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { usePaymentProvider, transactionTypeLabel } from '../../payment';
import { Cobranca, ORIGEM_LABEL } from '../../models/CobrancaModel';
import { MetodoPagamentoModal, MetodoEscolhido } from '../../components/MetodoPagamentoModal';
import { fetchCards, claimCobranca } from '../../sync/cobrancasApi';
import { enqueueClaim, clearErros, drainNow } from '../../sync/outbox';
import { useOutbox } from '../../sync/useOutbox';
import { executarCobranca, descricaoCobranca } from '../../sync/executarCobranca';

type Nav = NativeStackNavigationProp<AppStackParamList, 'cobrancas'>;

const CACHE_KEY = 'cobrancas.cache';
const REFRESH_MS = 15_000;

type Cache = { em: string; entregas: Cobranca[]; mesas: Cobranca[] };

function tempoDesde(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h}h${String(min % 60).padStart(2, '0')}`;
}
/** Motivo curto da falha, para a seção dizer por que está vazia. */
function descreveErro(err: any): string {
  const status = err?.response?.status;
  if (status === 401) return 'API recusou a chave (X-Api-Key) — confira em Configurações › Maquineta';
  if (status) return `API respondeu ${status}`;
  return 'sem resposta da API';
}

function hhmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function Cobrancas() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const config = useSelector((s: RootState) => s.configEdit.data);
  const atendente = useSelector((s: RootState) => s.atendenteEdit.data);
  const provider = usePaymentProvider();
  const outbox = useOutbox();

  const terminalId = config.terminalId || `APP-${atendente.codigo || '0'}`;
  const codEntregador = Number(atendente.codigo) || 0;

  const [entregas, setEntregas] = useState<Cobranca[]>([]);
  const [mesas, setMesas] = useState<Cobranca[]>([]);
  const [online, setOnline] = useState(true);
  const [cacheEm, setCacheEm] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [erroEntregas, setErroEntregas] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Cobranca | null>(null);
  const [executando, setExecutandoState] = useState<string | null>(null);
  const executandoRef = useRef<string | null>(null);
  const focused = useRef(false);
  function setExecutando(id: string | null) { executandoRef.current = id; setExecutandoState(id); }

  // ── Cache ───────────────────────────────────────────────────────────────
  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const c: Cache = JSON.parse(raw);
      setEntregas(c.entregas ?? []);
      setMesas(c.mesas ?? []);
      setCacheEm(c.em);
    } catch {}
  }
  async function saveCache(e: Cobranca[], m: Cobranca[]) {
    const c: Cache = { em: new Date().toISOString(), entregas: e, mesas: m };
    setCacheEm(c.em);
    try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {}
  }

  // ── Refresh ─────────────────────────────────────────────────────────────
  /**
   * As duas listas são buscadas em paralelo mas falham em separado: uma seção com
   * problema não pode apagar a outra nem jogar a tela inteira para o cache, e o
   * motivo da falha precisa aparecer — uma seção vazia silenciosa é indistinguível
   * de "não há cards".
   */
  const refresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const [e, m] = await Promise.all([
        (codEntregador > 0
          ? fetchCards({ entregador: codEntregador })
          : Promise.resolve([] as Cobranca[])
        ).catch((err: any) => { setErroEntregas(descreveErro(err)); return null; }),
        fetchCards({ mesas: true }).catch(() => null),
      ]);

      if (e) { setEntregas(e); setErroEntregas(null); }
      if (m) setMesas(m);
      setOnline(!!e || !!m);
      if (e && m) await saveCache(e, m);
      void drainNow();
    } finally {
      if (manual) setRefreshing(false);
    }
  }, [codEntregador]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    loadCache().then(() => refresh());
    const t = setInterval(() => { if (focused.current && !executandoRef.current) refresh(); }, REFRESH_MS);
    return () => { focused.current = false; clearInterval(t); };
  }, [refresh]));

  // ── Execução de um card ─────────────────────────────────────────────────
  function handleTap(c: Cobranca) {
    if (executando) return;
    if (c.status === 'sent_to_terminal' && c.terminalId && c.terminalId !== terminalId) {
      Alert.alert('Em cobrança', `Este card está sendo cobrado no aparelho "${c.terminalId}".`);
      return;
    }
    if (!provider.isConfigured()) {
      Alert.alert('Maquineta', 'O provedor de pagamento não está configurado neste aparelho.');
      return;
    }
    if (c.operacao === 'C') {
      Alert.alert(
        'Estornar pagamento',
        `Estornar R$ ${(c.valorCents / 100).toFixed(2)} de "${descricaoCobranca(c)}" na maquineta?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Estornar', style: 'destructive', onPress: () => executar(c, null) },
        ],
      );
      return;
    }
    setAlvo(c);
  }

  async function executar(c: Cobranca, metodo: MetodoEscolhido | null) {
    setAlvo(null);
    setExecutando(c.id);
    try {
      // claim: direto se houver rede; sem rede vai para a fila ANTES do PATCH.
      try {
        const r = await claimCobranca(c.id, terminalId);
        if (!r.ok) {
          Alert.alert('Cobrança indisponível', `Este card já foi atendido ou encerrado (${r.status || 'status desconhecido'}).`);
          await refresh();
          return;
        }
      } catch {
        await enqueueClaim(c.id, terminalId);
      }

      const { desfecho, result } = await executarCobranca(provider, terminalId, c, metodo);
      if (desfecho.status === 'approved') {
        const auth = result.success ? result.authCode : '';
        Alert.alert(c.operacao === 'C' ? 'Estorno aprovado' : 'Pagamento aprovado', auth ? `Autorização: ${auth}` : undefined);
      } else if (desfecho.status === 'canceled') {
        Alert.alert('Cancelado', 'A operação foi cancelada na maquineta.');
      } else {
        Alert.alert('Não aprovado', desfecho.motivoErro || 'A maquineta não aprovou a operação.');
      }
      // Some da lista ativa localmente (o servidor confirma no próximo refresh).
      setEntregas(prev => prev.filter(x => x.id !== c.id));
      setMesas(prev => prev.filter(x => x.id !== c.id));
    } finally {
      setExecutando(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  const concluidasIds = new Set(outbox.concluidas.map(x => x.cobrancaId));
  const ativos = (lista: Cobranca[]) => lista.filter(c => !concluidasIds.has(c.id) && (c.status === 'pending' || c.status === 'sent_to_terminal'));

  const sections = [
    { title: 'Minhas entregas', data: ativos(entregas), key: 'E' },
    { title: 'Mesas', data: ativos(mesas), key: 'M' },
  ];

  function statusLabel(c: Cobranca): { text: string; color: string } {
    const local = outbox.localStatus[c.id];
    if (local === 'pending_sync') return { text: 'aguardando sincronizar', color: COLORS.GOLD_500 };
    if (executando === c.id) return { text: 'em cobrança…', color: COLORS.CYAN_300 };
    if (c.status === 'sent_to_terminal') {
      return c.terminalId && c.terminalId !== terminalId
        ? { text: `em cobrança (${c.terminalId})`, color: COLORS.GRAY_400 }
        : { text: 'em cobrança — toque para retomar', color: COLORS.CYAN_300 };
    }
    return { text: 'pendente', color: COLORS.GRAY_200 };
  }

  function renderCard({ item: c }: { item: Cobranca }) {
    const st = statusLabel(c);
    const bloqueado = !!executando || (c.status === 'sent_to_terminal' && !!c.terminalId && c.terminalId !== terminalId);
    return (
      <TouchableOpacity style={[styles.card, bloqueado && styles.cardDisabled]} onPress={() => handleTap(c)} disabled={bloqueado}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardDesc}>{descricaoCobranca(c)}</Text>
            <Text style={styles.cardMeta}>
              {c.operacao === 'C' ? 'ESTORNO · ' : ''}{ORIGEM_LABEL[c.origem] ?? c.origem} · {c.tipoPre ? transactionTypeLabel(c.tipoPre, c.parcelasPre) : 'tipo a escolher'} · {tempoDesde(c.criadoEm)}
            </Text>
          </View>
          <Text style={[styles.cardValor, c.operacao === 'C' && { color: COLORS.DANGER }]}>
            {c.operacao === 'C' ? '−' : ''}R$ {(c.valorCents / 100).toFixed(2)}
          </Text>
        </View>
        <View style={styles.cardBottom}>
          {executando === c.id ? <ActivityIndicator size="small" color={COLORS.CYAN_300} /> : <Feather name="credit-card" size={14} color={st.color} />}
          <Text style={[styles.cardStatus, { color: st.color }]}>{st.text}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const concluidas = outbox.concluidas.slice(0, 20);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cobranças</Text>
        <View style={styles.headerRight}>
          {outbox.pendentes > 0 && (
            <View style={styles.syncBadge}>
              <Feather name="upload-cloud" size={12} color={COLORS.BACKGROUND} />
              <Text style={styles.syncBadgeText}>{outbox.pendentes} a sincronizar</Text>
            </View>
          )}
        </View>
      </View>

      {!online && (
        <View style={styles.offlineBar}>
          <Feather name="wifi-off" size={14} color={COLORS.GOLD_300} />
          <Text style={styles.offlineText}>offline — lista de {cacheEm ? hhmm(cacheEm) : '--:--'}</Text>
        </View>
      )}

      {outbox.erros.length > 0 && (
        <TouchableOpacity
          style={styles.errosBar}
          onPress={() => Alert.alert(
            'Desfechos não aceitos pela API',
            outbox.erros.slice(0, 5).map(e => `• ${e.tipo} ${e.cobrancaId.slice(0, 8)} → HTTP ${e.httpStatus}: ${JSON.stringify(e.resposta ?? '').slice(0, 120)}`).join('\n'),
            [{ text: 'Limpar', style: 'destructive', onPress: () => clearErros() }, { text: 'OK' }],
          )}
        >
          <Feather name="alert-triangle" size={14} color={COLORS.DANGER} />
          <Text style={styles.errosText}>{outbox.erros.length} desfecho(s) não aceito(s) pela API — toque para ver</Text>
        </TouchableOpacity>
      )}

      <SectionList
        sections={sections}
        keyExtractor={c => c.id}
        renderItem={renderCard}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>
            {section.title} ({section.data.length})
            {section.key === 'E' ? ` · entregador ${codEntregador || '—'}` : ''}
          </Text>
        )}
        renderSectionFooter={({ section }) => {
          if (section.data.length > 0) return null;
          if (section.key !== 'E') return <Text style={styles.empty}>Nenhum card</Text>;
          if (codEntregador <= 0) {
            return (
              <Text style={styles.empty}>
                O funcionário logado não tem código numérico — sem isso não dá para pedir as entregas dele à API.
              </Text>
            );
          }
          if (erroEntregas) return <Text style={[styles.empty, { color: COLORS.DANGER }]}>Não foi possível carregar: {erroEntregas}</Text>;
          return <Text style={styles.empty}>Nenhum card para o entregador {codEntregador}</Text>;
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(true)} tintColor={COLORS.GOLD_500} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        ListFooterComponent={
          concluidas.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Concluídas</Text>
              {concluidas.map(k => {
                const sync = outbox.localStatus[k.cobrancaId] ? 'a sincronizar' : 'sincronizada';
                const cor = k.status === 'approved' ? COLORS.SUCCESS : COLORS.DANGER;
                return (
                  <View key={k.cobrancaId} style={styles.doneRow}>
                    <Feather name={k.status === 'approved' ? 'check-circle' : 'x-circle'} size={14} color={cor} />
                    <Text style={styles.doneText} numberOfLines={1}>{k.descricao}</Text>
                    <Text style={[styles.doneStatus, { color: cor }]}>{k.status}</Text>
                    <Text style={styles.doneSync}>{sync} · {hhmm(k.em)}</Text>
                  </View>
                );
              })}
            </View>
          ) : null
        }
      />

      <MetodoPagamentoModal
        isOpen={!!alvo}
        valorCents={alvo?.valorCents ?? 0}
        descricao={alvo ? descricaoCobranca(alvo) : ''}
        tipoPre={alvo?.tipoPre}
        parcelasPre={alvo?.parcelasPre}
        onConfirm={m => alvo && executar(alvo, m)}
        onCancel={() => setAlvo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  headerRight: { minWidth: 24, alignItems: 'flex-end' },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.GOLD_500, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  syncBadgeText: { color: COLORS.BACKGROUND, fontSize: 11, fontFamily: FONT_FAMILY.BOLD },
  offlineBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${COLORS.GOLD_500}22`, borderWidth: 1, borderColor: COLORS.GOLD_700, borderRadius: 8, padding: 8, marginBottom: 8 },
  offlineText: { color: COLORS.GOLD_300, fontSize: FONT_SIZE.SM },
  errosBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${COLORS.DANGER}22`, borderWidth: 1, borderColor: COLORS.DANGER, borderRadius: 8, padding: 8, marginBottom: 8 },
  errosText: { color: COLORS.DANGER, fontSize: FONT_SIZE.SM, flex: 1 },
  sectionTitle: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD, marginTop: 12, marginBottom: 6 },
  empty: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM, marginBottom: 8 },
  card: { backgroundColor: COLORS.SURFACE_800, borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: COLORS.CYAN_700 },
  cardDisabled: { opacity: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardDesc: { color: COLORS.WHITE, fontSize: FONT_SIZE.MD, fontFamily: FONT_FAMILY.BOLD },
  cardMeta: { color: COLORS.GRAY_400, fontSize: 12, marginTop: 2 },
  cardValor: { color: COLORS.GOLD_500, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  cardStatus: { fontSize: 12 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.SURFACE_700 },
  doneText: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.SM, flex: 1 },
  doneStatus: { fontSize: 11, fontFamily: FONT_FAMILY.BOLD },
  doneSync: { color: COLORS.GRAY_400, fontSize: 11 },
});
