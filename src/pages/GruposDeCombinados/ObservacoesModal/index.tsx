import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Modal,
  Input,
  Flex,
  Pressable,
  Box,
  HStack,
  Heading,
  ScrollView,
} from 'native-base';
import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/ducks/combineReducers';
import IconFeather from 'react-native-vector-icons/Feather';
import { useProductSearch } from '../../../hooks/product';

interface ObservacoesModalProps {
  isOpen: boolean;
  handleCancel: () => void;
  handleSave: (obs: string) => void;
}

export const ObservacoesModal: React.FC<ObservacoesModalProps> = ({
  isOpen,
  handleCancel,
  handleSave,
}: ObservacoesModalProps) => {
  const { obsFlavor, obsFlavorClear, obsFlavorTyping } = useProductSearch();
  const observacoesList = useSelector(
    (state: RootState) => state.observacoesList.data,
  );
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);

  const obsByGroup = useMemo(() => {
    const data = observacoesList.filter(opt => opt.grupo === grupoEdit.nome);
    return data;
  }, [grupoEdit.nome, observacoesList]);

  const handlePressGroup = useCallback(
    (obsSelected: ObservacoesModel) => {
      let newObsLine = '';
      if (obsFlavor.trim() === '') {
        newObsLine = `${obsSelected.observacao}; `;
      } else {
        newObsLine = `${obsFlavor}${obsSelected.observacao}; `;
      }
      obsFlavorTyping(newObsLine);
    },
    [obsFlavor, obsFlavorTyping],
  );

  const handleContinue = useCallback(() => {
    handleSave(obsFlavor);
    obsFlavorClear();
  }, [handleSave, obsFlavor, obsFlavorClear]);

  return (
    <>
      <Modal isOpen={isOpen} justifyContent="flex-start" size="xl" mt={16}>
        <Modal.Content>
          {/* <Modal.CloseButton /> */}
          <Modal.Header>Observações</Modal.Header>
          <Modal.Body>
            <HStack w="100%" justifyContent="space-between">
              <Input w="85%" value={obsFlavor} />
              <Button h={54} onPress={obsFlavorClear}>
                <IconFeather name="trash" size={20} color="#fff" />
              </Button>
            </HStack>
            <ScrollView w="100%" h="500px">
              <Flex flex={1} w="100%" mb={2} mt={2}>
                {obsByGroup.map((item, index) => {
                  const cod = index.toString();
                  return (
                    <Pressable
                      mr={1}
                      maxW="96"
                      minW="49%"
                      onPress={() => handlePressGroup(item)}
                      mb={1}
                      key={cod}>
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
                            </HStack>
                          </Box>
                        );
                      }}
                    </Pressable>
                  );
                })}
              </Flex>
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="outline"
                colorScheme="red"
                onPress={handleCancel}
                w="49%">
                Cancelar
              </Button>
              <Button onPress={handleContinue} w="49%" colorScheme="green">
                Continuar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};
