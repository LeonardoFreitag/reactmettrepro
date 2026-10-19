/**
 * Seleção/confirmação do tipo de pagamento para uma cobrança (cards e Terminal
 * sem tipo pré-selecionado). Mostra valor + descrição, os tipos da interface
 * (Crédito/Débito/Pix/Voucher) e o nº de parcelas quando crédito.
 */
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { TransactionType } from '../../payment/types';

export type MetodoEscolhido = {
  transactionType: TransactionType;
  installments: number;
  voucherKind?: 'REFEICAO' | 'ALIMENTACAO';
};

type Props = {
  isOpen: boolean;
  titulo?: string;
  valorCents: number;
  descricao?: string | null;
  /** Pré-seleção vinda do caixa (pode ser trocada). */
  tipoPre?: TransactionType | null;
  parcelasPre?: number;
  confirmText?: string;
  onConfirm: (m: MetodoEscolhido) => void;
  onCancel: () => void;
};

type Opcao = { key: string; label: string; transactionType: TransactionType; voucherKind?: 'REFEICAO' | 'ALIMENTACAO' };
const OPCOES: Opcao[] = [
  { key: 'CREDIT', label: 'Crédito', transactionType: 'CREDIT' },
  { key: 'DEBIT', label: 'Débito', transactionType: 'DEBIT' },
  { key: 'PIX', label: 'Pix', transactionType: 'INSTANT_PAYMENT' },
  { key: 'VR', label: 'Vale refeição', transactionType: 'VOUCHER', voucherKind: 'REFEICAO' },
  { key: 'VA', label: 'Vale alimentação', transactionType: 'VOUCHER', voucherKind: 'ALIMENTACAO' },
];

export function MetodoPagamentoModal({
  isOpen, titulo = 'Cobrar na maquineta', valorCents, descricao, tipoPre, parcelasPre = 1,
  confirmText = 'Cobrar', onConfirm, onCancel,
}: Props) {
  const [sel, setSel] = useState<Opcao>(OPCOES[0]);
  const [parcelas, setParcelas] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const inicial = OPCOES.find(o => o.transactionType === (tipoPre ?? 'CREDIT')) ?? OPCOES[0];
    setSel(inicial);
    setParcelas(Math.max(1, Math.min(12, parcelasPre || 1)));
  }, [isOpen, tipoPre, parcelasPre]);

  const isCredit = sel.transactionType === 'CREDIT';

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{titulo}</Text>
          {!!descricao && <Text style={styles.desc}>{descricao}</Text>}
          <Text style={styles.value}>R$ {(valorCents / 100).toFixed(2)}</Text>

          <Text style={styles.label}>Tipo de pagamento</Text>
          <View style={styles.grid}>
            {OPCOES.map(o => {
              const on = o.key === sel.key;
              return (
                <TouchableOpacity key={o.key} style={[styles.chip, on && styles.chipOn]} onPress={() => setSel(o)}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isCredit && (
            <>
              <Text style={styles.label}>Parcelas</Text>
              <View style={styles.parcelasRow}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setParcelas(p => Math.max(1, p - 1))}>
                  <Feather name="minus" size={18} color={COLORS.WHITE} />
                </TouchableOpacity>
                <Text style={styles.parcelasText}>{parcelas === 1 ? 'À vista' : `${parcelas}x sem juros`}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={() => setParcelas(p => Math.min(12, p + 1))}>
                  <Feather name="plus" size={18} color={COLORS.WHITE} />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.btn}
            onPress={() => onConfirm({
              transactionType: sel.transactionType,
              installments: isCredit ? parcelas : 1,
              voucherKind: sel.voucherKind,
            })}
          >
            <Feather name="credit-card" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>{confirmText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 },
  container: { backgroundColor: COLORS.SURFACE_800, borderRadius: 12, padding: 24, alignItems: 'center' },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD, textAlign: 'center' },
  desc: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, marginTop: 6, textAlign: 'center' },
  value: { color: COLORS.GOLD_500, fontSize: 32, fontFamily: FONT_FAMILY.BOLD, marginVertical: 12 },
  label: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD, alignSelf: 'flex-start', marginTop: 8, marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: COLORS.SURFACE_600, borderWidth: 1, borderColor: COLORS.SURFACE_600 },
  chipOn: { backgroundColor: `${COLORS.CYAN_700}55`, borderColor: COLORS.CYAN_500 },
  chipText: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.SM },
  chipTextOn: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD },
  parcelasRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: COLORS.SURFACE_700, borderRadius: 8, padding: 8 },
  stepBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: COLORS.SURFACE_600, alignItems: 'center', justifyContent: 'center' },
  parcelasText: { color: COLORS.WHITE, fontSize: FONT_SIZE.MD, fontFamily: FONT_FAMILY.BOLD },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 52, borderRadius: 8, marginTop: 20, backgroundColor: COLORS.CYAN_700 },
  btnText: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  cancelBtn: { marginTop: 8, padding: 10 },
  cancelText: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.MD },
});
