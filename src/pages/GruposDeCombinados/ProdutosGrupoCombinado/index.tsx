import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  FlatList,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
} from 'native-base';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProdutoModel } from '../../../models/ProdutoModel';
import IconFeather from 'react-native-vector-icons/Feather';
import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { ObservacoesModal } from '../ObservacoesModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/ducks/combineReducers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { createProdutoEdit } from '../../../store/ducks/produtoEdit/actions';
import { useProductSearch } from '../../../hooks/product';
import { ItemModel } from '../../../models/ItemModel';
import uuid from 'react-native-uuid';
import {
  createItemList,
  updateItemList,
} from '../../../store/ducks/itemList/actions';
import { createFlavorEdit } from '../../../store/ducks/flavorEdit/actions';

interface ProductSelectableModel extends ProdutoModel {
  obs: string;
}

const ProdutosGrupoCombinado: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const { obsFlavorTyping } = useProductSearch();

  const [showObservacoesModal, setShowObservacoesModal] =
    useState<boolean>(false);
  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const subgrupoEdit = useSelector(
    (state: RootState) => state.subgrupoEdit.data,
  );
  const flavorEdit = useSelector((state: RootState) => state.flavorEdit.data);
  const atendenteEdit = useSelector(
    (state: RootState) => state.atendenteEdit.data,
  );
  const [flavorsList, setFlavorsList] = useState<ProductSelectableModel[]>(
    [] as ProductSelectableModel[],
  );
  const [flavorEditLocal, setFlavorEditLocal] =
    useState<ProductSelectableModel>({} as ProductSelectableModel);

  useEffect(() => {
    const dataFiltered = produtoList.filter(
      opt => opt.grupo === grupoEdit.nome,
    );
    let data = dataFiltered.map(item => {
      return {
        ...item,
        selected: false,
        obs: '',
      };
    });
    if (flavorEdit.combinado) {
      flavorEdit.flavors.forEach(flavor => {
        data = data.map(item => {
          return item.codigo === flavor.produtoCodigo
            ? {
                ...item,
                obs: flavor.obs,
                selected: true,
              }
            : item;
        });
      });
    }
    setFlavorsList(data);
  }, [flavorEdit.combinado, flavorEdit.flavors, grupoEdit.nome, produtoList]);

  const handleBack = useCallback(() => {
    navigate.navigate('gruposDeCombinados');
  }, [navigate]);

  const handleContinue = useCallback(() => {
    // compoe o produto
    const newCodigoCombinado = new Date().getTime();
    const data = flavorsList.filter(opt => opt.selected);
    let totalCombined = 0;
    const flavors: ItemModel[] = data.map((item, index) => {
      let qtdeFlavor = 1 / data.length;
      if (data.length === 3) {
        if (index === 2) {
          qtdeFlavor = 0.34;
        } else {
          qtdeFlavor = 0.33;
        }
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
        obs: item.obs,
        enviado: 'N',
        combinado: false,
        codCombinado: newCodigoCombinado.toString(),
        flavors: [] as ItemModel[],
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
      };
      dispatch(createItemList(item));
      navigate.navigate('atendimento');
    }
  }, [
    atendenteEdit.codigo,
    comandaEdit.codigo,
    dispatch,
    flavorEdit,
    flavorsList,
    grupoEdit.codigo,
    grupoEdit.nome,
    navigate,
    subgrupoEdit.nome,
  ]);

  const saboresSel = useMemo(() => {
    const selected = flavorsList.filter(opt => opt.selected);
    return selected.length;
  }, [flavorsList]);

  const handlePressProduct = useCallback(
    (itemSelected: ProdutoModel) => {
      if (saboresSel === grupoEdit.sabores && !itemSelected.selected) {
        toast.show({
          description: 'Limite de sabores atingido!',
        });
        return;
      }
      setFlavorsList(() => {
        return flavorsList.map(item => {
          return item.codigo === itemSelected.codigo
            ? {
                ...item,
                selected: !item.selected,
              }
            : item;
        });
      });
    },
    [flavorsList, grupoEdit.sabores, saboresSel, toast],
  );

  const handleEditObsProduct = useCallback((item: ProductSelectableModel) => {
    setFlavorEditLocal(item);
    setShowObservacoesModal(true);
  }, []);

  const handleCancelEditObs = useCallback(() => {
    setShowObservacoesModal(false);
  }, []);

  const handleConfirmEditObs = useCallback(
    (obs: string) => {
      setFlavorsList(() => {
        return flavorsList.map(item => {
          return item.codigo === flavorEditLocal.codigo
            ? {
                ...item,
                obs: obs,
              }
            : item;
        });
      });
      setShowObservacoesModal(false);
    },
    [flavorEditLocal.codigo, flavorsList],
  );

  const handleClearObs = useCallback(
    (flavor: ProductSelectableModel) => {
      setFlavorEditLocal(flavor);
      setShowObservacoesModal(true);
      obsFlavorTyping(flavor.obs);
    },
    [obsFlavorTyping],
  );

  return (
    <>
      <ObservacoesModal
        isOpen={showObservacoesModal}
        handleCancel={handleCancelEditObs}
        handleSave={handleConfirmEditObs}
      />
      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <Heading color="white">{`Comanda: ${comandaEdit.comanda}`}</Heading>
        <Heading color="white" size="md" mb={2}>
          {'Pedido combinado'}
        </Heading>
        <Text color="white" fontSize={12}>
          {`${grupoEdit.nome}: ${grupoEdit.sabores} sabores`}
        </Text>
        <Heading color="white" size="sm">
          {`Sabores selecionados: ${saboresSel}`}
        </Heading>
        <Flex flex={1} w="100%" mb={2} mt={2}>
          <FlatList
            data={flavorsList}
            renderItem={({ item }) => (
              <Box rounded="5" shadow={3} borderColor="coolGray.300" mb={2}>
                <VStack
                  p={1}
                  backgroundColor={item.selected ? 'green.600' : 'gray.100'}
                  borderTopRadius={5}>
                  <HStack w="100%" justifyContent="space-between">
                    <Heading size="xs" w="70%">
                      {`${item.codigo}-${item.nome}`}
                    </Heading>
                    <Heading
                      size="xs"
                      w="30%"
                      textAlign="right">{`${formatCurrency(
                      item.preco,
                    )}`}</Heading>
                  </HStack>
                  <Text fontSize={12} fontStyle="italic">{`${item.obs}`}</Text>
                </VStack>
                <VStack backgroundColor="gray.600" borderBottomRadius={5} p={1}>
                  <HStack w="100%" justifyContent="space-between">
                    {item.obs.trim() !== '' && (
                      <Button w="120px" onPress={() => handleClearObs(item)}>
                        <Center>
                          <IconFeather
                            name="message-square"
                            size={20}
                            color="#e71919"
                          />
                          <Text color="#e71919">Observações</Text>
                        </Center>
                      </Button>
                    )}
                    {item.obs.trim() === '' && (
                      <Button
                        w="120px"
                        onPress={() => handleEditObsProduct(item)}>
                        <Center>
                          <IconFeather
                            name="message-square"
                            size={20}
                            color="#fff"
                          />
                          <Text color="#fff">Observações</Text>
                        </Center>
                      </Button>
                    )}
                    {item.selected && (
                      <Button
                        w="120px"
                        onPress={() => {
                          handlePressProduct(item);
                        }}>
                        <Center>
                          <IconFeather
                            name="plus-square"
                            size={20}
                            color="#e71919"
                          />
                          <Text color="#e71919">Remover</Text>
                        </Center>
                      </Button>
                    )}
                    {!item.selected && (
                      <Button
                        w="120px"
                        onPress={() => {
                          handlePressProduct(item);
                        }}>
                        <Center>
                          <IconFeather
                            name="plus-square"
                            size={20}
                            color="#fff"
                          />
                          <Text color="#fff">Adicionar</Text>
                        </Center>
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </Box>
            )}
          />
        </Flex>

        <HStack w="100%" justifyContent="space-between">
          <Button
            variant="outline"
            w="48%"
            colorScheme="amber"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleBack}>
            Voltar
          </Button>
          <Button
            w="48%"
            colorScheme="amber"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleContinue}>
            Continuar
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default ProdutosGrupoCombinado;
