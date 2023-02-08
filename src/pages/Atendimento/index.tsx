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
  useClipboard,
} from 'native-base';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ItemModel } from '../../models/ItemModel';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/ducks/combineReducers';
import {
  clearItemList,
  createItemList,
  deleteItemList,
  loadItemList,
  updateItemList,
} from '../../store/ducks/itemList/actions';
import { formatDecimal } from '../../utils/formatDecimal';
import { formatCurrency } from '../../utils/formatCurrency';
import { FlatList as FlatListRectNative } from 'react-native';
import { ICreateItemsDTO } from '../../DTOS/ICreateItemsDTO';
import { IResultItemsDTO } from '../../DTOS/IResultItemsDTO';
import { setUtl } from '../../services/api';
import { loadComandaList } from '../../store/ducks/comandaList/actions';
import { ComandaModel } from '../../models/ComandaModel';
import { createGrupoEdit } from '../../store/ducks/grupoEdit/actions';
import { updateGrupoList } from '../../store/ducks/grupoList/actions';
import { GrupoModel } from '../../models/GrupoModel';
import { FlavorList } from '../../components/FlavorList';
import { createFlavorEdit } from '../../store/ducks/flavorEdit/actions';
import uuid from 'react-native-uuid';
import { createItemEdit } from '../../store/ducks/itemEdit/actions';
import { FechamentoModal } from './FechamentoModal';
import { AlertDialogModal } from '../../components/AlertDialogModal';

const Atendimento: React.FC = () => {
  const flatProdutos = useRef<FlatListRectNative>();
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const [itemIsEditing, setItemIsEditing] = useState<boolean>(false);
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const grupoList = useSelector((state: RootState) => state.grupoList.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const atendenteEdit = useSelector(
    (state: RootState) => state.atendenteEdit.data,
  );
  const itemList = useSelector((state: RootState) => state.itemList.data);
  const [mesaDestino, setMesaDestino] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showFechamento, setShowFechamento] = useState(false);
  const [alertDialogShow, setAlertDialogShow] = useState(false);

  const loadItems = useCallback(() => {
    if (comandaEdit.criada) {
      const api = setUtl(configEdit.ip);
      api
        .get<ItemModel[]>(`itens/${comandaEdit.codigo}`)
        .then(response => {
          dispatch(loadItemList(response.data));
        })
        .catch(() => {
          toast.show({
            description: 'Sem comunicação com API!',
          });
          navigate.navigate('signin');
        });
    } else {
      dispatch(clearItemList({} as ItemModel));
    }
  }, [
    comandaEdit.codigo,
    comandaEdit.criada,
    configEdit.ip,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSendRequest = useCallback(async () => {
    try {
      const dataFilter = itemList.filter(opt => opt.impresso === 'N');
      if (dataFilter.length === 0) {
        toast.show({
          description: 'Nenum produto para ser enviado!',
        });
        return;
      }
      setSendingRequest(true);

      const api = setUtl(configEdit.ip);
      const newComanda = {
        mesa: comandaEdit.comanda,
        codAtendente: atendenteEdit.codigo,
      };
      const responseMesas = await api.put('/mesas', newComanda);
      const codMesaInserted = responseMesas.data[0].oretorno;
      if (codMesaInserted === 0) {
        toast.show({
          description: 'Comanda fechada! Dirija-se ao caixa!',
        });
        setSendingRequest(false);
        return;
      } else {
        const dataToSend: ICreateItemsDTO[] = dataFilter.map(item => {
          return {
            codMesa: codMesaInserted,
            codProduto: item.produtoCodigo,
            qtde: item.quantidade,
            obs: item.obs,
            codAtendente: atendenteEdit.codigo,
            destino: mesaDestino,
            mobileId: item.mobileId,
            combinado: item.combinado,
            codCombinado: '',
            flavors: item.flavors.map(flavor => {
              return {
                codMesa: codMesaInserted,
                codProduto: flavor.produtoCodigo,
                qtde: flavor.quantidade,
                obs: flavor.obs,
                codAtendente: atendenteEdit.codigo,
                destino: mesaDestino,
                mobileId: flavor.mobileId,
                combinado: true,
                codCombinado: flavor.codCombinado,
                flavors: [] as ICreateItemsDTO[],
              };
            }),
          };
        });
        api
          .put<IResultItemsDTO[]>('itens', dataToSend)
          .then(response => {
            let ok = true;
            response.data.forEach(item => {
              if (item.inserido === 'S') {
                const itemToUpdated: ItemModel | undefined = itemList.find(
                  opt => opt.mobileId === item.mobileId,
                );
                if (itemToUpdated) {
                  dispatch(
                    updateItemList({
                      ...itemToUpdated,
                      enviado: 'S',
                      impresso: 'S',
                    }),
                  );
                }
              } else {
                ok = false;
              }
            });

            if (ok) {
              toast.show({
                description: 'Pedido enviado com sucesso!',
              });
              api.get<ComandaModel[]>('/mesas').then(respComandas => {
                const data = respComandas.data.map(comanda => {
                  return {
                    ...comanda,
                    criada: true,
                  };
                });
                dispatch(loadComandaList(data));
              });
              setSendingRequest(false);
              navigate.navigate('comandas');
            } else {
              toast.show({
                description:
                  'Problema ao tentar enviar produtos! Você pode tentar novamente.',
              });
              setSendingRequest(false);
            }
          })
          .catch(() => {
            toast.show({
              description: 'Sem comunicação com API.',
            });
            setSendingRequest(false);

            return;
          });
      }
    } catch (erro) {
      toast.show({
        description: 'Não foi possível enviar pedido!',
      });
      setSendingRequest(false);

      return;
    }
  }, [
    atendenteEdit.codigo,
    comandaEdit.codigo,
    configEdit.ip,
    dispatch,
    itemList,
    mesaDestino,
    navigate,
    toast,
  ]);

  const handleBack = useCallback(() => {
    const pendingItens = itemList.filter(opt => opt.enviado === 'N');
    if (pendingItens.length > 0) {
      setAlertDialogShow(true);
    } else {
      navigate.navigate('comandas');
    }
  }, [navigate]);

  const handleItemEdit = useCallback(
    (item: ItemModel) => {
      if (item.combinado) {
        const grupo = grupoList.find(opt => opt.nome === item.grupo);
        if (grupo) {
          dispatch(createGrupoEdit(grupo));
        }
        dispatch(createFlavorEdit(item));
        navigate.navigate('produtosGrupoCombinado');
      } else {
        dispatch(createItemEdit(item));
        navigate.navigate('lancaPorCodigo');
      }
    },
    [dispatch, grupoList, navigate],
  );

  const handleItemDelete = useCallback(
    (item: ItemModel) => {
      dispatch(deleteItemList(item));
    },
    [dispatch],
  );

  const handleRepeat = useCallback(
    (item: ItemModel) => {
      if (item.combinado) {
        const flavors: ItemModel[] = item.flavors.map(flavor => {
          const newCodigo = new Date().getTime();
          console.log(flavor);
          return {
            mobileId: uuid.v4().toString(),
            codigo: newCodigo.toString(),
            comandaCodigo: comandaEdit.codigo,
            funcionarioCodigo: atendenteEdit.codigo,
            produtoCodigo: flavor.produtoCodigo,
            descricao: flavor.descricao,
            unidade: 'UN',
            quantidade: flavor.quantidade,
            unitario: flavor.unitario,
            total: flavor.total,
            hora: newCodigo,
            grupo: flavor.grupo,
            subgrupo: flavor.subgrupo,
            impresso: 'N',
            obs: flavor.obs,
            enviado: 'N',
            combinado: false,
            codCombinado: '',
            flavors: [] as ItemModel[],
          };
        });
        console.log(flavors);
        const newCodigo = new Date().getTime();
        const newItem: ItemModel = {
          mobileId: uuid.v4().toString(),
          codigo: newCodigo.toString(),
          comandaCodigo: comandaEdit.codigo,
          funcionarioCodigo: atendenteEdit.codigo,
          produtoCodigo: item.produtoCodigo,
          descricao: item.descricao,
          unidade: item.unidade,
          quantidade: item.quantidade,
          unitario: item.unitario,
          total: item.total,
          hora: newCodigo,
          grupo: item.grupo,
          subgrupo: item.subgrupo,
          impresso: 'N',
          obs: item.obs,
          enviado: 'N',
          combinado: true,
          codCombinado: '',
          flavors: flavors as ItemModel[],
        };
        dispatch(createItemList(newItem));
      } else {
        const newCodigo = new Date().getTime();
        const newItem: ItemModel = {
          mobileId: uuid.v4().toString(),
          codigo: newCodigo.toString(),
          comandaCodigo: comandaEdit.codigo,
          funcionarioCodigo: atendenteEdit.codigo,
          produtoCodigo: item.codigo,
          descricao: item.descricao,
          unidade: item.unidade,
          quantidade: item.quantidade,
          unitario: item.unitario,
          total: item.total,
          hora: newCodigo,
          grupo: item.grupo,
          subgrupo: item.subgrupo,
          impresso: 'N',
          obs: item.obs,
          enviado: 'N',
          combinado: false,
          codCombinado: '',
          flavors: [] as ItemModel[],
        };
        dispatch(createItemList(newItem));
      }
    },
    [atendenteEdit.codigo, comandaEdit.codigo, dispatch],
  );

  const handleAddProduct = useCallback(() => {
    navigate.navigate('lancaPorCodigo');
  }, [navigate]);

  const handleListByGroup = useCallback(() => {
    if (grupoEdit) {
      dispatch(
        updateGrupoList({
          ...grupoEdit,
          selected: false,
        }),
      );
      dispatch(createGrupoEdit({} as GrupoModel));
    }
    navigate.navigate('listaPorSubgrupo');
  }, [dispatch, grupoEdit, navigate]);

  const handleCombinedProduct = useCallback(() => {
    navigate.navigate('gruposDeCombinados');
  }, [navigate]);

  const handleShowFechamento = useCallback(() => {
    setShowFechamento(true);
  }, []);

  const handleCloseFechamento = useCallback(async (closeBill: boolean) => {
    setShowFechamento(false);
    if (closeBill) {
      const api = setUtl(configEdit.ip);
      try {
        const response = await api.get<ComandaModel[]>('/mesas');
        const data = response.data.map(comanda => {
          return {
            ...comanda,
            criada: true,
          };
        });
        dispatch(loadComandaList(data));
        navigate.navigate('comandas');
      } catch {
        toast.show({
          description: 'Problemas ao fechar a conta. Dirija-se ao caixa.',
        });
      }
    }
  }, []);

  const handleCancelBack = useCallback(() => {
    setAlertDialogShow(false);
  }, []);

  const handleConfirmBack = useCallback(() => {
    setAlertDialogShow(false);
    navigate.navigate('comandas');
  }, [navigate]);

  return (
    <>
      {alertDialogShow && (
        <AlertDialogModal
          isOpen={alertDialogShow}
          title="Atenção"
          bodyText="Descartar itens não enviados?"
          confirmText="Descartar"
          cancelText="Cancelar"
          handleCancel={handleCancelBack}
          handleConfirm={handleConfirmBack}
        />
      )}
      {showFechamento && (
        <FechamentoModal
          isOpen={showFechamento}
          handleCancel={handleCloseFechamento}
        />
      )}

      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <HStack justifyContent="space-between" w="100%">
          <Center w="70%">
            <Heading color="white">{`Comanda: ${comandaEdit.comanda}`}</Heading>
          </Center>
          <Button
            w="30%"
            colorScheme="green"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleShowFechamento}>
            <Center>
              <IconFeather name="printer" size={20} color="#fff" />
              <Text color="white">Conta</Text>
            </Center>
          </Button>
        </HStack>
        <Flex flex={1} w="100%" mb={2} mt={2}>
          <FlatList
            ref={flatProdutos}
            data={itemList}
            onContentSizeChange={() => flatProdutos.current?.scrollToEnd()}
            renderItem={({ item }) => {
              if (item.impresso === 'S') {
                return (
                  <HStack
                    w="100%"
                    justifyContent="space-between"
                    backgroundColor="gray.300"
                    rounded={5}
                    padding={2}
                    mb={1}>
                    <VStack w="80%">
                      <Text fontWeight="bold">{`${formatDecimal(
                        item.quantidade,
                      )} - ${item.descricao}`}</Text>
                      {item.combinado && <FlavorList flavors={item.flavors} />}
                      <Text
                        color="green.600"
                        fontWeight="bold"
                        textAlign="right"
                        w="100%">{`${formatCurrency(item.total)}`}</Text>
                      {item.obs.trim() !== '' && (
                        <Text
                          fontSize={12}
                          fontStyle="italic">{`Obs: ${item.obs}`}</Text>
                      )}
                    </VStack>
                    <Button onPress={() => handleRepeat(item)}>
                      <Icon name="repeat" size={30} color="#fff" />
                    </Button>
                  </HStack>
                );
              }
              return (
                <VStack
                  bgColor="gray.300"
                  rounded={5}
                  borderWidth={4}
                  borderColor="red.600">
                  <HStack
                    w="100%"
                    justifyContent="space-between"
                    backgroundColor="gray.300"
                    rounded={5}
                    padding={2}>
                    <VStack w="80%">
                      <Text fontWeight="bold">{`${formatDecimal(
                        item.quantidade,
                      )} - ${item.descricao}`}</Text>
                      {item.combinado && <FlavorList flavors={item.flavors} />}
                      <Text
                        color="green.600"
                        fontWeight="bold"
                        textAlign="right"
                        w="100%">{`${formatCurrency(item.total)}`}</Text>
                      {!item.obs === undefined && (
                        <Text
                          fontSize={12}
                          fontStyle="italic">{`Obs: ${item.obs}`}</Text>
                      )}
                    </VStack>
                    <Button onPress={() => handleRepeat(item)}>
                      <Icon name="repeat" size={30} color="#fff" />
                    </Button>
                  </HStack>
                  <HStack
                    w="100%"
                    justifyContent="space-between"
                    backgroundColor="gray.600"
                    padding={2}>
                    <Button onPress={() => handleItemDelete(item)}>
                      <Icon name="delete" size={30} color="#c11e1e" />
                    </Button>
                    <Button onPress={() => handleItemEdit(item)}>
                      <Icon name="edit" size={30} color="#fff" />
                    </Button>
                  </HStack>
                </VStack>
              );
            }}
          />
        </Flex>
        <HStack w="100%" justifyContent="space-between" mb={1}>
          <Button w="32%" h={54} fontFamily="body" onPress={handleAddProduct}>
            <Center>
              <Icon name="add" size={20} color="#fff" />
              <Text color="white" fontSize={10}>
                Adicionar
              </Text>
            </Center>
          </Button>

          <Button w="32%" h={54} fontFamily="body" onPress={handleListByGroup}>
            <Center>
              <Icon name="search" size={20} color="#fff" />
              <Text color="white" fontSize={10}>
                Localizar
              </Text>
            </Center>
          </Button>
          <Button
            w="32%"
            h={54}
            fontFamily="body"
            onPress={handleCombinedProduct}>
            <Center>
              <IconFeather name="pie-chart" size={20} color="#fff" />
              <Text color="white" fontSize={10}>
                Combinado
              </Text>
            </Center>
          </Button>
        </HStack>
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
            isLoading={sendingRequest}
            isLoadingText="Enviando pedido"
            onPress={handleSendRequest}>
            <Center>
              <IconFeather name="printer" size={20} color="#fff" />
              <Text color="white">Enviar pedido</Text>
            </Center>
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default Atendimento;
