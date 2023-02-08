import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  FlatList,
  Input,
  Heading,
  HStack,
  Pressable,
  Spacer,
  Text,
  VStack,
  useToast,
  Button as NativeButton,
} from 'native-base';
import { useCallback, useMemo, useState } from 'react';
// import { Button } from '../../components/Button';
import { ObservacoesModel } from '../../../../models/ObservacoesModel';
import IconFeather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/ducks/combineReducers';
import uuid from 'react-native-uuid';
import { createItemList } from '../../../../store/ducks/itemList/actions';
import { ItemModel } from '../../../../models/ItemModel';

type RouteParams = {
  amount: string;
};

const ObservacoesPorGrupo: React.FC = () => {
  const route = useRoute();
  const toast = useToast();
  const dispatch = useDispatch();
  const { amount } = route.params as RouteParams;
  const navigate = useNavigation();
  const observacoesList = useSelector(
    (state: RootState) => state.observacoesList.data,
  );
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const subgrupoEdit = useSelector(
    (state: RootState) => state.subgrupoEdit.data,
  );
  const produtoEdit = useSelector((state: RootState) => state.produtoEdit.data);
  const atendenteEdit = useSelector(
    (state: RootState) => state.atendenteEdit.data,
  );
  const [selectedObs, setSelectedObs] = useState('');

  const observacoesFiltered = useMemo(() => {
    const data = observacoesList.filter(opt => opt.grupo === grupoEdit.nome);
    return data;
  }, [grupoEdit.nome, observacoesList]);

  const handleBack = useCallback(() => {
    navigate.navigate('produtosPorGrupo');
  }, [navigate]);

  const handleContinue = useCallback(() => {
    if (!produtoEdit) {
      toast.show({
        description: 'Nenhum produto selecionado!',
      });
      return;
    }
    const newCodigo = new Date().getTime();
    const newItem: ItemModel = {
      mobileId: uuid.v4().toString(),
      codigo: newCodigo.toString(),
      comandaCodigo: comandaEdit.codigo,
      funcionarioCodigo: atendenteEdit.codigo,
      produtoCodigo: produtoEdit.codigo,
      descricao: produtoEdit.nome,
      unidade: produtoEdit.unidade,
      quantidade: Number(amount),
      unitario: produtoEdit.preco,
      total: Number(amount) * produtoEdit.preco,
      hora: newCodigo,
      grupo: produtoEdit.grupo,
      subgrupo: produtoEdit.subgrupo,
      impresso: 'N',
      obs: selectedObs,
      enviado: 'N',
      combinado: false,
      codCombinado: '',
      flavors: [] as ItemModel[],
    };
    dispatch(createItemList(newItem));
    navigate.navigate('produtosPorGrupo');
  }, [
    amount,
    atendenteEdit.codigo,
    comandaEdit.codigo,
    dispatch,
    navigate,
    produtoEdit,
    selectedObs,
    toast,
  ]);

  const handlePressObs = useCallback(
    (obs: ObservacoesModel) => {
      let newObsLine = '';
      if (selectedObs.trim() === '') {
        newObsLine = `${obs.observacao}; `;
      } else {
        newObsLine = `${selectedObs}${obs.observacao}; `;
      }
      setSelectedObs(newObsLine);
    },
    [selectedObs],
  );

  return (
    <>
      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <Center>
          <Heading w="100%" color="white" mb={3} justifyContent="center">
            {`Comanda: ${comandaEdit.comanda}`}
          </Heading>
          <Text
            w="100%"
            color="white"
            fontSize={
              12
            }>{`${grupoEdit.nome} -> ${subgrupoEdit.nome} -> ${produtoEdit.nome}`}</Text>

          <Heading w="100%" color="white" size="md" mt={3}>
            {`Quantidade: ${amount}`}
          </Heading>
        </Center>

        <VStack
          w="100%"
          borderColor="cyan.600"
          borderWidth={1}
          mt={2}
          mb={2}
          rounded={5}
          padding={2}
          flex={1}>
          <Center backgroundColor="cyan.600" mb={2} rounded={5}>
            <Text color="#fff">Observações</Text>
          </Center>
          <HStack w="100%" justifyContent="space-between">
            <Input
              fontSize={12}
              value={selectedObs}
              w="80%"
              mb={1}
              placeholderTextColor="white"
              backgroundColor="gray.700"
              color="white"
              keyboardType="default"
              onChangeText={setSelectedObs}
            />
            <NativeButton
              h="46px"
              w="18%"
              colorScheme="red"
              onPress={() => setSelectedObs('')}>
              <IconFeather name="delete" size={20} color="#fff" />
            </NativeButton>
          </HStack>
          <FlatList
            data={observacoesFiltered}
            numColumns={2}
            renderItem={({ item }) => (
              <Pressable
                mr={1}
                maxW="96"
                minW="49%"
                onPress={() => handlePressObs(item)}
                mb={1}
                key="item.id">
                {({ isHovered, isPressed }) => {
                  return (
                    <Box
                      bg={
                        isPressed
                          ? 'coolGray.200'
                          : isHovered
                          ? 'coolGray.200'
                          : 'coolGray.100'
                      }
                      style={{
                        transform: [
                          {
                            scale: isPressed ? 0.96 : 1,
                          },
                        ],
                      }}
                      p="1"
                      rounded="8"
                      shadow={3}
                      borderWidth="1"
                      borderColor="coolGray.300">
                      <HStack alignItems="center">
                        <Box
                          colorScheme="darkBlue"
                          variant="solid"
                          rounded="4"
                          padding="2">
                          <Heading size="xs" color="gray.600">
                            {item.observacao}
                          </Heading>
                        </Box>
                        <Spacer />
                      </HStack>
                    </Box>
                  );
                }}
              </Pressable>
            )}
          />
        </VStack>

        <HStack w="100%" justifyContent="space-between">
          <Button
            variant="outline"
            w="49%"
            colorScheme="amber"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleBack}>
            Voltar
          </Button>
          <Button
            w="49%"
            colorScheme="green"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleContinue}>
            <Center>
              <Text color="white">Confirmar</Text>
            </Center>
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default ObservacoesPorGrupo;
