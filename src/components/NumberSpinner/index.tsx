import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Props = {
  label: string;
  amount: number;
  handlePressPlus: () => void;
  handlePressMinus: () => void;
  width?: number | string;
};

export function NumberSpinner({ label, amount, handlePressPlus, handlePressMinus, width }: Props) {
  return (
    <View style={[styles.container, { width: width as any ?? '100%' }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={handlePressMinus}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{amount % 1 === 0 ? amount.toString() : amount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.button} onPress={handlePressPlus}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    color: COLORS.GRAY_200,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.SM,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.CYAN_500,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE_600,
  },
  buttonText: {
    color: COLORS.CYAN_500,
    fontSize: 22,
    fontFamily: FONT_FAMILY.BOLD,
  },
  value: {
    minWidth: 60,
    textAlign: 'center',
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.LG,
  },
});
