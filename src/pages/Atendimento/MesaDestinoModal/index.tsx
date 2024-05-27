import React, { useCallback, useState } from 'react';
import { Button, Modal, Text, Center, Input } from 'native-base';
import IconFeather from 'react-native-vector-icons/Feather';
import { setUtl } from '../../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/ducks/combineReducers';

interface MesaDestinoModalProps {
  isOpen: boolean;
  handleConfirm: (destino: string) => void;
  handleCancel: () => void;
}

export const MesaDestinoModal: React.FC<MesaDestinoModalProps> = ({
  isOpen,
  handleCancel,
  handleConfirm,
}: MesaDestinoModalProps) => {
  const [destino, setDestino] = useState('');

  return (
    <>
      <Modal isOpen={isOpen} justifyContent="flex-start" size="xl" mt={56}>
        <Modal.Content>
          {/* <Modal.CloseButton /> */}
          <Modal.Header>Mesa destino</Modal.Header>
          <Modal.Body>
            <Input
              keyboardType="number-pad"
              onChangeText={setDestino}
              autoFocus
            />
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2} w="100%">
              <Button
                variant="outline"
                colorScheme="red"
                onPress={handleCancel}
                w="49%">
                <Center>
                  <IconFeather name="x-circle" size={20} color="#dc2626" />
                  <Text color="red.600" fontSize={14}>
                    Cancelar
                  </Text>
                </Center>
              </Button>

              <Button
                onPress={() => handleConfirm(destino)}
                w="49%"
                colorScheme="green">
                <Center>
                  <IconFeather name="printer" size={20} color="white" />
                  <Text color="white" fontSize={14}>
                    Confirmar
                  </Text>
                </Center>
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};
