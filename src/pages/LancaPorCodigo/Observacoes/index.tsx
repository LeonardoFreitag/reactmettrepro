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
  Pressable,
  Spacer,
  Text,
  VStack,
} from 'native-base';
import { useCallback, useState } from 'react';
// import { Button } from '../../components/Button';
import { Input } from '../../../components/Input';
import { ObservacoesModel } from '../../../models/ObservacoesModel';
import IconFeather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native';

const Observacoes: React.FC = () => {
  const navigate = useNavigation();

  const [obsList, setObsList] = useState<ObservacoesModel[]>([
    {
      codigo: '1',
      observacao: 'Obs 1',
      grupo: 'grupo geral',
    },
    {
      codigo: '2',
      observacao: 'Obs 2',
      grupo: 'grupo geral',
    },
    {
      codigo: '3',
      observacao: 'Obs 3',
      grupo: 'grupo geral',
    },
    {
      codigo: '4',
      observacao: 'Obs 4',
      grupo: 'grupo geral',
    },
    {
      codigo: '5',
      observacao: 'Obs 5',
      grupo: 'grupo geral',
    },
    {
      codigo: '1',
      observacao: 'Obs 1',
      grupo: 'grupo geral',
    },
    {
      codigo: '2',
      observacao: 'Obs 2',
      grupo: 'grupo geral',
    },
    {
      codigo: '3',
      observacao: 'Obs 3',
      grupo: 'grupo geral',
    },
    {
      codigo: '4',
      observacao: 'Obs 4',
      grupo: 'grupo geral',
    },
    {
      codigo: '5',
      observacao: 'Obs 5',
      grupo: 'grupo geral',
    },
  ]);

  const handleBack = () => {
    navigate.navigate('lancaPorCodigo');
  };

  const handleContinue = () => {
    navigate.navigate('atendimento');
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
        <Heading color="white" mb={5}>
          {'Comanda: 1'}
        </Heading>
        <Heading color="white" size="md">
          {'Descrição do produto'}
        </Heading>

        <VStack flex={1} w="100%" mb={2} mt={2}>
          <HStack w="100%" justifyContent="space-between" alignItems="center">
            <VStack w="85%">
              <Text color="white">Observacoes:</Text>
              <Input />
            </VStack>
            <Button h={54}>
              <IconFeather name="trash" size={20} color="#fff" />
            </Button>
          </HStack>
          <FlatList
            data={obsList}
            numColumns={2}
            renderItem={({ item }) => (
              <Pressable mr={1} maxW="96" minW="49%" mb={1} key="item.id">
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
                          <Heading size="xs">{item.observacao}</Heading>
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
              <Text color="white">Confirmar</Text>
            </Center>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
};

export default Observacoes;
