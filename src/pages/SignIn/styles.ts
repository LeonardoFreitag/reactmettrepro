import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.GRAY_600};
`;

export const Logo = styled.Image`
  margin-bottom: 5px;
  width: 200px;
  height: 200px;
`;
