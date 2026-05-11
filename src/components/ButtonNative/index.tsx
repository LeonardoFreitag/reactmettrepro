import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import { COLORS, FONT_FAMILY } from '../../theme';

type Props = {
  title: string;
  variant?: 'outline' | 'default' | 'danger';
  width?: number | `${number}%`;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
};

export function ButtonNative({ title, variant = 'default', width, onPress, disabled }: Props) {
  const bg =
    variant === 'outline' ? 'transparent' :
    variant === 'danger'  ? COLORS.DANGER :
    COLORS.GOLD_500;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          width: width ?? '100%',
        },
      ]}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderColor: COLORS.GOLD_500,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
  },
});
