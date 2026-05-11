import styled from 'styled-components/native';
import { COLORS } from '../../theme';

export const ListContainer = styled.View`
  margin-vertical: 8px;
`;

export const ItemContainer = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 8px;
  background-color: ${({ isSelected }) => isSelected ? COLORS.GOLD_500 : COLORS.SURFACE_700};
  border-width: 1px;
  border-color: ${({ isSelected }) => isSelected ? COLORS.GOLD_500 : COLORS.SURFACE_600};
`;

export const ItemText = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }) => isSelected ? COLORS.BACKGROUND : COLORS.GRAY_200};
  font-size: 14px;
  font-weight: ${({ isSelected }) => isSelected ? 'bold' : 'normal'};
`;
