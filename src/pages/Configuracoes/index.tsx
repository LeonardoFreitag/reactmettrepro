import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState } from '../../store/combineReducers';
import { loadCompanyList, deleteCompanyList } from '../../store/ducks/companyList/actions';
import { updateConfigEdit } from '../../store/ducks/configEdit/actions';
import { companyGetAll, companyDelete } from '../../storage/companyStorage';
import { configSave } from '../../storage/configStorage';
import { CompanyModel } from '../../models/CompanyModel';
import { AlertDialogModal } from '../../components/AlertDialogModal';
import { AddCompanyModal } from './AddCompanyModal';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { AppStackParamList } from '../../routes';

type Nav = NativeStackNavigationProp<AppStackParamList, 'configuracoes'>;

export function Configuracoes() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const companies = useSelector((state: RootState) => state.companyList.data);
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyModel | null>(null);

  useEffect(() => {
    companyGetAll().then(list => dispatch(loadCompanyList(list)));
  }, []);

  async function handleToggleDestino(value: boolean) {
    const updated = { ...configEdit, destino: value };
    dispatch(updateConfigEdit(updated));
    await configSave(updated);
  }

  async function handleToggleKeyboard(value: boolean) {
    const updated = { ...configEdit, keyboardHasLetters: value };
    dispatch(updateConfigEdit(updated));
    await configSave(updated);
  }

  async function handleDeleteCompany() {
    if (!deleteTarget) return;
    await companyDelete(deleteTarget);
    dispatch(deleteCompanyList(deleteTarget.id));
    setDeleteTarget(null);
  }

  async function handleClearData() {
    await AsyncStorage.clear();
    Alert.alert('Sucesso', 'Dados limpos com sucesso.');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Feather name="plus" size={24} color={COLORS.GOLD_500} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Empresas</Text>
      <FlatList
        data={companies}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.companyItem}>
            <View>
              <Text style={styles.companyName}>{item.nome}</Text>
              <Text style={styles.companyInfo}>{item.ip}:{item.porta}</Text>
            </View>
            <TouchableOpacity onPress={() => setDeleteTarget(item)}>
              <Feather name="trash-2" size={20} color={COLORS.DANGER} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma empresa cadastrada</Text>}
      />

      <Text style={styles.sectionTitle}>Opções</Text>
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Perguntar destino ao enviar pedido</Text>
        <Switch value={configEdit.destino} onValueChange={handleToggleDestino} thumbColor={COLORS.GOLD_500} trackColor={{ true: COLORS.GOLD_700, false: COLORS.SURFACE_600 }} />
      </View>
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Teclado de código tem letras</Text>
        <Switch value={configEdit.keyboardHasLetters} onValueChange={handleToggleKeyboard} thumbColor={COLORS.GOLD_500} trackColor={{ true: COLORS.GOLD_700, false: COLORS.SURFACE_600 }} />
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
        <Feather name="trash" size={16} color={COLORS.DANGER} />
        <Text style={styles.dangerText}>Limpar todos os dados</Text>
      </TouchableOpacity>

      <AddCompanyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <AlertDialogModal
        title="Excluir empresa"
        bodyText={`Deseja excluir a empresa "${deleteTarget?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isOpen={!!deleteTarget}
        handleConfirm={handleDeleteCompany}
        handleCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 40 },
  headerTitle: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  sectionTitle: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD, marginBottom: 8, marginTop: 16 },
  companyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.SURFACE_700, padding: 12, borderRadius: 8, marginBottom: 8 },
  companyName: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  companyInfo: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 16 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.SURFACE_700, padding: 12, borderRadius: 8, marginBottom: 8 },
  optionLabel: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.SM, flex: 1, marginRight: 8 },
  dangerButton: { flexDirection: 'row', alignItems: 'center', marginTop: 24, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.DANGER },
  dangerText: { color: COLORS.DANGER, fontFamily: FONT_FAMILY.BOLD, marginLeft: 8 },
});
