/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import {
  Center,
  Heading,
  HStack,
  Switch,
  Text,
  VStack,
  Button as NativeButton,
  FlatList,
} from 'native-base';
import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigModel } from '../../models/ConfigModel';
import { useDispatch, useSelector } from 'react-redux';
import { createConfigEdit } from '../../store/ducks/configEdit/actions';
import { RootState } from '../../store/ducks/combineReducers';
import { clearAtendenteList } from '../../store/ducks/atendenteList/actions';
import { AtendenteModel } from '../../models/AtendenteModel';
import IconFeather from 'react-native-vector-icons/Feather';
import { AddCompanyModal } from './AddCompanyModal';
import { Alert, SafeAreaView } from 'react-native';
import { CompanyModel } from '../../models/CompanyModel';
import { deleteCompanyList } from '../../store/ducks/companyList/actions';
import { companyDelete } from '../../storage/company/companyDelete';

const Configuracoes: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isCheckedKeyboard, setIsCheckedKeyboard] = useState<boolean>(false);
  const [servidorIp, setServidorIp] = useState('');
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const companyList = useSelector((state: RootState) => state.companyList.data);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsChecked(configEdit.destino);
    setServidorIp(configEdit.ip);
    setIsCheckedKeyboard(configEdit.keyboardHasLetters);
  }, [configEdit, configEdit.destino, configEdit.ip]);

  const handleRemoveCompany = (company: CompanyModel) => {
    Alert.alert('Remover empresa', 'Deseja realmente remover a empresa?', [
      {
        text: 'Sim',
        onPress: () => {
          dispatch(deleteCompanyList(company));
          companyDelete(company);
        },
      },
      {
        text: 'Não',
        onPress: () => {},
      },
    ]);
  };

  const handleSave = async () => {
    try {
      const newConfig: ConfigModel = {
        destino: isChecked,
        ip: servidorIp,
        keyboardHasLetters: isCheckedKeyboard,
      };
      const jsonValue = JSON.stringify(newConfig);
      await AsyncStorage.setItem('@mettre_config', jsonValue);
      dispatch(createConfigEdit(newConfig));
      dispatch(clearAtendenteList({} as AtendenteModel));
    } catch (e) {
      // saving error
    }
    navigate.navigate('signin');
  };

  const handleCancel = () => {
    navigate.navigate('signin');
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  const handleToggleKeyboard = () => {
    setIsCheckedKeyboard(!isCheckedKeyboard);
  };

  const handleAddNewCompany = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleClearAsyncStorage = async () => {
    Alert.alert('Limpar dados', 'Deseja realmente limpar os dados?', [
      {
        text: 'Sim',
        onPress: async () => {
          await AsyncStorage.clear();
          dispatch(createConfigEdit({} as ConfigModel));
          dispatch(clearAtendenteList({} as AtendenteModel));
          dispatch(deleteCompanyList({} as CompanyModel));
        },
      },
      {
        text: 'Não',
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#121214',
      }}>
      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="flex-start"
        alignItems="center"
        padding={4}>
        <Center mb={8} mt={20}>
          <Heading color="white">Configurações</Heading>
        </Center>
        <VStack mb={4}>
          {companyList.length > 0 && (
            <HStack justifyContent="flex-end" mb={4}>
              <NativeButton
                colorScheme="error"
                variant="outline"
                onPress={handleClearAsyncStorage}
                mr={2}>
                <IconFeather name="trash-2" size={18} color="#fff" />
              </NativeButton>
              <NativeButton variant="outline" onPress={handleAddNewCompany}>
                <IconFeather name="plus" size={18} color="#fff" />
              </NativeButton>
            </HStack>
          )}
          <HStack>
            <FlatList
              data={companyList}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => {
                return (
                  <HStack
                    key={index.toString()}
                    p={2}
                    backgroundColor="gray.700"
                    w="full"
                    justifyContent="space-between"
                    alignItems="center">
                    <Text color="white">{item.nome}</Text>
                    <Text color="white">{item.ip}</Text>
                    <Text color="white">{item.porta}</Text>
                    <NativeButton
                      colorScheme="error"
                      onPress={() => handleRemoveCompany(item)}>
                      <IconFeather name="trash" size={18} color="#fff" />
                    </NativeButton>
                  </HStack>
                );
              }}
              ListEmptyComponent={
                <EmptyCompanyList onPress={handleAddNewCompany} />
              }
            />
          </HStack>
        </VStack>

        <Center mb={4}>
          <HStack>
            <Switch size="sm" onToggle={handleToggle} isChecked={isChecked} />
            <Text textAlign="left" color="white" mb={1}>
              Pedir mesa destino ao enviar o pedido?
            </Text>
          </HStack>
        </Center>
        <Center mb={4}>
          <HStack>
            <Switch
              size="sm"
              onToggle={handleToggleKeyboard}
              isChecked={isCheckedKeyboard}
            />
            <Text textAlign="left" color="white" mb={1}>
              Existem letras nos código dos produtos
            </Text>
          </HStack>
        </Center>
        <Button title="Gravar" onPress={handleSave} />
        <Button
          title="Voltar"
          variant="outline"
          mt={2}
          onPress={handleCancel}
        />
        <AddCompanyModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
        />
      </VStack>
    </SafeAreaView>
  );
};

interface EmptyCompanyListProps {
  onPress?: () => void;
}

function EmptyCompanyList({ onPress }: EmptyCompanyListProps) {
  return (
    <HStack justifyContent="space-around" w="full">
      <Text color="white">Nenhuma empresa cadastrada</Text>
      <NativeButton onPress={onPress}>
        <IconFeather name="plus" size={18} color="#fff" />
      </NativeButton>
    </HStack>
  );
}

export default Configuracoes;
