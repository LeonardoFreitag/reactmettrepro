import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type Props = {
  isOpen: boolean;
  total: number;
  hasPending: boolean;
  onConfirm: (destino: string) => void;
  onCancel: () => void;
};

export function FechamentoModal({ isOpen, total, hasPending, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.title}>O que deseja fazer?</Text>
          <Text style={styles.subtitle}>Total da comanda</Text>
          <Text style={styles.total}>R$ {total.toFixed(2)}</Text>

          {hasPending && (
            <View style={styles.warning}>
              <Feather name="alert-triangle" size={14} color={COLORS.GOLD_500} />
              <Text style={styles.warningText}>
                Há itens não enviados. Envie o pedido antes de fechar.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, styles.btnClose, hasPending && styles.btnDisabled]}
            onPress={() => !hasPending && onConfirm('F')}
            disabled={hasPending}
          >
            <Feather name="x-circle" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>Fechar conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrint]}
            onPress={() => onConfirm('C')}
          >
            <Feather name="printer" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>Solicitar impressão</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: COLORS.SURFACE_800,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.LG,
    fontFamily: FONT_FAMILY.BOLD,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.GRAY_200,
    fontSize: FONT_SIZE.SM,
    marginTop: 4,
  },
  total: {
    color: COLORS.GOLD_500,
    fontSize: 36,
    fontFamily: FONT_FAMILY.BOLD,
    marginVertical: 16,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: `${COLORS.GOLD_500}22`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GOLD_700,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  warningText: {
    color: COLORS.GOLD_300,
    fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.REGULAR,
    flex: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnClose: {
    backgroundColor: COLORS.DANGER,
  },
  btnPrint: {
    backgroundColor: COLORS.CYAN_700,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.MD,
  },
  cancelBtn: {
    marginTop: 4,
    padding: 10,
  },
  cancelText: {
    color: COLORS.GRAY_400,
    fontSize: FONT_SIZE.MD,
    fontFamily: FONT_FAMILY.REGULAR,
  },
});
