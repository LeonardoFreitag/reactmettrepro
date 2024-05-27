import React, { useCallback, useState } from 'react';
import {
  Button,
  Modal,
  Flex,
  HStack,
  ScrollView,
  VStack,
  Text,
  Center,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/ducks/combineReducers';
import IconFeather from 'react-native-vector-icons/Feather';
import { formatCurrency } from '../../../../utils/formatCurrency';
import { FlavorModel } from '../../../../models/FlavorModel';
import { deleteFlavorsSelected } from '../../../../store/ducks/flavorsSelected/actions';
import { ObservacoesModal } from '../ObservacoesModal';
import { useProductSearch } from '../../../../hooks/product';

interface CombinedModalProps {
  isOpen: boolean;
  handleCancel: () => void;
}

export const CombinedModal: React.FC<CombinedModalProps> = ({
  isOpen,
  handleCancel,
}: CombinedModalProps) => {
  const dispatch = useDispatch();
  const flavorsSelected = useSelector(
    (state: RootState) => state.flavorsSelected.data,
  );
  const { obsFlavor } = useProductSearch();

  const [showObservacoesModal, setShowObservacoesModal] =
    useState<boolean>(false);

  const handleRemoveFlavor = (flavorItem: FlavorModel) => {
    dispatch(deleteFlavorsSelected(flavorItem));
  };

  const handleCancelEditObs = () => {
    setShowObservacoesModal(false);
  };

  const handleConfirmEditObs = () => {
    setShowObservacoesModal(false);
  };

  const handleShowObsModal = () => {
    setShowObservacoesModal(true);
  };

  return (
    <>
      {showObservacoesModal && (
        <ObservacoesModal
          isOpen={showObservacoesModal}
          handleCancel={handleCancelEditObs}
          handleSave={handleConfirmEditObs}
        />
      )}
      <Modal isOpen={isOpen} justifyContent="flex-start" size="xl" mt={40}>
        <Modal.Content>
          <Modal.Header>Sabores selecionados</Modal.Header>
          <Modal.Body>
            <ScrollView w="100%" h="250px">
              <Flex flex={1} w="100%" mb={2} mt={2}>
                {flavorsSelected.map((item, index) => {
                  const cod = index.toString();
                  return (
                    <HStack
                      rounded="5"
                      shadow={3}
                      borderColor="gray.100"
                      mb={1}
                      w="100%"
                      justifyContent="space-between"
                      key={cod}>
                      <VStack
                        p={1}
                        backgroundColor="gray.100"
                        borderRadius={5}
                        w="84%">
                        <HStack
                          w="100%"
                          justifyContent="space-between"
                          alignItems="center"
                          h="40px"
                          px={4}>
                          <Text w="70%">{`${item.codigo}-${item.nome}`}</Text>
                          <Text w="30%" textAlign="right">{`${formatCurrency(
                            item.preco,
                          )}`}</Text>
                        </HStack>
                      </VStack>

                      <Button
                        w="15%"
                        onPress={() => {
                          handleRemoveFlavor(item);
                        }}>
                        <Center>
                          <IconFeather
                            name="minus-square"
                            size={20}
                            color="red"
                          />
                        </Center>
                      </Button>
                    </HStack>
                  );
                })}
              </Flex>
            </ScrollView>
            <Flex w="100%">
              <Text fontSize={12}>{`Obs.: ${obsFlavor}`}</Text>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <HStack w="100%" justifyContent="space-between">
              <Button
                variant="outline"
                w="49%"
                colorScheme="amber"
                h={54}
                onPress={handleCancel}>
                <Center>
                  <IconFeather name="x-square" size={20} color="#d97706" />
                  <Text color="amber.600" fontSize="14px" fontWeight="bold">
                    Fechar
                  </Text>
                </Center>
              </Button>
              <Button
                w="49%"
                colorScheme="darkBlue"
                h={54}
                fontFamily="heading"
                fontSize="md"
                onPress={handleShowObsModal}>
                <Center>
                  <IconFeather name="edit" size={18} color="#ffffff" />
                  <Text color="white" fontSize="14px" fontWeight="bold">
                    Observações
                  </Text>
                </Center>
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};
