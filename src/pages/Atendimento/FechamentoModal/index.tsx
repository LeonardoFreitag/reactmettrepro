import React, { useCallback } from 'react';
import { Button, Modal, Text, Center } from 'native-base';
import IconFeather from 'react-native-vector-icons/Feather';
import { setUtl } from '../../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/ducks/combineReducers';

interface FechamentoModalProps {
  isOpen: boolean;
  handleCancel: (closeBill: boolean) => void;
}

export const FechamentoModal: React.FC<FechamentoModalProps> = ({
  isOpen,
  handleCancel,
}: FechamentoModalProps) => {
  const configEdit = useSelector((state: RootState) => state.configEdit.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);

  const handlePrintPartial = useCallback(() => {
    const api = setUtl(configEdit.ip);
    const comanda = {
      codigo: comandaEdit.codigo,
      destino: 'C',
    };
    api.post('/mesas/fechaConta', comanda).then(() => {
      handleCancel(false);
    });
  }, [comandaEdit.codigo, configEdit.ip, handleCancel]);

  const handleCloseAccount = useCallback(() => {
    const api = setUtl(configEdit.ip);
    const comanda = {
      codigo: comandaEdit.codigo,
      destino: 'F',
    };
    api.post('/mesas/fechaConta', comanda).then(() => {
      handleCancel(true);
    });
  }, [comandaEdit.codigo, configEdit.ip, handleCancel]);

  return (
    <>
      <Modal isOpen={isOpen} justifyContent="flex-start" size="xl" mt={56}>
        <Modal.Content>
          {/* <Modal.CloseButton /> */}
          <Modal.Header>Fechamento de conta</Modal.Header>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="outline"
                colorScheme="red"
                onPress={() => handleCancel(false)}
                w="32%">
                <Center>
                  <IconFeather name="x-circle" size={20} color="#dc2626" />
                  <Text color="red.600" fontSize={14}>
                    Cancelar
                  </Text>
                </Center>
              </Button>
              <Button
                onPress={handleCloseAccount}
                w="32%"
                colorScheme="darkBlue">
                <Center>
                  <IconFeather name="printer" size={20} color="white" />
                  <Text color="white" fontSize={14}>
                    Fechar conta
                  </Text>
                </Center>
              </Button>
              <Button onPress={handlePrintPartial} w="32%" colorScheme="green">
                <Center>
                  <IconFeather name="printer" size={20} color="white" />
                  <Text color="white" fontSize={14}>
                    Parcial
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
