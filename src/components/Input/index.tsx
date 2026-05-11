import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Props = TextInputProps & {
  mb?: number;
  mt?: number;
  ml?: number;
  mr?: number;
};

export function Input({ mb, mt, ml, mr, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...rest}
      onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
      placeholderTextColor={COLORS.GRAY_400}
      style={[
        styles.input,
        focused && styles.focused,
        {
          marginTop:    mt ? mt * 4 : undefined,
          marginBottom: mb ? mb * 4 : undefined,
          marginLeft:   ml ? ml * 4 : undefined,
          marginRight:  mr ? mr * 4 : undefined,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 54,
    backgroundColor: COLORS.SURFACE_700,
    borderWidth: 1,
    borderColor: COLORS.SURFACE_600,
    borderRadius: 8,
    paddingHorizontal: 14,
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
  },
  focused: {
    borderColor: COLORS.GOLD_500,
  },
});
