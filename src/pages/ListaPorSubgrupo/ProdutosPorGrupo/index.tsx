/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  FlatList,
  Flex,
  Heading,
  HStack,
  Input,
  Pressable,
  Spacer,
  Text,
  VStack,
  FormControl,
  useToast,
} from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NumberSpinner } from '../../../components/NumberSpinner';
import { ProdutoModel } from '../../../models/ProdutoModel';
import { RootState } from '../../../store/ducks/combineReducers';
import { formatDecimal } from '../../../utils/formatDecimal';
import { updateProdutoList } from '../../../store/ducks/produtoList/actions';
import { createProdutoEdit } from '../../../store/ducks/produtoEdit/actions';
import IconFeather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native';

const ProdutosPorGrupo: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();

  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const produtoEdit = useSelector((state: RootState) => state.produtoEdit.data);

  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const subgrupoEdit = useSelector(
    (state: RootState) => state.subgrupoEdit.data,
  );
  const [amount, setAmount] = useState('1');
  const [descTyped, setDescTyped] = useState('');

  const productFiltered = useMemo(() => {
    const data = descTyped.toLocaleLowerCase();
    return produtoList.filter(
      opt =>
        opt.nome.toLocaleLowerCase().includes(data) &&
        opt.grupo === grupoEdit.nome &&
        opt.subgrupo === subgrupoEdit.nome,
    );
  }, [descTyped, grupoEdit.nome, produtoList, subgrupoEdit.nome]);

  const handleBack = () => {
    navigate.navigate('listaPorSubgrupo');
  };

  const handlePressProduct = (item: ProdutoModel) => {
    if (item.selected) {
      dispatch(createProdutoEdit({} as ProdutoModel));
      dispatch(
        updateProdutoList({
          ...item,
          selected: false,
        }),
      );
    } else {
      dispatch(
        updateProdutoList({
          ...produtoEdit,
          selected: false,
        }),
      );
      dispatch(createProdutoEdit(item));
      dispatch(
        updateProdutoList({
          ...item,
          selected: true,
        }),
      );
    }
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

  const handleContinue = () => {
    const existsSelected = productFiltered.filter(opt => opt.selected);
    if (existsSelected.length > 0) {
      navigate.navigate('observacoesPorGrupo', { amount: amount });
    } else {
      toast.show({
        description: 'Nenhum produto selecionado!',
        duration: 1000,
      });
    }
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
        justifyContent="space-between"
        alignItems="center"
        padding={4}>
        <Heading color="white">{'Comanda: 1'}</Heading>
        <Heading color="white" size="md">
          {'Localizar produto'}
        </Heading>
        <Heading color="white" size="sm">
          {`${grupoEdit.nome} - ${subgrupoEdit.nome}`}
        </Heading>
        <FormControl>
          <FormControl.Label>Descrição:</FormControl.Label>
          <Input value={descTyped} onChangeText={setDescTyped} color="white" />
        </FormControl>
        <Flex flex={1} w="100%" mb={2} mt={2}>
          <FlatList
            mb={2}
            data={productFiltered}
            renderItem={({ item }) => (
              <Pressable
                mr={1}
                maxW="96"
                minW="49%"
                onPress={() => handlePressProduct(item)}
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
                        <Box
                          colorScheme="darkBlue"
                          variant="solid"
                          rounded="4"
                          padding="2">
                          <Heading size="xs">{`${item.nome}`}</Heading>
                        </Box>
                        <Spacer />
                      </HStack>
                    </Box>
                  );
                }}
              </Pressable>
            )}
          />
          <NumberSpinner
            amount={amount}
            label="Quantidade"
            w={16}
            handlePressMinus={handlePressMinus}
            handlePressPlus={handlePressPlus}
          />
        </Flex>
        <HStack w="100%" justifyContent="space-between">
          <Button
            variant="outline"
            w="32%"
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
          <Button w="32%" colorScheme="green" h={54} onPress={handleBack}>
            <Center>
              <IconFeather name="thumbs-up" size={20} color="#fff" />
              <Text color="white" fontSize="12px">
                Conferir e enviar
              </Text>
            </Center>
          </Button>
          <Button
            w="32%"
            colorScheme="darkBlue"
            h={54}
            fontFamily="heading"
            fontSize="md"
            onPress={handleContinue}>
            <Center>
              <IconFeather name="arrow-right" size={18} color="#ffffff" />
              <Text color="white" fontSize="14px" fontWeight="bold">
                Continuar
              </Text>
            </Center>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
};

export default ProdutosPorGrupo;
