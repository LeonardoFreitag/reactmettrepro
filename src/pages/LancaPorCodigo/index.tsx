/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  Center,
  FlatList,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Button as NativeButton,
  Box,
  Pressable,
  Spacer,
  useToast,
  Flex,
} from 'native-base';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NumberSpinner } from '../../components/NumberSpinner';
import { RootState } from '../../store/ducks/combineReducers';
import { formatDecimal } from '../../utils/formatDecimal';
import IconFeather from 'react-native-vector-icons/Feather';
import { ObservacoesModel } from '../../models/ObservacoesModel';
import {
  createItemList,
  updateItemList,
} from '../../store/ducks/itemList/actions';
import { ItemModel } from '../../models/ItemModel';
import { useProductSearch } from '../../hooks/product';
import uuid from 'react-native-uuid';
import { createItemEdit } from '../../store/ducks/itemEdit/actions';
import { SafeAreaView } from 'react-native';

const LancaPorCodigo: React.FC = () => {
  const navigate = useNavigation();
  const toast = useToast();
  const dispatch = useDispatch();
  const { productCode, productCodeTyping, productCodeClear } =
    useProductSearch();
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const [amount, setAmount] = useState('1');
  // const [codeProductTyped, setCodeProductTyped] = useState('');
  const observacoesList = useSelector(
    (state: RootState) => state.observacoesList.data,
  );
  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const itemEdit = useSelector((state: RootState) => state.itemEdit.data);
  const atendenteEdit = useSelector(
    (state: RootState) => state.atendenteEdit.data,
  );
  const [selectedObs, setSelectedObs] = useState('');

  useEffect(() => {
    if (itemEdit) {
      productCodeTyping(itemEdit.produtoCodigo);
      setSelectedObs(itemEdit.obs);
    }
  }, [itemEdit, productCodeTyping]);

  const productFounded = useMemo(() => {
    return produtoList.find(opt => opt.codigo === productCode);
  }, [productCode, produtoList]);

  const obsPorGrupo = useMemo(() => {
    if (!productFounded) {
      return observacoesList;
    }

    const data = observacoesList.filter(
      opt => opt.grupo === productFounded.grupo,
    );
    return data;
  }, [observacoesList, productFounded]);

  const handleBack = () => {
    if (itemEdit) {
      dispatch(createItemEdit({} as ItemModel));
    }
    navigate.navigate('atendimento');
  };

  const handleContinue = () => {
    // adiciona o item na listagem
    if (!productFounded) {
      toast.show({
        description: 'Nenhum produto selecionado!',
        duration: 1000,
      });
      return;
    }

    if (itemEdit?.codigo) {
      const newItem: ItemModel = {
        ...itemEdit,
        comandaCodigo: comandaEdit.codigo,
        funcionarioCodigo: atendenteEdit.codigo,
        produtoCodigo: productFounded.codigo,
        descricao: productFounded.nome,
        unidade: productFounded.unidade,
        quantidade: Number(amount),
        unitario: productFounded.preco,
        total: Number(amount) * productFounded.preco,
        grupo: productFounded.grupo,
        subgrupo: productFounded.subgrupo,
        impresso: 'N',
        obs: selectedObs,
        enviado: 'N',
        combinado: false,
        codCombinado: '',
        flavors: [] as ItemModel[],
        repeat: false,
      };
      dispatch(updateItemList(newItem));
    } else {
      const newCodigo = new Date().getTime();
      const newItem: ItemModel = {
        mobileId: uuid.v4().toString(),
        codigo: newCodigo.toString(),
        comandaCodigo: comandaEdit.codigo,
        funcionarioCodigo: atendenteEdit.codigo,
        produtoCodigo: productFounded.codigo,
        descricao: productFounded.nome,
        unidade: productFounded.unidade,
        quantidade: Number(amount),
        unitario: productFounded.preco,
        total: Number(amount) * productFounded.preco,
        hora: newCodigo,
        grupo: productFounded.grupo,
        subgrupo: productFounded.subgrupo,
        impresso: 'N',
        obs: selectedObs,
        enviado: 'N',
        combinado: false,
        codCombinado: '',
        flavors: [] as ItemModel[],
        repeat: false,
      };
      dispatch(createItemList(newItem));
    }
    dispatch(createItemEdit({} as ItemModel));
    productCodeClear();
    navigate.navigate('atendimento');
  };

  const handlePressMinus = () => {
    setAmount(() => {
      let newAmount = Number(amount.replace(',', '.')) - 1;
      if (newAmount <= 0) {
        newAmount = 0.5;
        return formatDecimal(newAmount);
      }
      return formatDecimal(newAmount);
    });
  };

  const handlePressPlus = () => {
    setAmount(() => {
      let newAmount = Number(amount.replace(',', '.')) + 1;
      if (newAmount === 1.5) {
        newAmount = 1;
        return formatDecimal(newAmount);
      }
      return formatDecimal(newAmount);
    });
  };

  const handlePressObs = (obs: ObservacoesModel) => {
    let newObsLine = '';
    if (selectedObs === undefined) {
      newObsLine = `${obs.observacao}; `;
    } else {
      newObsLine = `${selectedObs}${obs.observacao}; `;
    }
    setSelectedObs(newObsLine);
  };

  const handleSearchProduct = () => {
    navigate.navigate('searchProduct');
  };

  const handleCodeTyping = (text: string) => {
    productCodeTyping(text);
  };

  const handleCleanCodeTyped = () => {
    productCodeClear();
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
        alignItems="center"
        padding={4}
        justifyContent="space-between">
        <Heading color="white" mb={1}>
          {`Comanda: ${comandaEdit.comanda}`}
        </Heading>
        <Heading color="white" size="sm">
          {'Adicionar produto'}
        </Heading>

        <VStack flex={1} w="100%" mb={2} mt={2}>
          <Heading color="white" size="sm">
            Código:
          </Heading>
          <HStack w="100%" justifyContent="space-between">
            <Input
              fontSize={18}
              value={productCode}
              w="60%"
              autoFocus
              mb={1}
              placeholderTextColor="white"
              backgroundColor="gray.700"
              color="white"
              keyboardType={
                configEdit.keyboardHasLetters ? 'default' : 'number-pad'
              }
              onChangeText={handleCodeTyping}
            />
            {/* <NativeButton
              h="46px"
              w="18%"
              colorScheme="red"
              onPress={() => handleCleanCodeTyped}>
              <IconFeather name="delete" size={20} color="#fff" />
            </NativeButton> */}
            <NativeButton
              h="46px"
              w="38%"
              colorScheme="green"
              onPress={handleSearchProduct}>
              <IconFeather name="search" size={20} color="#fff" />
            </NativeButton>
          </HStack>
          <Flex
            w="100%"
            backgroundColor="cyan.600"
            rounded={5}
            padding={1}
            mb={2}>
            <Text fontSize={16} color="white">
              {productFounded ? productFounded?.nome : 'não localizado...'}
            </Text>
          </Flex>

          <NumberSpinner
            amount={amount}
            label="Quantidade"
            w={16}
            handlePressMinus={handlePressMinus}
            handlePressPlus={handlePressPlus}
          />
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
              data={obsPorGrupo}
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
        </VStack>
        <HStack w="100%" justifyContent="space-between">
          <Button
            variant="outline"
            w="49%"
            colorScheme="amber"
            h={54}
            onPress={handleBack}>
            <Center>
              <IconFeather name="arrow-left" size={18} color="#d97706" />
              <Text color="amber.600" fontSize="14px" fontWeight="bold">
                Voltar
              </Text>
            </Center>
          </Button>
          <Button
            w="49%"
            colorScheme="green"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleContinue}>
            <Center>
              <IconFeather name="check-square" size={18} color="#fff" />
              <Text color="white" fontSize="14px">
                Incluir produto
              </Text>
            </Center>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
};

export default LancaPorCodigo;
