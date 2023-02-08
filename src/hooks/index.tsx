import React from 'react';

import { ProductSearchProvider } from './product';

interface Props {
  children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }: Props) => (
  <ProductSearchProvider>{children}</ProductSearchProvider>
);

export default AppProvider;
