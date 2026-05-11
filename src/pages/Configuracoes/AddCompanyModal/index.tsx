import React from 'react';
import { Modal, View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import uuid from 'react-native-uuid';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { companyCreate } from '../../../storage/companyStorage';
import { createCompanyList } from '../../../store/ducks/companyList/actions';
import { CompanyModel } from '../../../models/CompanyModel';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type FormData = { nome: string; ip: string; porta: string };

const schema = yup.object({
  nome: yup.string().required('Nome obrigatório'),
  ip: yup.string().required('IP obrigatório'),
  porta: yup.string().required('Porta obrigatória'),
});

type Props = { isOpen: boolean; onClose: () => void };

export function AddCompanyModal({ isOpen, onClose }: Props) {
  const dispatch = useDispatch();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const company: CompanyModel = {
      id: uuid.v4() as string,
      nome: data.nome,
      ip: data.ip,
      porta: data.porta,
      isSelected: false,
    };
    await companyCreate(company);
    dispatch(createCompanyList(company));
    reset();
    onClose();
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Adicionar Empresa</Text>
          <Controller control={control} name="nome" render={({ field: { onChange, value } }) => (
            <Input placeholder="Nome da empresa" value={value} onChangeText={onChange} mb={3} />
          )} />
          {errors.nome && <Text style={styles.error}>{errors.nome.message}</Text>}
          <Controller control={control} name="ip" render={({ field: { onChange, value } }) => (
            <Input placeholder="IP (ex: 192.168.1.100)" value={value} onChangeText={onChange} keyboardType="numbers-and-punctuation" mb={3} />
          )} />
          {errors.ip && <Text style={styles.error}>{errors.ip.message}</Text>}
          <Controller control={control} name="porta" render={({ field: { onChange, value } }) => (
            <Input placeholder="Porta (ex: 3000)" value={value} onChangeText={onChange} keyboardType="numeric" mb={4} />
          )} />
          {errors.porta && <Text style={styles.error}>{errors.porta.message}</Text>}
          <Button title="Salvar" onPress={handleSubmit(onSubmit)} mb={2} />
          <Button title="Cancelar" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 },
  container: { backgroundColor: COLORS.SURFACE_800, borderRadius: 12, padding: 24 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD, marginBottom: 16 },
  error: { color: COLORS.DANGER, fontSize: 12, marginTop: -8, marginBottom: 8 },
});
