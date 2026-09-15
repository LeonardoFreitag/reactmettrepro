import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type Props = {
  observacoes: ObservacoesModel[];
  selected: string[];
  onToggle: (obs: ObservacoesModel) => void;
};

export function Observacoes({ observacoes, selected, onToggle }: Props) {
  return (
    <View>
      <Text style={styles.label}>Observações</Text>
      <FlatList
        data={observacoes}
        keyExtractor={item => item.codigo}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.codigo);
          return (
            <TouchableOpacity
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => onToggle(item)}
            >
              <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                {item.observacao}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Sem observações para este grupo</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD, marginBottom: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.SURFACE_600, backgroundColor: COLORS.SURFACE_700, marginRight: 8 },
  tagSelected: { borderColor: COLORS.CYAN_500, backgroundColor: `${COLORS.CYAN_500}22` },
  tagText: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM },
  tagTextSelected: { color: COLORS.CYAN_500, fontFamily: FONT_FAMILY.BOLD },
  empty: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM },
});
