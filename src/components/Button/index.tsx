import { Button as NativeBaseButton, IButtonProps, Text } from 'native-base';

type Props = IButtonProps & {
  title: string;
};

export const Button: React.FC<Props> = ({
  title,
  variant,
  width,
  ...rest
}: Props) => {
  return (
    <NativeBaseButton
      w={width ?? 'full'}
      h={54}
      bg={variant === 'outline' ? 'transparent' : 'amber.600'}
      borderWidth={variant === 'outline' ? 1 : 0}
      borderColor="amber.600"
      rounded="sm"
      _pressed={{
        bg: variant === 'outline' ? 'gray.700' : 'amber.900',
      }}
      {...rest}>
      <Text
        color={variant === 'outline' ? 'amber.600' : 'white'}
        fontFamily="heading"
        fontSize="md">
        {title}
      </Text>
    </NativeBaseButton>
  );
};
