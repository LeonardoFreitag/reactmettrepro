/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import {
  Button,
  FlatList,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Flex,
  FormControl,
} from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/ducks/combineReducers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDecimal } from '../../../utils/formatDecimal';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { ProdutoModel } from '../../../models/ProdutoModel';
import { useProductSearch } from '../../../hooks/product';
import { SafeAreaView } from 'react-native';

export const SearchProduct: React.FC = () => {
  const navigate = useNavigation();
  const { productCodeTyping } = useProductSearch();

  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const [descTyped, setDescTyped] = useState('');

  const productFiltered = useMemo(() => {
    const data = descTyped.toLocaleLowerCase();
    return produtoList.filter(opt =>
      opt.nome.toLocaleLowerCase().includes(data),
    );
  }, [descTyped, produtoList]);

  const handleCancel = useCallback(() => {
    navigate.navigate('lancaPorCodigo');
  }, [navigate]);

  const handleSelectData = useCallback(
    (item: ProdutoModel) => {
      productCodeTyping(item.codigo);
      navigate.navigate('lancaPorCodigo');
    },
    [navigate, productCodeTyping],
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#121214',
      }}>
      <VStack bg={'gray.800'} flex={2} alignItems="center" padding={4}>
        <Heading color="white" mb={2}>
          {`Comanda: ${comandaEdit.comanda}`}
        </Heading>
        <Heading color="white" size="sm">
          {'Adicionar produto'}
        </Heading>
        <Heading color="white" size="sm">
          {'Pesquisa por descrição'}
        </Heading>

        <VStack flex={1} w="100%" mb={2} mt={2}>
          <FormControl>
            <FormControl.Label>Descrição:</FormControl.Label>
            <Input
              value={descTyped}
              onChangeText={setDescTyped}
              color="white"
            />
          </FormControl>
          <Flex flex={1} w="100%" mb={2} mt={2}>
            <FlatList
              data={productFiltered}
              renderItem={({ item }) => {
                return (
                  <HStack
                    w="100%"
                    justifyContent="space-between"
                    backgroundColor="gray.300"
                    rounded={5}
                    padding={2}
                    mb={1}>
                    <VStack w="80%">
                      <Text fontWeight="bold">{`${item.codigo} - ${item.nome}`}</Text>
                      <Text
                        color="green.600"
                        fontWeight="bold"
                        textAlign="right"
                        w="100%">{`${formatCurrency(item.preco)}`}</Text>
                    </VStack>
                    <Button onPress={() => handleSelectData(item)}>
                      <IconMaterial name="done" size={30} color="#fff" />
                    </Button>
                  </HStack>
                );
              }}
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
              onPress={handleCancel}>
              Voltar
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default SearchProduct;
