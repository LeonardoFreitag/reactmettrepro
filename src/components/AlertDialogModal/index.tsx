import { AlertDialog, Button, Center } from 'native-base';
import { useRef } from 'react';

interface AlertDialogModalProps {
  title: string;
  bodyText: string;
  confirmText: string;
  cancelText: string;
  isOpen: boolean;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const AlertDialogModal: React.FC<AlertDialogModalProps> = ({
  title,
  bodyText,
  confirmText,
  cancelText,
  isOpen,
  handleCancel,
  handleConfirm,
}: AlertDialogModalProps) => {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>{title}</AlertDialog.Header>
          <AlertDialog.Body>{bodyText}</AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={handleCancel}
                ref={cancelRef}>
                {cancelText}
              </Button>
              <Button colorScheme="danger" onPress={handleConfirm}>
                {confirmText}
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
};
