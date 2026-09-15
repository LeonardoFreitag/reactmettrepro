import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';
import { NfceStatus, NfceDados } from '../../../hooks/useNfce';

type Props = {
  isOpen: boolean;
  status: NfceStatus;
  dados: NfceDados | null;
  mensagemErro: string | null;
  onSolicitar: (cpfCliente?: string) => void;
  onImprimir: (danfeTexto: string) => void;
  onPular: () => void;
  onFechar: () => void;
};

type Screen = 'cpf' | 'aguardando' | 'resultado';

export function NfceModal({
  isOpen,
  status,
  dados,
  mensagemErro,
  onSolicitar,
  onImprimir,
  onPular,
  onFechar,
}: Props) {
  const [screen, setScreen] = useState<Screen>('cpf');
  const [cpf, setCpf] = useState('');

  // Sincroniza tela com status do hook
  useEffect(() => {
    if (status === 'aguardando')                    setScreen('aguardando');
    if (status === 'emitida' || status === 'erro' || status === 'timeout') setScreen('resultado');
    if (status === 'idle')                          setScreen('cpf');
  }, [status]);

  // Reseta CPF ao abrir
  useEffect(() => {
    if (isOpen) setCpf('');
  }, [isOpen]);

  function handleCpfChange(text: string) {
    // Máscara: 999.999.999-99
    const digits = text.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 9)      masked = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
    else if (digits.length > 6) masked = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
    else if (digits.length > 3) masked = `${digits.slice(0,3)}.${digits.slice(3)}`;
    setCpf(masked);
  }

  // ── Tela CPF ───────────────────────────────────────────────────────────────
  function renderCpf() {
    return (
      <>
        <View style={styles.iconRow}>
          <Feather name="file-text" size={32} color={COLORS.CYAN_500} />
        </View>
        <Text style={styles.title}>Emitir NFC-e</Text>
        <Text style={styles.subtitle}>
          Informe o CPF do cliente para incluir na nota (opcional).
        </Text>

        <Text style={styles.inputLabel}>CPF do cliente</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={handleCpfChange}
          placeholder="000.000.000-00"
          placeholderTextColor={COLORS.GRAY_400}
          keyboardType="numeric"
          maxLength={14}
        />

        <TouchableOpacity
          style={[styles.btn, styles.btnCielo]}
          onPress={() => onSolicitar(cpf.replace(/\D/g, '') || undefined)}
        >
          <Feather name="check" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>
            {cpf.replace(/\D/g, '').length === 11 ? 'Emitir com CPF' : 'Emitir sem CPF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onPular}>
          <Text style={styles.skipText}>Pular — não emitir NFC-e</Text>
        </TouchableOpacity>
      </>
    );
  }

  // ── Tela aguardando ────────────────────────────────────────────────────────
  function renderAguardando() {
    return (
      <>
        <ActivityIndicator size="large" color={COLORS.CYAN_500} style={styles.spinner} />
        <Text style={styles.title}>Emitindo NFC-e...</Text>
        <Text style={styles.subtitle}>
          Aguardando confirmação do servidor. Isso pode levar alguns segundos.
        </Text>

        <TouchableOpacity style={styles.skipBtn} onPress={onPular}>
          <Text style={styles.skipText}>Pular e continuar</Text>
        </TouchableOpacity>
      </>
    );
  }

  // ── Tela resultado ─────────────────────────────────────────────────────────
  function renderResultado() {
    if (status === 'emitida' && dados) {
      return (
        <>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={40} color={COLORS.SUCCESS} />
          </View>
          <Text style={styles.title}>NFC-e emitida!</Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Número</Text>
              <Text style={styles.infoValue}>{dados.numeroNota} — Série {dados.serie}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chave de acesso</Text>
              <Text style={[styles.infoValue, styles.chave]} numberOfLines={2}>
                {dados.chaveAcesso}
              </Text>
            </View>
          </View>

          {!!dados.danfeTexto && (
            <TouchableOpacity
              style={[styles.btn, styles.btnCielo]}
              onPress={() => onImprimir(dados.danfeTexto)}
            >
              <Feather name="printer" size={18} color={COLORS.WHITE} />
              <Text style={styles.btnText}>Imprimir DANFE</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.btn, styles.btnClose]} onPress={onFechar}>
            <Feather name="arrow-right" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        </>
      );
    }

    // Erro ou timeout
    return (
      <>
        <View style={styles.errorIcon}>
          <Feather name="alert-triangle" size={40} color={COLORS.WARNING} />
        </View>
        <Text style={styles.title}>
          {status === 'timeout' ? 'Tempo esgotado' : 'Falha na emissão'}
        </Text>
        <Text style={styles.errorMsg}>
          {mensagemErro ?? 'Ocorreu um erro na emissão da NFC-e.'}
        </Text>

        <TouchableOpacity
          style={[styles.btn, styles.btnCielo]}
          onPress={() => { setScreen('cpf'); }}
        >
          <Feather name="refresh-cw" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>Tentar novamente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onFechar}>
          <Text style={styles.skipText}>Pular e continuar</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onPular}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {screen === 'cpf'        && renderCpf()}
          {screen === 'aguardando' && renderAguardando()}
          {screen === 'resultado'  && renderResultado()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: '#00000088',
    justifyContent: 'center', padding: 24,
  },
  container: {
    backgroundColor: COLORS.SURFACE_800,
    borderRadius: 12, padding: 24, alignItems: 'center',
  },

  iconRow: { marginBottom: 12 },
  spinner: { marginBottom: 16 },
  successIcon: { marginBottom: 12 },
  errorIcon:   { marginBottom: 12 },

  title: {
    color: COLORS.WHITE, fontSize: FONT_SIZE.LG,
    fontFamily: FONT_FAMILY.BOLD, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM,
    textAlign: 'center', marginBottom: 20,
  },
  errorMsg: {
    color: COLORS.WARNING, fontSize: FONT_SIZE.SM,
    textAlign: 'center', marginBottom: 20,
  },

  inputLabel: {
    color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.BOLD, alignSelf: 'flex-start', marginBottom: 6,
  },
  input: {
    width: '100%', backgroundColor: COLORS.SURFACE_600,
    color: COLORS.WHITE, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12,
    fontSize: FONT_SIZE.MD, marginBottom: 16,
    letterSpacing: 1,
  },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%', height: 52, borderRadius: 8, marginBottom: 10,
  },
  btnCielo: { backgroundColor: COLORS.CYAN_700 },
  btnClose: { backgroundColor: COLORS.SURFACE_600 },
  btnText: {
    color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD,
  },

  skipBtn: { marginTop: 4, padding: 10 },
  skipText: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM },

  infoBox: {
    width: '100%', backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8, padding: 12, marginBottom: 16, gap: 10,
  },
  infoRow:   { gap: 2 },
  infoLabel: { color: COLORS.GRAY_400, fontSize: 12 },
  infoValue: { color: COLORS.WHITE, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD },
  chave:     { fontSize: 11, fontFamily: FONT_FAMILY.REGULAR, letterSpacing: 0.5 },
});
