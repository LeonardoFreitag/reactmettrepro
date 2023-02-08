import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  FlatList,
  Flex,
  Heading,
  HStack,
  Pressable,
  Spacer,
  Text,
  VStack,
} from 'native-base';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { Button } from '../../components/Button';
import { GrupoModel } from '../../models/GrupoModel';
import { RootState } from '../../store/ducks/combineReducers';
import { createGrupoEdit } from '../../store/ducks/grupoEdit/actions';

const GruposDeCombinados: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();

  const grupoList = useSelector((state: RootState) => state.grupoList.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);

  const gruposDeFracionados = useMemo(() => {
    return grupoList.filter(item => item.combinado === 'S');
  }, [grupoList]);

  const handleBack = useCallback(() => {
    navigate.navigate('atendimento');
  }, [navigate]);

  const handlePressGroup = useCallback(
    (item: GrupoModel) => {
      dispatch(createGrupoEdit(item));
      navigate.navigate('produtosGrupoCombinado');
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
        <Heading color="white">{`Comanda: ${comandaEdit.comanda}`}</Heading>
        <Heading color="white" size="sm">
          {'Pedido combinado'}
        </Heading>
        <Flex flex={1} w="100%" mb={2} mt={2}>
          <FlatList
            data={gruposDeFracionados}
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
                      borderColor="coolGray.300">
                      <HStack alignItems="center">
                        <Box
                          colorScheme="darkBlue"
                          variant="solid"
                          rounded="4"
                          padding="2">
                          <Heading size="xs">{item.nome}</Heading>
                          <Text
                            fontSize={12}
                            fontStyle="italic">{`Sabores: ${item.sabores}`}</Text>
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

export default GruposDeCombinados;
