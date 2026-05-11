import React, { useState } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/combineReducers';
import { ObservacoesModel } from '../../../../models/ObservacoesModel';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../../theme';

type Props = {
  isOpen: boolean;
  grupo: string;
  onConfirm: (obs: string) => void;
  onCancel: () => void;
};

export function ObservacoesModal({ isOpen, grupo, onConfirm, onCancel }: Props) {
  const observacoesList = useSelector((state: RootState) => state.observacoesList.data);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = observacoesList.filter(o => o.grupo === grupo);

  function handleToggle(obs: ObservacoesModel) {
    setSelected(prev => prev.includes(obs.codigo) ? prev.filter(o => o !== obs.codigo) : [...prev, obs.codigo]);
  }

  function handleConfirm() {
    const text = selected.map(code => observacoesList.find(o => o.codigo === code)?.observacao ?? '').filter(Boolean).join(', ');
    onConfirm(text);
    setSelected([]);
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Observações</Text>
          <FlatList
            data={filtered}
            keyExtractor={item => item.codigo}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.codigo);
              return (
                <TouchableOpacity style={[styles.item, isSelected && styles.itemSelected]} onPress={() => handleToggle(item)}>
                  <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item.observacao}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>Sem observações</Text>}
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Pular</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  container: { backgroundColor: COLORS.SURFACE_800, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%' },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD, marginBottom: 16 },
  item: { backgroundColor: COLORS.SURFACE_700, borderRadius: 8, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.SURFACE_600 },
  itemSelected: { borderColor: COLORS.CYAN_500 },
  itemText: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.MD },
  itemTextSelected: { color: COLORS.CYAN_500, fontFamily: FONT_FAMILY.BOLD },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginVertical: 16 },
  confirmBtn: { backgroundColor: COLORS.GOLD_500, borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  confirmText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.MD },
});
