import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Switch, TouchableOpacity,
  StyleSheet, Alert, TextInput, ScrollView,
} from 'react-native';
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

  // Campos Cielo (locais até salvar)
  const [cieloClientId, setCieloClientId] = useState(configEdit.cieloClientId ?? '');
  const [cieloAccessToken, setCieloAccessToken] = useState(configEdit.cieloAccessToken ?? '');
  const [showToken, setShowToken] = useState(false);
  const [showManualCielo, setShowManualCielo] = useState(false);

  const hasCieloCredentials = !!(configEdit.cieloClientId && configEdit.cieloAccessToken);

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

  async function handleSaveCielo() {
    const updated = {
      ...configEdit,
      cieloClientId:    cieloClientId.trim(),
      cieloAccessToken: cieloAccessToken.trim(),
    };
    dispatch(updateConfigEdit(updated));
    await configSave(updated);
    Alert.alert('Cielo', 'Credenciais salvas com sucesso.');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Feather name="plus" size={24} color={COLORS.GOLD_500} />
        </TouchableOpacity>
      </View>

      {/* Empresas */}
      <Text style={styles.sectionTitle}>Empresas</Text>
      {companies.length === 0 ? (
        <Text style={styles.empty}>Nenhuma empresa cadastrada</Text>
      ) : (
        companies.map(item => (
          <View key={item.id} style={styles.companyItem}>
            <View>
              <Text style={styles.companyName}>{item.nome}</Text>
              <Text style={styles.companyInfo}>
                {item.ip}{item.porta ? `:${item.porta}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setDeleteTarget(item)}>
              <Feather name="trash-2" size={20} color={COLORS.DANGER} />
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Opções */}
      <Text style={styles.sectionTitle}>Opções</Text>
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Perguntar destino ao enviar pedido</Text>
        <Switch
          value={configEdit.destino}
          onValueChange={handleToggleDestino}
          thumbColor={COLORS.GOLD_500}
          trackColor={{ true: COLORS.GOLD_700, false: COLORS.SURFACE_600 }}
        />
      </View>
      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Teclado de código tem letras</Text>
        <Switch
          value={configEdit.keyboardHasLetters}
          onValueChange={handleToggleKeyboard}
          thumbColor={COLORS.GOLD_500}
          trackColor={{ true: COLORS.GOLD_700, false: COLORS.SURFACE_600 }}
        />
      </View>

      {/* Integração Cielo Smart */}
      <Text style={styles.sectionTitle}>Integração Cielo Smart</Text>

      {hasCieloCredentials ? (
        <View style={styles.cieloSuccessCard}>
          <View style={styles.cieloHeader}>
            <Feather name="check-circle" size={18} color={COLORS.SUCCESS} />
            <Text style={styles.cieloSuccessTitle}>Cielo Deep Link configurado</Text>
          </View>
          <Text style={styles.cieloSuccessText}>
            O app está pronto para processar pagamentos via Cielo Smart.
          </Text>
          <TouchableOpacity
            style={styles.overrideLink}
            onPress={() => setShowManualCielo(v => !v)}
          >
            <Feather name={showManualCielo ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.CYAN_400} />
            <Text style={styles.overrideLinkText}>
              {showManualCielo ? 'Ocultar campos manuais' : 'Alterar manualmente'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cieloWarningCard}>
          <View style={styles.cieloHeader}>
            <Feather name="alert-triangle" size={18} color={COLORS.WARNING} />
            <Text style={styles.cieloWarningTitle}>Nenhuma credencial encontrada</Text>
          </View>
          <Text style={styles.cieloWarningText}>
            As credenciais Cielo são carregadas automaticamente do servidor ao iniciar o app.
            Se o problema persistir, preencha manualmente os campos abaixo.
          </Text>
        </View>
      )}

      {(!hasCieloCredentials || showManualCielo) && (
        <View style={styles.cieloManualCard}>
          <Text style={styles.fieldLabel}>Client-ID</Text>
          <TextInput
            style={styles.input}
            value={cieloClientId}
            onChangeText={setCieloClientId}
            placeholder="Ex: 1xa0tyQbJliVt..."
            placeholderTextColor={COLORS.GRAY_400}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.fieldLabel}>Access Token</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={cieloAccessToken}
              onChangeText={setCieloAccessToken}
              placeholder="Ex: WXMG95YK5Lp7..."
              placeholderTextColor={COLORS.GRAY_400}
              secureTextEntry={!showToken}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowToken(v => !v)}>
              <Feather name={showToken ? 'eye-off' : 'eye'} size={18} color={COLORS.GRAY_400} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, (!cieloClientId.trim() || !cieloAccessToken.trim()) && styles.btnDisabled]}
            onPress={handleSaveCielo}
            disabled={!cieloClientId.trim() || !cieloAccessToken.trim()}
          >
            <Feather name="save" size={16} color={COLORS.BACKGROUND} />
            <Text style={styles.btnText}>Salvar credenciais</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Limpar dados */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, paddingTop: 40,
  },
  headerTitle: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  sectionTitle: {
    color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.BOLD, marginBottom: 8, marginTop: 16,
  },
  companyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.SURFACE_700, padding: 12, borderRadius: 8, marginBottom: 8,
  },
  companyName: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  companyInfo: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 8, marginBottom: 8 },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.SURFACE_700, padding: 12, borderRadius: 8, marginBottom: 8,
  },
  optionLabel: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.SM, flex: 1, marginRight: 8 },

  // Cielo cards
  cieloHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },

  cieloSuccessCard: {
    backgroundColor: `${COLORS.SUCCESS}18`,
    borderRadius: 10, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: `${COLORS.SUCCESS}55`,
  },
  cieloSuccessTitle: { color: COLORS.SUCCESS, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  cieloSuccessText: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, marginBottom: 12 },
  overrideLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overrideLinkText: { color: COLORS.CYAN_400, fontSize: FONT_SIZE.SM },

  cieloWarningCard: {
    backgroundColor: `${COLORS.WARNING}18`,
    borderRadius: 10, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: `${COLORS.WARNING}55`,
  },
  cieloWarningTitle: { color: COLORS.WARNING, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  cieloWarningText: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM },

  cieloManualCard: {
    backgroundColor: COLORS.SURFACE_700, borderRadius: 10,
    padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.SURFACE_600,
  },
  fieldLabel: {
    color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.BOLD, marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.SURFACE_600, color: COLORS.WHITE,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: FONT_SIZE.SM, marginBottom: 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyeBtn: { padding: 10, backgroundColor: COLORS.SURFACE_600, borderRadius: 8 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.CYAN_700, borderRadius: 8,
    paddingVertical: 12, marginTop: 4,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.SM },

  dangerButton: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 24, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.DANGER,
  },
  dangerText: { color: COLORS.DANGER, fontFamily: FONT_FAMILY.BOLD, marginLeft: 8 },
});
