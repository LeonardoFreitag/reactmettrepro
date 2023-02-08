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
  Button as NativeButton,
  ScrollView,
  FormControl,
} from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NumberSpinner } from '../../../components/NumberSpinner';
import { ProdutoModel } from '../../../models/ProdutoModel';
import { RootState } from '../../../store/ducks/combineReducers';
import { formatDecimal } from '../../../utils/formatDecimal';
import IconFeather from 'react-native-vector-icons/Feather';
import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { updateProdutoList } from '../../../store/ducks/produtoList/actions';
import { createProdutoEdit } from '../../../store/ducks/produtoEdit/actions';

interface ProductSelectable extends ProdutoModel {
  selected: boolean;
}

const ProdutosPorGrupo: React.FC = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();

  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const produtoEdit = useSelector((state: RootState) => state.produtoEdit.data);

  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const subgrupoEdit = useSelector(
    (state: RootState) => state.subgrupoEdit.data,
  );
  const [amount, setAmount] = useState('1');
  const [selectedObs, setSelectedObs] = useState('');
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

  const handleBack = useCallback(() => {
    navigate.navigate('listaPorSubgrupo');
  }, [navigate]);

  const handlePressProduct = useCallback(
    (item: ProdutoModel) => {
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
    },
    [dispatch, produtoEdit],
  );

  const handlePressMinus = useCallback(() => {
    setAmount(() => {
      let newAmount = Number(amount.replace(',', '.')) - 1;
      if (newAmount <= 0) {
        newAmount = 0.5;
        return formatDecimal(newAmount);
      }
      return formatDecimal(newAmount);
    });
  }, [amount]);

  const handlePressPlus = useCallback(() => {
    setAmount(() => {
      let newAmount = Number(amount.replace(',', '.')) + 1;
      if (newAmount === 1.5) {
        newAmount = 1;
        return formatDecimal(newAmount);
      }
      return formatDecimal(newAmount);
    });
  }, [amount]);

  const handleContinue = useCallback(() => {
    const existsSelected = productFiltered.filter(opt => opt.selected);
    if (existsSelected) {
      navigate.navigate('observacoesPorGrupo', { amount: amount });
    }
  }, [amount, navigate, productFiltered]);

  return (
    <>
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
              <Text color="white">Continuar</Text>
            </Center>
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default ProdutosPorGrupo;
