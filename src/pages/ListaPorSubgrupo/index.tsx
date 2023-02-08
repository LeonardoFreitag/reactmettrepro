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
  VStack,
} from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GrupoModel } from '../../models/GrupoModel';
import { SubgrupoModel } from '../../models/SubgrupoModel';
import { RootState } from '../../store/ducks/combineReducers';
import {
  createGrupoEdit,
  updateGrupoEdit,
} from '../../store/ducks/grupoEdit/actions';
import { updateGrupoList } from '../../store/ducks/grupoList/actions';
import { createSubgrupoEdit } from '../../store/ducks/subgrupoEdit/actions';

const ListarPorSubgrupo: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigation();
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const grupoList = useSelector((state: RootState) => state.grupoList.data);
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const subgrupoList = useSelector(
    (state: RootState) => state.subgrupoList.data,
  );

  const subgroupFiltered = useMemo(() => {
    const dataSubgroupFiltered: SubgrupoModel[] = [] as SubgrupoModel[];
    const dataProd = produtoList.filter(opt => opt.grupo === grupoEdit.nome);
    const subFromProducts: SubgrupoModel[] = dataProd.map(item => {
      return {
        nome: item.subgrupo,
      };
    });
    subFromProducts.forEach(item => {
      console.log('item', item);
      const dataIncludes = dataSubgroupFiltered.find(
        opt => opt.nome === item.nome,
      );

      if (!dataIncludes) {
        dataSubgroupFiltered.push(item);
      }
    });
    return dataSubgroupFiltered;
  }, [grupoEdit.nome, produtoList]);

  const handleBack = useCallback(() => {
    dispatch(
      updateGrupoList({
        ...grupoEdit,
        selected: false,
      }),
    );
    dispatch(createGrupoEdit({} as GrupoModel));
    navigate.navigate('atendimento');
  }, [dispatch, grupoEdit, navigate]);

  const handlePressGroup = useCallback(
    (item: GrupoModel) => {
      if (item.selected) {
        dispatch(createGrupoEdit({} as GrupoModel));
        dispatch(
          updateGrupoList({
            ...item,
            selected: false,
          }),
        );
      } else {
        dispatch(
          updateGrupoList({
            ...grupoEdit,
            selected: false,
          }),
        );
        dispatch(createGrupoEdit(item));
        dispatch(
          updateGrupoList({
            ...item,
            selected: true,
          }),
        );
      }
    },
    [dispatch, grupoEdit],
  );

  const handlePressSubgroup = useCallback(
    (item: SubgrupoModel) => {
      dispatch(createSubgrupoEdit(item));
      navigate.navigate('produtosPorGrupo');
    },
    [dispatch, navigate],
  );
  return (
    <>
      <VStack
        bg={'gray.800'}
        flex={1}
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <Heading color="white" mb={2}>
          {`Comanda: ${comandaEdit.comanda}`}
        </Heading>
        <Heading color="white" size="sm">
          {'Adicionar produto'}
        </Heading>
        <Flex flex={1} w="100%" mb={2} mt={2}>
          <FlatList
            data={grupoList}
            numColumns={2}
            renderItem={({ item }) => (
              <Pressable
                mr={1}
                maxW="96"
                minW="49%"
                onPress={() => handlePressGroup(item)}
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
                      borderColor="coolGray.300"
                      backgroundColor={
                        item.selected ? 'darkBlue.300' : 'gray.100'
                      }>
                      <HStack alignItems="center">
                        <Center
                          // colorScheme="darkBlue"

                          variant="solid"
                          rounded="4"
                          padding="2">
                          <Heading size="xs">{`${item.nome}`}</Heading>
                        </Center>
                        <Spacer />
                      </HStack>
                    </Box>
                  );
                }}
              </Pressable>
            )}
          />
        </Flex>
        <Flex flex={1} w="100%" mb={2} mt={2}>
          <FlatList
            data={subgroupFiltered}
            numColumns={2}
            renderItem={({ item }) => (
              <Pressable
                mr={1}
                maxW="96"
                minW="49%"
                onPress={() => handlePressSubgroup(item)}
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
                          <Heading size="xs">{item.nome}</Heading>
                        </Box>
                        <Spacer />
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
            w="100%"
            colorScheme="amber"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleBack}>
            Voltar
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default ListarPorSubgrupo;
