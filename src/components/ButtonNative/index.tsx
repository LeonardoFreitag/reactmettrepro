import { Button, ButtonText } from './styles';
import IconFeather from 'react-native-vector-icons/Feather';

type Props = {
  w: string;
  h: string;
  color: string;
  hasIcon: boolean;
  nameIcon: string;
  textColor: string;
  fontSize: string;
  text?: string;
  onPress: () => void;
};

export const ButtonNative: React.FC<Props> = ({
  w,
  h,
  color,
  hasIcon,
  nameIcon,
  textColor,
  fontSize,
  text,
  onPress,
}: Props) => {
  return (
    <Button w={w} h={h} color={color} onPress={onPress}>
      <ButtonText textColor={textColor} fontSize={fontSize}>
        {text ?? ''}
        {hasIcon && (
          <IconFeather
            name={hasIcon ? nameIcon : 'check'}
            size={20}
            color={textColor}
          />
        )}
      </ButtonText>
    </Button>
  );
};
