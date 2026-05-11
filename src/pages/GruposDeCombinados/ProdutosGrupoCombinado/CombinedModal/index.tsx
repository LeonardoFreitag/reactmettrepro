import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { FlavorModel } from '../../../../models/FlavorModel';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../../theme';

const FRACTIONS: Record<number, string> = { 1: '1/1', 2: '1/2', 3: '1/3', 4: '1/4' };

type Props = {
  isOpen: boolean;
  flavors: FlavorModel[];
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CombinedModal({ isOpen, flavors, total, onConfirm, onCancel }: Props) {
  const fraction = FRACTIONS[flavors.length] ?? `1/${flavors.length}`;
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Revisar combinado</Text>
          <FlatList
            data={flavors}
            keyExtractor={item => item.codigo}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.fraction}>{fraction}</Text>
                <Text style={styles.name}>{item.nome}</Text>
              </View>
            )}
          />
          <Text style={styles.totalLabel}>Total: <Text style={styles.total}>R$ {total.toFixed(2)}</Text></Text>
          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmText}>Montar combinado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  container: { backgroundColor: COLORS.SURFACE_800, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fraction: { color: COLORS.CYAN_500, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD, minWidth: 32 },
  name: { color: COLORS.WHITE, fontSize: FONT_SIZE.MD },
  totalLabel: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.MD, marginTop: 12, marginBottom: 16 },
  total: { color: COLORS.GOLD_500, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.LG },
  confirmBtn: { backgroundColor: COLORS.GOLD_500, borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  confirmText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { color: COLORS.GRAY_400 },
});
