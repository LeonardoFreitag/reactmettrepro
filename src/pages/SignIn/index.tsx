import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { AppStackParamList } from '../../routes';
import { RootState } from '../../store/combineReducers';
import { createAtendenteEdit } from '../../store/ducks/atendenteEdit/actions';
import { loadCompanyList } from '../../store/ducks/companyList/actions';
import { createCompanyEdit } from '../../store/ducks/companyEdit/actions';
import { setUrl } from '../../services/api';
import { companyGetAll } from '../../storage/companyStorage';
import { userLoggedSave, userLoggedGet } from '../../storage/configStorage';
import { AtendenteModel } from '../../models/AtendenteModel';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { CompanyList } from '../../components/CompanyList';
import {
  Container,
  LogoContainer,
  AppName,
  AppSubtitle,
  FormGroup,
  Label,
  SettingsButton,
  SettingsText,
} from './styles';
import { COLORS } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'signin'>;

export function SignIn() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const companyEdit = useSelector((state: RootState) => state.companyEdit.data);
  const configEdit = useSelector((state: RootState) => state.configEdit.data);

  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const companies = await companyGetAll();
    dispatch(loadCompanyList(companies));
    const selected = companies.find(c => c.isSelected) ?? companies[0];
    if (selected) {
      dispatch(createCompanyEdit(selected));
    }

    const userLogged = await userLoggedGet();
    if (userLogged?.isLogged) {
      dispatch(createAtendenteEdit({
        codigo: userLogged.codigo,
        nome: userLogged.nome,
        senha: userLogged.senha,
      }));
      navigation.navigate('comandas');
    }
  }

  async function handleSignIn() {
    if (!codigo.trim()) {
      return Alert.alert('Atenção', 'Informe o código do funcionário.');
    }
    if (!senha.trim()) {
      return Alert.alert('Atenção', 'Informe a senha.');
    }
    if (!companyEdit.ip) {
      return Alert.alert('Atenção', 'Selecione uma empresa.');
    }

    setLoading(true);
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const { data } = await api.get<AtendenteModel[]>('/func');

      const atendente = data.find(
        f => f.codigo.trim() === codigo.trim() && f.senha.trim() === senha.trim()
      );

      if (!atendente) {
        return Alert.alert('Erro', 'Código ou senha inválidos.');
      }

      await userLoggedSave({ ...atendente, isLogged: true });
      dispatch(createAtendenteEdit(atendente));
      navigation.navigate('comandas');
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique o IP e porta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <LogoContainer>
            <AppName>ReactMettre</AppName>
            <AppSubtitle>Sistema de Ponto de Venda</AppSubtitle>
          </LogoContainer>

          <SettingsButton onPress={() => navigation.navigate('configuracoes')}>
            <Feather name="settings" size={16} color={COLORS.CYAN_500} />
            <SettingsText>Configurações</SettingsText>
          </SettingsButton>

          <FormGroup>
            <Label>Empresa</Label>
            <CompanyList />
          </FormGroup>

          <FormGroup>
            <Label>Código do funcionário</Label>
            <Input
              placeholder="Digite o código"
              keyboardType={configEdit.keyboardHasLetters ? 'default' : 'numeric'}
              value={codigo}
              onChangeText={setCodigo}
              autoCapitalize="none"
            />
          </FormGroup>

          <FormGroup>
            <Label>Senha</Label>
            <Input
              placeholder="Digite a senha"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </FormGroup>

          <Button
            title={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleSignIn}
            isDisabled={loading}
            mt={4}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
