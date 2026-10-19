/**
 * Tela de espera do Modo Terminal (attended).
 *
 * É onde a maquineta dedicada ao caixa fica parada: sem lista, sem ação, só o
 * identificador do terminal, o provedor e o estado da conexão. O poller do
 * `TerminalRunner` atende a partir daqui (e também da lista de comandas, para o
 * aparelho híbrido que é garçom e terminal ao mesmo tempo).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { useTerminalState } from '../../terminal/useTerminalState';
import { semComunicacao } from '../../terminal/state';
import { useOutbox } from '../../sync/useOutbox';

type Nav = NativeStackNavigationProp<AppStackParamList, 'terminalEspera'>;

function hhmmss(ms: number | null): string {
  if (!ms) return '--:--:--';
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function TerminalEspera() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const config = useSelector((s: RootState) => s.configEdit.data);
  const atendente = useSelector((s: RootState) => s.atendenteEdit.data);
  const terminal = useTerminalState();
  const outbox = useOutbox();

  // Releitura periódica só para o relógio de "última consulta" não congelar
  // quando a API está fora (nesse caso o estado não muda a cada ciclo).
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Aparelho de plantão: o botão voltar não deve cair no login.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const offline = semComunicacao(terminal);
  const provedor = config.provider === 'STONE' ? 'Stone SmartPOS' : 'Cielo Smart';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 16, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.topo}>
        <Text style={styles.rotulo}>MODO TERMINAL</Text>
        {outbox.pendentes > 0 && (
          <View style={styles.syncBadge}>
            <Feather name="upload-cloud" size={12} color={COLORS.BACKGROUND} />
            <Text style={styles.syncBadgeText}>{outbox.pendentes} a sincronizar</Text>
          </View>
        )}
      </View>

      <View style={styles.centro}>
        <Text style={styles.terminalId}>{config.terminalId || '—'}</Text>
        <Text style={styles.provedor}>{provedor}</Text>

        <View style={[styles.estado, offline && styles.estadoOff]}>
          {offline ? (
            <Feather name="wifi-off" size={20} color={COLORS.GOLD_300} />
          ) : (
            <ActivityIndicator size="small" color={COLORS.CYAN_300} />
          )}
          <Text style={[styles.estadoTexto, offline && { color: COLORS.GOLD_300 }]}>
            {offline
              ? `Sem comunicação com o servidor desde ${hhmmss(terminal.ultimaConsultaOkEm)}`
              : 'Aguardando cobranças do caixa'}
          </Text>
        </View>

        <Text style={styles.ultima}>
          {offline
            ? `${terminal.falhasSeguidas} tentativas sem resposta`
            : `Última consulta às ${hhmmss(terminal.ultimaConsultaOkEm)}`}
        </Text>
      </View>

      <View style={styles.rodape}>
        {!!atendente.nome && <Text style={styles.operador}>Operador: {atendente.nome}</Text>}
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('comandas')}>
          <Feather name="list" size={16} color={COLORS.GRAY_200} />
          <Text style={styles.botaoTexto}>Abrir comandas</Text>
        </TouchableOpacity>
        <Text style={styles.dica}>Sair desta tela não desliga o Modo Terminal.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, paddingHorizontal: 24 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rotulo: { color: COLORS.CYAN_300, fontSize: 12, fontFamily: FONT_FAMILY.BOLD, letterSpacing: 2 },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.GOLD_500, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  syncBadgeText: { color: COLORS.BACKGROUND, fontSize: 11, fontFamily: FONT_FAMILY.BOLD },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  terminalId: { color: COLORS.WHITE, fontSize: 48, fontFamily: FONT_FAMILY.BOLD, letterSpacing: 2, textAlign: 'center' },
  provedor: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.MD },
  estado: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24,
    backgroundColor: `${COLORS.CYAN_700}33`, borderWidth: 1, borderColor: COLORS.CYAN_700,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
  },
  estadoOff: { backgroundColor: `${COLORS.GOLD_500}22`, borderColor: COLORS.GOLD_700 },
  estadoTexto: { color: COLORS.CYAN_300, fontSize: FONT_SIZE.SM, flexShrink: 1 },
  ultima: { color: COLORS.GRAY_400, fontSize: 12 },
  rodape: { alignItems: 'center', gap: 8 },
  operador: { color: COLORS.GRAY_400, fontSize: 12 },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.SURFACE_600,
  },
  botaoTexto: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD },
  dica: { color: COLORS.GRAY_400, fontSize: 11 },
});
