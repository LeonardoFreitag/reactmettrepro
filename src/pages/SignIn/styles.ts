import styled from 'styled-components/native';
import { COLORS } from '../../theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.BACKGROUND};
  padding: 0px 24px 32px;
`;

export const LogoContainer = styled.View`
  align-items: center;
  margin-bottom: 32px;
`;

export const AppName = styled.Text`
  color: ${COLORS.GOLD_500};
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 2px;
`;

export const AppSubtitle = styled.Text`
  color: ${COLORS.GRAY_200};
  font-size: 14px;
  margin-top: 4px;
`;

export const FormGroup = styled.View`
  margin-bottom: 16px;
`;

export const Label = styled.Text`
  color: ${COLORS.GRAY_200};
  font-size: 14px;
  margin-bottom: 6px;
`;

export const SettingsButton = styled.TouchableOpacity`
  align-self: flex-end;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
`;

export const SettingsText = styled.Text`
  color: ${COLORS.CYAN_500};
  font-size: 14px;
  margin-left: 4px;
`;
