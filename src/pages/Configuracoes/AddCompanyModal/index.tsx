import { FormControl, Input, Modal, Button, Text } from 'native-base';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { CompanyModel } from '../../../models/CompanyModel';
import { createCompanyList } from '../../../store/ducks/companyList/actions';
import { companyCreate } from '../../../storage/company/companyCreate';
import uuid from 'react-native-uuid';

interface AddCompanyModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
}

const FormDataSchema = yup.object().shape({
  nome: yup.string().required('Campo obrigatório'),
  ip: yup.string().required('Campo obrigatório'),
  porta: yup.string().required('Campo obrigatório'),
});

export function AddCompanyModal({
  showModal,
  handleCloseModal,
}: AddCompanyModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(FormDataSchema),
    defaultValues: {
      nome: '',
      ip: '',
      porta: '',
    },
  });
  const dispatch = useDispatch();

  const onSubmit = (data: any) => {
    console.log(data);
    const newCompany: CompanyModel = {
      id: uuid.v4().toString(),
      nome: data.nome,
      ip: data.ip,
      porta: data.porta,
      isSelected: false,
    };
    dispatch(createCompanyList(newCompany));
    companyCreate(newCompany);
    reset();
    handleCloseModal();
  };

  const handleCancel = () => {
    reset();
    handleCloseModal();
  };

  return (
    <Modal isOpen={showModal} onClose={() => handleCloseModal}>
      <Modal.Content maxWidth="400px">
        <Modal.Header>Adicionar conexão</Modal.Header>
        <Modal.Body>
          <FormControl isRequired>
            <FormControl.Label>Nome</FormControl.Label>
            <Controller
              name="nome"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="ex.: Empresa A"
                  autoFocus
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.nome && (
              <Text fontSize="xs" color="red.400">
                {errors.nome.message}
              </Text>
            )}
          </FormControl>
          <FormControl mt="3" isRequired>
            <FormControl.Label>IP</FormControl.Label>
            <Controller
              name="ip"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="ex.: 192.168.0.100"
                  keyboardType="number-pad"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.ip && (
              <Text fontSize="xs" color="red.400">
                {errors.ip.message}
              </Text>
            )}
          </FormControl>
          <FormControl mt="3" isRequired>
            <FormControl.Label>Porta</FormControl.Label>
            <Controller
              name="porta"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="ex.: 3000"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.porta && (
              <Text fontSize="xs" color="red.400">
                {errors.porta.message}
              </Text>
            )}
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={handleCancel}>
              Cancelar
            </Button>
            <Button onPress={handleSubmit(onSubmit)}>Salvar</Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
