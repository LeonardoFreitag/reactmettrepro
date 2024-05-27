import { useNavigation } from '@react-navigation/native';
import { Box, VStack, useToast, Text } from 'native-base';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { createConfigEdit } from '../../store/ducks/configEdit/actions';
import { setUtl } from '../../services/api';
import { RootState } from '../../store/ducks/combineReducers';
import { AtendenteModel } from '../../models/AtendenteModel';
import { loadAtendenteList } from '../../store/ducks/atendenteList/actions';
import { createAtendenteEdit } from '../../store/ducks/atendenteEdit/actions';
import { UserIsloggedModel } from '../../models/UserIsLoggedModel';
import { Logo } from './styles';
import { companyGetAll } from '../../storage/company/companyGetAll';
import { loadCompanyList } from '../../store/ducks/companyList/actions';
import { CompanyList } from '../../components/CompanyList';
import { createCompanyEdit } from '../../store/ducks/companyEdit/actions';

const SignIn: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigation();
  const toast = useToast();
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const atendenteList = useSelector(
    (state: RootState) => state.atendenteList.data,
  );
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const companyList = useSelector((state: RootState) => state.companyList.data);
  const companyEdit = useSelector((state: RootState) => state.companyEdit.data);

  const handleLogin = async () => {
    if (configEdit === null) {
      toast.show({
        description: 'Faça as configurações do aplicativo!',
        duration: 1000,
      });
      return;
    }

    if (codigo === '' || password === '') {
      toast.show({
        description: 'Ops! Você precisa digitar um código e uma senha válidos!',
        duration: 1000,
      });
      return;
    }

    let listFromApi: AtendenteModel[] = [] as AtendenteModel[];

    if (atendenteList.length === 0) {
      const api = setUtl(companyEdit.ip, companyEdit.porta);

      api
        .get<AtendenteModel[]>('/func')
        .then(async response => {
          const dataFuncionarios: AtendenteModel[] = response.data;
          dispatch(loadAtendenteList(dataFuncionarios));
          listFromApi = dataFuncionarios;
          const dataCheck = listFromApi.filter(
            opt => opt.codigo === codigo && opt.senha === password,
          );

          const isUserLogged = await AsyncStorage.getItem('@mettre_userlogged');
          if (isUserLogged !== null) {
            const stringConvertedData: UserIsloggedModel =
              JSON.parse(isUserLogged);
            const dataUser: AtendenteModel = {
              codigo: stringConvertedData.codigo,
              nome: stringConvertedData.nome,
              senha: stringConvertedData.senha,
            };
            dispatch(createAtendenteEdit(dataUser));
            navigate.navigate('comandas');
          }

          if (dataCheck.length === 0) {
            toast.show({
              description: 'Código ou senha inválidos!',
              duration: 1000,
            });
            return;
          }

          const atendenteLogado: AtendenteModel = dataCheck.find(
            opt => opt.codigo === codigo && opt.senha === password,
          ) as AtendenteModel;

          if (!atendenteLogado) {
            dispatch(createAtendenteEdit(atendenteLogado));
            toast.show({
              description: 'Código ou senha inválidos!',
              duration: 1000,
            });
            return;
          }

          dispatch(createAtendenteEdit(atendenteLogado));

          try {
            const userLogged: UserIsloggedModel = {
              codigo: atendenteLogado.codigo,
              nome: atendenteLogado.nome,
              senha: atendenteLogado.senha,
              isLogged: true,
            };
            const jsonValue = JSON.stringify(userLogged);
            await AsyncStorage.setItem('@mettre_userlogged', jsonValue);
          } catch (e) {
            toast.show({
              description: 'Erro ao memorizar atendente logado!',
              duration: 1000,
            });
          }

          navigate.navigate('comandas');
        })
        .catch(() => {
          toast.show({
            description: 'Sem comunicação com API',
            duration: 1000,
          });
        });
    } else {
      listFromApi = atendenteList;
      const dataCheck = listFromApi.filter(
        opt => opt.codigo === codigo && opt.senha === password,
      );

      const isUserLogged = await AsyncStorage.getItem('@mettre_userlogged');
      if (isUserLogged !== null) {
        const stringConvertedData: UserIsloggedModel = JSON.parse(isUserLogged);
        const dataUser: AtendenteModel = {
          codigo: stringConvertedData.codigo,
          nome: stringConvertedData.nome,
          senha: stringConvertedData.senha,
        };
        dispatch(createAtendenteEdit(dataUser));
        navigate.navigate('comandas');
      }

      if (dataCheck.length === 0) {
        toast.show({
          description: 'Código ou senha inválidos!',
          duration: 1000,
        });
        return;
      }

      const atendenteLogado: AtendenteModel = dataCheck.find(
        opt => opt.codigo === codigo && opt.senha === password,
      ) as AtendenteModel;

      if (!atendenteLogado) {
        dispatch(createAtendenteEdit(atendenteLogado));
        toast.show({
          description: 'Código ou senha inválidos!',
          duration: 1000,
        });
        return;
      }

      dispatch(createAtendenteEdit(atendenteLogado));

      try {
        const userLogged: UserIsloggedModel = {
          codigo: atendenteLogado.codigo,
          nome: atendenteLogado.nome,
          senha: atendenteLogado.senha,
          isLogged: true,
        };
        const jsonValue = JSON.stringify(userLogged);
        await AsyncStorage.setItem('@mettre_userlogged', jsonValue);
      } catch (e) {
        toast.show({
          description: 'Erro ao memorizar atendente logado!',
          duration: 1000,
        });
      }

      navigate.navigate('comandas');
    }
    // }
  };

  const handleConfig = () => {
    navigate.navigate('configuracoes');
  };

  const handleLoadCompanyList = useCallback(async () => {
    const jsonValue = await companyGetAll();
    if (jsonValue.length === 0) {
      toast.show({
        description: 'Cadastre uma empresa!',
        duration: 1000,
      });
      return;
    }
    dispatch(loadCompanyList(jsonValue));
    const activeCompany = jsonValue.find(opt => opt.isSelected === true);
    if (!activeCompany) {
      return;
    }
    dispatch(createCompanyEdit(activeCompany));
  }, [dispatch]);

  const handleLoadConfig = useCallback(async () => {
    const jsonValue = await AsyncStorage.getItem('@mettre_config');
    if (jsonValue !== null) {
      const data = JSON.parse(jsonValue);
      dispatch(createConfigEdit(data));
    }
  }, [dispatch]);

  useEffect(() => {
    handleLoadCompanyList();
    handleLoadConfig();
  }, [dispatch, handleLoadCompanyList, handleLoadConfig]);

  return (
    <VStack
      bg={'gray.800'}
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding={4}>
      <Box mb={8}>
        <Logo source={require('../../assets/Logo.png')} />
      </Box>
      {companyList.length > 0 && <CompanyList />}
      <Input
        placeholder="Código..."
        keyboardType="number-pad"
        onChangeText={setCodigo}
      />
      <Input
        placeholder="Senha..."
        keyboardType="number-pad"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Acessar" onPress={handleLogin} />
      <Button
        title="Configurar"
        variant="outline"
        mt={24}
        onPress={handleConfig}
      />
    </VStack>
  );
};

export default SignIn;
