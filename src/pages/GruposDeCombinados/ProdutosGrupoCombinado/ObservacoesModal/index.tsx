import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/combineReducers';
import { ObservacoesModel } from '../../../../models/ObservacoesModel';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../../theme';

type Props = {
  isOpen: boolean;
  grupoCodigo: string;
  grupoNome: string;
  onConfirm: (obs: string) => void;
  onCancel: () => void;
};

export function ObservacoesModal({ isOpen, grupoCodigo, grupoNome, onConfirm, onCancel }: Props) {
  const observacoesList = useSelector((state: RootState) => state.observacoesList.data);
  const [obsText, setObsText] = useState('');

  const filtered = observacoesList.filter(o =>
    o.grupo === grupoCodigo || o.grupo === grupoNome
  );

  function handleToggle(obs: ObservacoesModel) {
    setObsText(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}, ${obs.observacao}` : obs.observacao;
    });
  }

  function handleConfirm() {
    onConfirm(obsText.trim());
    setObsText('');
  }

  function handleCancel() {
    setObsText('');
    onCancel();
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Observações</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite ou selecione abaixo..."
              placeholderTextColor={COLORS.GRAY_400}
              value={obsText}
              onChangeText={setObsText}
              multiline
            />
            {obsText.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setObsText('')}>
                <Feather name="x" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            )}
          </View>

          {filtered.length > 0 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.chipList}
            >
              {filtered.map(item => (
                <TouchableOpacity
                  key={item.codigo}
                  style={styles.chip}
                  onPress={() => handleToggle(item)}
                >
                  <Feather name="plus" size={13} color={COLORS.CYAN_500} />
                  <Text style={styles.chipText}>{item.observacao}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Pular</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  container: {
    backgroundColor: COLORS.SURFACE_800,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '75%',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.LG,
    fontFamily: FONT_FAMILY.BOLD,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.SURFACE_600,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  clearBtn: { padding: 12 },
  chipScroll: { maxHeight: 120 },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.SURFACE_700,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.CYAN_500,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: COLORS.CYAN_500,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.SM,
  },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginVertical: 16 },
  confirmBtn: {
    backgroundColor: COLORS.GOLD_500,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.MD },
});
