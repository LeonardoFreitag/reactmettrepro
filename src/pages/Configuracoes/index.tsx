import { useNavigation } from '@react-navigation/native';
import { Center, Heading, HStack, Switch, Text, VStack } from 'native-base';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigModel } from '../../models/ConfigModel';
import { useDispatch, useSelector } from 'react-redux';
import { createConfigEdit } from '../../store/ducks/configEdit/actions';
import { RootState } from '../../store/ducks/combineReducers';
import { clearAtendenteList } from '../../store/ducks/atendenteList/actions';
import { AtendenteModel } from '../../models/AtendenteModel';

const Configuracoes: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [servidorIp, setServidorIp] = useState('');
  const configEdit = useSelector((state: RootState) => state.configEdit.data);

  useEffect(() => {
    setIsChecked(configEdit.destino);
    setServidorIp(configEdit.ip);
  }, [configEdit, configEdit.destino, configEdit.ip]);

  const handleSave = useCallback(async () => {
    try {
      const newConfig: ConfigModel = {
        destino: isChecked,
        ip: servidorIp,
      };
      const jsonValue = JSON.stringify(newConfig);
      await AsyncStorage.setItem('@mettre_config', jsonValue);
      dispatch(createConfigEdit(newConfig));
      dispatch(clearAtendenteList({} as AtendenteModel));
    } catch (e) {
      // saving error
    }
    navigate.navigate('signin');
  }, [dispatch, isChecked, navigate, servidorIp]);

  const handleCancel = useCallback(() => {
    navigate.navigate('signin');
  }, [navigate]);

  const handleToglle = useCallback(() => {
    setIsChecked(!isChecked);
  }, [isChecked]);

  return (
    <VStack
      bg={'gray.800'}
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding={4}>
      <Center mb={8}>
        <Heading color="white">Configurações</Heading>
      </Center>
      <Text w="100%" textAlign="left" color="white" mb={1}>
        IP do servidor:
      </Text>
      <Input
        placeholder="ex.: 192.168.0.100"
        keyboardType="number-pad"
        onChangeText={setServidorIp}
        defaultValue={servidorIp}
      />
      <Center mb={24}>
        <HStack>
          <Switch size="sm" onToggle={handleToglle} isChecked={isChecked} />
          <Text textAlign="left" color="white" mb={1}>
            Pedir mesa destino ao enviar o pedido?
          </Text>
        </HStack>
      </Center>
      <Button title="Gravar" onPress={handleSave} />
      <Button title="Voltar" variant="outline" mt={2} onPress={handleCancel} />
    </VStack>
  );
};

export default Configuracoes;
