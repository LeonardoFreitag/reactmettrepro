import { Input as NaviteBaseInput, IInputProps } from 'native-base';

export const Input: React.FC<IInputProps> = ({ ...rest }: IInputProps) => {
  return (
    <NaviteBaseInput
      bg="gray.900"
      height={54}
      px={4}
      borderWidth={0}
      fontSize="md"
      color="white"
      fontFamily="body"
      mb={4}
      placeholderTextColor="gray.600"
      _focus={{
        bg: 'gray.900',
        borderWidth: 1,
        borderColor: 'warning.400',
      }}
      {...rest}
    />
  );
};
