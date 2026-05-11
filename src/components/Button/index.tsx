import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ActivityIndicator } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Props = {
  title: string;
  variant?: 'outline' | 'default';
  width?: number | `${number}%`;
  onPress?: (e: GestureResponderEvent) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
};

export function Button({ title, variant = 'default', width, onPress, isDisabled, isLoading, mt, mb, ml, mr }: Props) {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: isOutline ? 'transparent' : COLORS.GOLD_500,
          borderWidth: isOutline ? 1 : 0,
          width: width ?? '100%',
          marginTop:    mt ? mt * 4 : undefined,
          marginBottom: mb ? mb * 4 : undefined,
          marginLeft:   ml ? ml * 4 : undefined,
          marginRight:  mr ? mr * 4 : undefined,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
    >
      {isLoading
        ? <ActivityIndicator color={COLORS.WHITE} />
        : <Text style={[styles.title, isOutline && { color: COLORS.GOLD_500 }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: COLORS.GOLD_500,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.MD,
    fontFamily: FONT_FAMILY.BOLD,
  },
});
