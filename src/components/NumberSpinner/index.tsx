import {
  Button as NativeBaseButton,
  Center,
  Heading,
  HStack,
  IButtonProps,
  Text,
  VStack,
} from 'native-base';
import IconFeather from 'react-native-vector-icons/Feather';

type Props = IButtonProps & {
  label: string;
  amount: string;
  handlePressPlus: () => void;
  handlePressMinus: () => void;
};

export const NumberSpinner: React.FC<Props> = ({
  label,
  amount,
  width,
  handlePressMinus,
  handlePressPlus,
  ...rest
}: Props) => {
  return (
    <VStack w={width}>
      {/* <Center bgColor="cyan.600" w="100%" borderTopRadius={5}>
        <Text w="100%" textAlign="center" color="white">
          {label}
        </Text>
      </Center> */}
      <HStack justifyContent="space-between">
        <NativeBaseButton w="20%" h={54} {...rest} onPress={handlePressMinus}>
          <IconFeather name="minus" size={20} color="#fff" />
        </NativeBaseButton>
        <Center
          bgColor="transparent"
          w="65%"
          rounded={5}
          borderWidth={2}
          borderColor="cyan.600">
          <Heading color="white">{amount}</Heading>
        </Center>
        <NativeBaseButton w="20%" h={54} {...rest} onPress={handlePressPlus}>
          <IconFeather name="plus" size={20} color="#fff" />
        </NativeBaseButton>
      </HStack>
    </VStack>
  );
};
