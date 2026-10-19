/**
 * Faixa "Modo Terminal pausado".
 *
 * Aparece quando o aparelho está configurado como terminal do caixa mas está
 * numa tela em que o poller não atende (dentro de uma comanda, configurações,
 * cards). Serve para que a falta de atendimento seja percebida AQUI, e não do
 * outro lado, pelo operador do caixa esperando o modal do Frente.
 *
 * Fica em App.tsx, fora do NavigationContainer, e acompanha a rota atual pelo
 * `navigationRef`. É renderizada em fluxo (acima das telas), não sobreposta,
 * para nunca cobrir cabeçalho ou rodapé de tela nenhuma.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { navigationRef } from '../../routes/navigationRef';
import { modoTerminalConfigurado, ROTAS_SEM_FAIXA } from '../../terminal/ativo';
import { COLORS, FONT_FAMILY } from '../../theme';

export function TerminalPausadoBanner() {
  const config = useSelector((s: RootState) => s.configEdit.data);
  const insets = useSafeAreaInsets();
  const [rota, setRota] = useState<string | undefined>(undefined);

  useEffect(() => {
    const atualizar = () => {
      setRota(navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined);
    };
    atualizar();
    const remover = navigationRef.addListener('state', atualizar);
    return remover;
  }, []);

  if (!modoTerminalConfigurado(config)) return null;
  if (!rota || ROTAS_SEM_FAIXA.includes(rota)) return null;

  return (
    <TouchableOpacity
      style={[styles.faixa, { paddingTop: Math.max(insets.top, 8) + 8 }]}
      onPress={() => navigationRef.isReady() && navigationRef.navigate('terminalEspera')}
      activeOpacity={0.8}
    >
      <Feather name="pause-circle" size={16} color={COLORS.BACKGROUND} />
      <Text style={styles.texto}>
        Modo Terminal pausado — cobranças do caixa não estão sendo atendidas
      </Text>
      <Feather name="chevron-right" size={16} color={COLORS.BACKGROUND} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  faixa: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.GOLD_500, paddingHorizontal: 12, paddingBottom: 8,
  },
  texto: { flex: 1, color: COLORS.BACKGROUND, fontSize: 12, fontFamily: FONT_FAMILY.BOLD },
});
