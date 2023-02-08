import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  FlatList,
  Flex,
  Heading,
  HStack,
  Pressable,
  Spacer,
  Text,
  VStack,
  useToast,
} from 'native-base';
import { useCallback, useEffect, useMemo, useState } from 'react';
// import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ComandaModel } from '../../models/ComandaModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUtl } from '../../services/api';
import { ProdutoModel } from '../../models/ProdutoModel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/ducks/combineReducers';
import { loadProdutoList } from '../../store/ducks/produtoList/actions';
import {
  createComandaList,
  loadComandaList,
} from '../../store/ducks/comandaList/actions';
import { createComandaEdit } from '../../store/ducks/comandaEdit/actions';
import { loadObservacoesList } from '../../store/ducks/observacoesList/actions';
import { ObservacoesModel } from '../../models/ObservacoesModel';
import { GrupoModel } from '../../models/GrupoModel';
import { loadGrupoList } from '../../store/ducks/grupoList/actions';
import { SubgrupoModel } from '../../models/SubgrupoModel';
import { loadSubgrupoList } from '../../store/ducks/subgrupoList/actions';

const Comandas: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const comandaList = useSelector((state: RootState) => state.comandaList.data);
  const atendenteEdit = useSelector(
    (state: RootState) => state.atendenteEdit.data,
  );
  const [comandaTyped, setComandaTyped] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshComandas = useCallback(async () => {
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    } catch {
      setIsRefreshing(false);
      toast.show({
        description: 'Sem comunicação com API!',
      });
    }
  }, [configEdit.ip, dispatch]);

  useEffect(() => {
    const loadSubgrupos = async () => {
      const api = setUtl(configEdit.ip);
      try {
        const response = await api.get<SubgrupoModel[]>('/subgrupos');
        dispatch(loadSubgrupoList(response.data));
      } catch {}
    };
    loadSubgrupos;
  }, [configEdit.ip, dispatch]);

  useEffect(() => {
    const loadGrupos = async () => {
      const api = setUtl(configEdit.ip);
      try {
        const response = await api.get<GrupoModel[]>('/grupos');
        const dataGroups = response.data.map(item => {
          return {
            ...item,
            selected: false,
          };
        });

        dispatch(loadGrupoList(dataGroups));
      } catch {}
    };
    loadGrupos();
  }, [configEdit.ip, dispatch]);

  useEffect(() => {
    const loadProducts = async () => {
      const api = setUtl(configEdit.ip);
      try {
        const response = await api.get<ProdutoModel[]>('/products');
        const data = response.data.map(item => {
          return {
            ...item,
            selected: false,
          };
        });

        dispatch(loadProdutoList(data));
      } catch {}
    };
    loadProducts();
  }, [configEdit.ip, dispatch]);

  useEffect(() => {
    const loadObservacoes = async () => {
      const api = setUtl(configEdit.ip);
      try {
        const response = await api.get<ObservacoesModel[]>('/obs');
        dispatch(loadObservacoesList(response.data));
      } catch {}
    };
    loadObservacoes();
  }, [configEdit.ip, dispatch]);

  useEffect(() => {
    // const loadComandas = async () => {
    //   const api = setUtl(configEdit.ip);
    //   try {
    //     const response = await api.get<ComandaModel[]>('/mesas');
    //     const data = response.data.map(comanda => {
    //       return {
    //         ...comanda,
    //         criada: true,
    //       };
    //     });
    //     dispatch(loadComandaList(data));
    //     setIsRefreshing(false);
    //   } catch {
    //     toast.show({
    //       description: 'Sem comunicação com API!',
    //     });
    //     return;
    //   }
    // };
    // loadComandas();
    refreshComandas();
  }, [configEdit.ip, dispatch]);

  const listFiltered = useMemo(() => {
    return comandaList.filter(opt =>
      opt.comanda.toLocaleLowerCase().includes(comandaTyped),
    );
  }, [comandaTyped, comandaList]);

  const handlePress = useCallback(
    (comanda: ComandaModel) => {
      if (comanda.status === 'F') {
        return;
      }
      dispatch(createComandaEdit(comanda));
      navigate.navigate('atendimento');
    },
    [dispatch, navigate],
  );

  const handleExit = useCallback(async () => {
    await AsyncStorage.removeItem('@mettre_userlogged');
    navigate.navigate('signin');
  }, [navigate]);

  const abreComanda = useCallback(() => {
    console.log(comandaTyped);
    if (comandaTyped.trim() === '') {
      return;
    }
    const existsComanda = listFiltered.find(
      opt => opt.comanda === comandaTyped,
    );
    if (!existsComanda) {
      // abre nova comanda
      // const api = setUtl(configEdit.ip);

      // api
      //   .put('mesas', {
      //     mesa: comandaTyped,
      //     codAtendente: atendenteEdit.codigo,
      //   })
      //   .then(response => {
      // const newCodigoComanda = response.data[0].oretorno;
      const newCodigoComanda = new Date().getTime();

      if (newCodigoComanda === 0) {
        toast.show({
          description: 'Comanda está fechada!',
        });
        return;
      }
      const newComanda: ComandaModel = {
        codigo: newCodigoComanda.toString(),
        comanda: comandaTyped,
        destino: '',
        subtotal: 0,
        total: 0,
        status: 'A',
        criada: false,
      };
      dispatch(createComandaList(newComanda));
      dispatch(createComandaEdit(newComanda));
      setComandaTyped('');
      navigate.navigate('atendimento');
      // });
    } else {
      handlePress(existsComanda);
    }
  }, [comandaTyped, dispatch, handlePress, listFiltered, navigate]);

  return (
    <>
      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <Text fontSize={10} color="white" fontStyle="italic" mb={1}>
          {`Atendente: ${atendenteEdit.nome}`}
        </Text>
        <Input
          placeholder="Comanda..."
          keyboardType="number-pad"
          value={comandaTyped}
          onChangeText={setComandaTyped}
        />
        <Flex flex={1} w="100%" mb={2}>
          <FlatList
            refreshing={isRefreshing}
            onRefresh={refreshComandas}
            data={listFiltered}
            renderItem={({ item }) => (
              <Pressable onPress={() => handlePress(item)} mb={1}>
                {({ isHovered, isPressed }) => {
                  let comandaColor = 'green.600';
                  if (!item.criada) {
                    comandaColor = 'info.500';
                  } else {
                    if (item.status === 'F') {
                      comandaColor = 'red.600';
                    }
                  }
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
                      p="5"
                      rounded="8"
                      shadow={3}
                      borderWidth="1"
                      borderColor="coolGray.300">
                      <HStack alignItems="center">
                        <Box
                          w="60px"
                          h="60px"
                          colorScheme="darkBlue"
                          variant="solid"
                          rounded="4"
                          backgroundColor={comandaColor}
                          padding="4">
                          <Center>
                            <Heading color="white">{item.comanda}</Heading>
                          </Center>
                        </Box>
                        <Spacer />
                        <VStack>
                          <Text
                            color="coolGray.800"
                            fontWeight="medium"
                            fontSize="xl"
                            textAlign="right">
                            {`Total: ${item.total.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}`}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  );
                }}
              </Pressable>
            )}
          />
        </Flex>
        <HStack w="100%" justifyContent="space-between">
          <Button
            variant="outline"
            w="49%"
            colorScheme="amber"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleExit}>
            Sair
          </Button>
          <Button
            w="49%"
            colorScheme="amber"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={abreComanda}>
            Continuar
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default Comandas;
