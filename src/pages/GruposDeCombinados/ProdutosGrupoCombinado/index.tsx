/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  Center,
  FlatList,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
  Input,
  Badge,
} from 'native-base';
import React, { useCallback, useMemo, useState } from 'react';
import IconFeather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/ducks/combineReducers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { ItemModel } from '../../../models/ItemModel';
import uuid from 'react-native-uuid';
import {
  createItemList,
  updateItemList,
} from '../../../store/ducks/itemList/actions';
import { createFlavorEdit } from '../../../store/ducks/flavorEdit/actions';
import { FlavorModel } from '../../../models/FlavorModel';
import { clearFlavorList } from '../../../store/ducks/flavorList/actions';
import {
  clearFlavorsSelected,
  createFlavorsSelected,
} from '../../../store/ducks/flavorsSelected/actions';
import { CombinedModal } from './CombinedModal';
import { useProductSearch } from '../../../hooks/product';
import { SafeAreaView } from 'react-native';

const ProdutosGrupoCombinado: React.FC = () => {
  const { obsFlavor, obsFlavorClear } = useProductSearch();
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();

  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const subgrupoEdit = useSelector(
    (state: RootState) => state.subgrupoEdit.data,
  );
  const flavorEdit = useSelector((state: RootState) => state.flavorEdit.data);
  const flavorList = useSelector((state: RootState) => state.flavorList.data);
  const flavorsSelected = useSelector(
    (state: RootState) => state.flavorsSelected.data,
  );
  const atendenteEdit = useSelector(
    (state: RootState) => state.atendenteEdit.data,
  );
  const [descTyped, setDescTyped] = useState<string>('');
  const [showCombinedModal, setShowCombinedModal] = useState<boolean>(false);

  const handleBack = () => {
    obsFlavorClear();
    dispatch(clearFlavorsSelected({} as FlavorModel));
    navigate.navigate('gruposDeCombinados');
  };

  const handleContinue = () => {
    const newCodigoCombinado = new Date().getTime();
    let totalCombined = 0;
    const flavors: ItemModel[] = flavorsSelected.map((item, index) => {
      let obsLocal = '';
      let qtdeFlavor = 1 / flavorsSelected.length;
      if (flavorsSelected.length === 3) {
        if (index === 2) {
          qtdeFlavor = 0.34;
        } else {
          qtdeFlavor = 0.33;
        }
      }
      if (index === flavorsSelected.length - 1) {
        obsLocal = obsFlavor;
      }
      const flavorPrice = item.preco * qtdeFlavor;
      totalCombined = totalCombined + flavorPrice;
      const newCodigo = new Date().getTime();
      return {
        mobileId: uuid.v4().toString(),
        codigo: newCodigo.toString(),
        comandaCodigo: comandaEdit.codigo,
        funcionarioCodigo: atendenteEdit.codigo,
        produtoCodigo: item.codigo,
        descricao: item.nome,
        unidade: 'UN',
        quantidade: qtdeFlavor,
        unitario: item.preco,
        total: flavorPrice,
        hora: newCodigo,
        grupo: item.grupo,
        subgrupo: item.subgrupo,
        impresso: 'N',
        obs: obsLocal,
        enviado: 'N',
        combinado: false,
        codCombinado: newCodigoCombinado.toString(),
        flavors: [] as ItemModel[],
        repeat: false,
      };
    });
    const newCodigo = new Date().getTime();
    if (flavorEdit.combinado) {
      dispatch(
        updateItemList({
          ...flavorEdit,
          flavors: flavors,
        }),
      );
      dispatch(createFlavorEdit({} as ItemModel));
      dispatch(clearFlavorList({} as FlavorModel));
      navigate.navigate('atendimento');
    } else {
      const item: ItemModel = {
        mobileId: uuid.v4().toString(),
        codigo: newCodigo.toString(),
        comandaCodigo: comandaEdit.codigo,
        funcionarioCodigo: atendenteEdit.codigo,
        produtoCodigo: grupoEdit.codigo,
        descricao: grupoEdit.nome,
        unidade: 'UN',
        quantidade: 1,
        unitario: totalCombined,
        total: totalCombined,
        hora: newCodigo,
        grupo: grupoEdit.nome,
        subgrupo: subgrupoEdit.nome,
        impresso: 'N',
        obs: '',
        enviado: 'N',
        combinado: true,
        codCombinado: newCodigoCombinado.toString(),
        flavors: flavors,
        repeat: false,
      };
      dispatch(createItemList(item));
      obsFlavorClear();
      dispatch(clearFlavorsSelected({} as FlavorModel));
      navigate.navigate('atendimento');
    }
  };

  const memoFlavorList = useMemo(() => {
    if (descTyped.trim() !== '') {
      const desc = descTyped.toLowerCase();
      return flavorList.filter(flavorItem =>
        flavorItem.nome.toLowerCase().includes(desc),
      );
    }
    return [] as FlavorModel[];
  }, [descTyped, flavorList]);

  const handlePressProduct = (itemSelected: FlavorModel) => {
    if (
      flavorsSelected.length === grupoEdit.sabores &&
      !itemSelected.selected
    ) {
      toast.show({
        description: 'Limite de sabores atingido!',
        duration: 1000,
      });
      return;
    }
    dispatch(createFlavorsSelected(itemSelected));
  };

  const handleShowCombinedModal = () => {
    setShowCombinedModal(true);
  };

  const handleCancelCombinedModal = () => {
    setShowCombinedModal(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#121214',
      }}>
      {showCombinedModal && (
        <CombinedModal
          isOpen={showCombinedModal}
          handleCancel={handleCancelCombinedModal}
        />
      )}

      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <Heading
          color="white"
          size="md">{`Comanda: ${comandaEdit.comanda} - Pedido combinado`}</Heading>
        <HStack
          marginY="5px"
          w="100%"
          p="8px"
          borderColor="amber.100"
          borderStyle="solid"
          borderWidth={1}
          borderRadius={5}
          justifyContent="space-between">
          <VStack w="80%" justifyContent="center">
            <Heading color="white" size="sm">
              {`${grupoEdit.nome} até ${grupoEdit.sabores} sabores`}
            </Heading>
            {/* <Heading color="white" size="sm">
              {`Obs.: ${obsCombined}`}
            </Heading> */}
          </VStack>
          <VStack w="20%">
            <Badge // bg="red.400"
              colorScheme="danger"
              rounded="full"
              mb={-4}
              mr={-1}
              zIndex={1}
              variant="solid"
              alignSelf="flex-end"
              _text={{
                fontSize: 12,
              }}>
              {flavorsSelected.length}
            </Badge>
            <Button
              mx={{
                base: 'auto',
                md: 0,
              }}
              h="46px"
              w="56px"
              colorScheme="green"
              onPress={handleShowCombinedModal}>
              <IconFeather name="pie-chart" size={20} color="#fff" />
            </Button>
          </VStack>
        </HStack>
        <HStack w="100%" justifyContent="space-between" mt={2}>
          <Input
            fontSize={18}
            value={descTyped}
            w="83%"
            autoFocus
            mb={1}
            placeholderTextColor="white"
            backgroundColor="gray.700"
            color="white"
            onChangeText={setDescTyped}
          />
          <Button
            h="46px"
            w="15%"
            colorScheme="red"
            onPress={() => setDescTyped('')}>
            <IconFeather name="delete" size={20} color="#fff" />
          </Button>
        </HStack>
        <Flex flex={1} w="100%" mb={2}>
          <FlatList
            data={memoFlavorList}
            renderItem={({ item }) => (
              <HStack
                rounded="5"
                shadow={3}
                borderColor="gray.100"
                mb={1}
                w="100%"
                justifyContent="space-between">
                <VStack
                  p={1}
                  backgroundColor="gray.100"
                  borderRadius={5}
                  w="84%">
                  <HStack
                    w="100%"
                    justifyContent="space-between"
                    alignItems="center"
                    h="40px"
                    px={4}>
                    <Text w="70%">{`${item.codigo}-${item.nome}`}</Text>
                    <Text w="30%" textAlign="right">{`${formatCurrency(
                      item.preco,
                    )}`}</Text>
                  </HStack>
                </VStack>

                <Button
                  w="15%"
                  onPress={() => {
                    handlePressProduct(item);
                  }}>
                  <Center>
                    <IconFeather name="plus-square" size={20} color="#fff" />
                  </Center>
                </Button>
              </HStack>
            )}
          />
        </Flex>

        <HStack w="100%" justifyContent="space-between">
          <Button
            variant="outline"
            w="48%"
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
            w="48%"
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

export default ProdutosGrupoCombinado;
