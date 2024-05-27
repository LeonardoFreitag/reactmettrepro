import styled from 'styled-components/native';

interface ButtonProps {
  w: string;
  h: string;
  color: string;
}

interface ButtonTextProps {
  textColor: string;
  fontSize: string;
}

export const Button = styled.TouchableOpacity<ButtonProps>`
  width: ${props => props.w};
  height: ${props => props.h};
  background-color: ${props => props.color};
  border-radius: 5px;
  justify-content: center;
  align-items: center;
`;

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${props => props.textColor};
  font-size: ${props => props.fontSize};
`;
