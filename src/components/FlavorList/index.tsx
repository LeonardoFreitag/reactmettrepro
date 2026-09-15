import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ItemModel } from '../../models/ItemModel';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Props = {
  flavors: ItemModel[];
};

const FRACTIONS: Record<number, string> = {
  1: '1/1',
  2: '1/2',
  3: '1/3',
  4: '1/4',
};

export function FlavorList({ flavors }: Props) {
  const fraction = FRACTIONS[flavors.length] ?? `1/${flavors.length}`;

  return (
    <View style={styles.container}>
      {flavors.map((flavor, index) => (
        <View key={flavor.mobileId || index.toString()} style={styles.row}>
          <Text style={styles.fraction}>{fraction}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{flavor.descricao}</Text>
            {!!flavor.obs && <Text style={styles.obs}>{flavor.obs}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.CYAN_500,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  fraction: {
    color: COLORS.CYAN_500,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.SM,
    marginRight: 8,
    minWidth: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.GRAY_100,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.SM,
  },
  obs: {
    color: COLORS.GRAY_400,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 12,
  },
});
