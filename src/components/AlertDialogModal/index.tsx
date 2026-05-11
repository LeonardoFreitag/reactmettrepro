import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Props = {
  title: string;
  bodyText: string;
  confirmText: string;
  cancelText: string;
  isOpen: boolean;
  handleConfirm: () => void;
  handleCancel: () => void;
};

export function AlertDialogModal({ title, bodyText, confirmText, cancelText, isOpen, handleConfirm, handleCancel }: Props) {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{bodyText}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
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
  },
  title: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.LG,
    marginBottom: 8,
  },
  body: {
    color: COLORS.GRAY_100,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: COLORS.GRAY_200,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
  },
  confirmBtn: {
    backgroundColor: COLORS.DANGER,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmText: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.MD,
  },
});
