import React, { ReactNode } from 'react';
import { ProductSearchProvider } from './product';

export function AppProvider({ children }: { children: ReactNode }) {
  return <ProductSearchProvider>{children}</ProductSearchProvider>;
}
