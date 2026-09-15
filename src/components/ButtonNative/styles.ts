import styled from 'styled-components/native';
import { COLORS } from '../../theme';

export const Container = styled.TouchableOpacity<{ variant?: string }>`
  height: 54px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: ${({ variant }) =>
    variant === 'outline' ? 'transparent' :
    variant === 'danger'  ? COLORS.DANGER :
    COLORS.GOLD_500};
  border-width: ${({ variant }) => variant === 'outline' ? '1px' : '0'};
  border-color: ${COLORS.GOLD_500};
`;

export const Title = styled.Text`
  color: ${COLORS.WHITE};
  font-size: 16px;
  font-weight: bold;
`;
