import styled from 'styled-components/native';

export interface ButtonProps {
  isSelected: boolean;
}

export const Container = styled.View`
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const Button = styled.TouchableOpacity<ButtonProps>`
  flex: 0.49;
  /* background-color: #7c7c8a; */
  background-color: ${props => (props.isSelected ? '#00875F' : '#5f5f6b')};
  padding: 10px;
  border-radius: 5px;
  align-items: center;
`;

export const ButtonText = styled.Text<ButtonProps>`
  font-size: 16px;
  color: #fff;
`;
