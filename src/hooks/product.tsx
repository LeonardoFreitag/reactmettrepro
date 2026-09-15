import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductSearchContextData {
  productCode: string;
  productCodeTyping: (codigo: string) => void;
  productCodeClear: () => void;
  obsFlavor: string;
  obsFlavorTyping: (obs: string) => void;
  obsFlavorClear: () => void;
}

const ProductSearchContext = createContext<ProductSearchContextData>({} as ProductSearchContextData);

export function ProductSearchProvider({ children }: { children: ReactNode }) {
  const [productCode, setProductCode] = useState('');
  const [obsFlavor, setObsFlavor] = useState('');

  return (
    <ProductSearchContext.Provider
      value={{
        productCode,
        productCodeTyping: setProductCode,
        productCodeClear: () => setProductCode(''),
        obsFlavor,
        obsFlavorTyping: setObsFlavor,
        obsFlavorClear: () => setObsFlavor(''),
      }}
    >
      {children}
    </ProductSearchContext.Provider>
  );
}

export function useProductSearch() {
  return useContext(ProductSearchContext);
}
