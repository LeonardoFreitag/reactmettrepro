import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type Props = { isOpen: boolean; onConfirm: (destino: string) => void; onCancel: () => void };

export function MesaDestinoModal({ isOpen, onConfirm, onCancel }: Props) {
  const [destino, setDestino] = useState('');
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Destino do pedido</Text>
          <Text style={styles.subtitle}>Informe o destino (ex: Balcão, Cozinha)</Text>
          <Input placeholder="Destino" value={destino} onChangeText={setDestino} mb={4} autoFocus />
          <Button title="Confirmar" onPress={() => { onConfirm(destino); setDestino(''); }} mb={2} />
          <Button title="Cancelar" variant="outline" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 },
  container: { backgroundColor: COLORS.SURFACE_800, borderRadius: 12, padding: 24 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD, marginBottom: 8 },
  subtitle: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, marginBottom: 16 },
});
