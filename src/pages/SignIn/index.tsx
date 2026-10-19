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
import { userLoggedSave, userLoggedGet, configGet, configSave } from '../../storage/configStorage';
import { updateConfigEdit } from '../../store/ducks/configEdit/actions';
import { AtendenteModel } from '../../models/AtendenteModel';
import { ConfigModel, normalizeConfig } from '../../models/ConfigModel';
import { modoTerminalConfigurado } from '../../terminal/ativo';

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

  /**
   * Destino depois do login. Num aparelho de plantão (Modo Terminal configurado)
   * é a tela de espera, com `reset` para o botão voltar não cair no login.
   */
  function navegarInicio(cfg: ConfigModel | null) {
    if (modoTerminalConfigurado(cfg)) {
      navigation.reset({ index: 0, routes: [{ name: 'terminalEspera' }] });
      return;
    }
    navigation.navigate('comandas');
  }

  async function loadCompanies() {
    // Config local primeiro: garante provider/terminalId/apiKey/cobranças mesmo sem rede
    // (o merge com o servidor em fetchServerConfig é opcional).
    const storedConfig = await configGet();
    if (storedConfig) dispatch(updateConfigEdit(storedConfig));

    const companies = await companyGetAll();
    dispatch(loadCompanyList(companies));
    const selected = companies.find(c => c.isSelected) ?? companies[0];
    if (selected) {
      dispatch(createCompanyEdit(selected));
      // Carrega credenciais Cielo e demais configs do servidor
      fetchServerConfig(selected.ip, selected.porta);
    }

    const userLogged = await userLoggedGet();
    if (userLogged?.isLogged) {
      dispatch(createAtendenteEdit({
        codigo: userLogged.codigo,
        nome: userLogged.nome,
        senha: userLogged.senha,
      }));
      navegarInicio(storedConfig);
    }
  }

  async function fetchServerConfig(ip: string, porta?: string) {
    try {
      const api = setUrl(ip, porta);
      const { data } = await api.get<{
        vLimitePedacos: number | null;
        cieloClientId: string;
        cieloAccessToken: string;
        cobrServico: string;
        perServico: number;
      }>('/config');

      // Merge com config local (preserva ip, destino, keyboardHasLetters e os
      // campos de maquineta: provider, terminalId, apiKey, modoTerminalAtivo, cobrancasAtivas)
      const stored = await configGet();
      const updated = normalizeConfig({
        ...(stored ?? {}),
        ip: stored?.ip ?? ip,
        cieloClientId:    data.cieloClientId    ?? stored?.cieloClientId    ?? '',
        cieloAccessToken: data.cieloAccessToken ?? stored?.cieloAccessToken ?? '',
        cobrServico:      data.cobrServico      ?? stored?.cobrServico      ?? 'N',
        perServico:       data.perServico        ?? stored?.perServico       ?? 0,
      });
      dispatch(updateConfigEdit(updated));
      await configSave(updated);
    } catch {
      // Falha silenciosa — credenciais salvas localmente continuam válidas
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
      navegarInicio(configEdit);
    } catch (err: any) {
      const url = `http://${companyEdit.ip}:${companyEdit.porta}/func`;
      const detail = err?.message ?? err?.code ?? 'Erro desconhecido';
      const status = err?.response?.status;
      const msg = status
        ? `Servidor retornou erro ${status}.\n\n${detail}`
        : `Não foi possível conectar.\n\nURL: ${url}\n\nDetalhe: ${detail}`;
      Alert.alert('Erro de conexão', msg);
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
              keyboardType={configEdit.keyboardHasLetters ? 'default' : 'numeric'}
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
