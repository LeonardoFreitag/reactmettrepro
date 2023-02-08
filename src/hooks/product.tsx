import React, { createContext, useCallback, useState, useContext } from 'react';

interface ProductSearchContextState {
  productCode: string;
  productCodeTyping(codigo: string): void;
  productCodeClear(): void;
  obsFlavor: string;
  obsFlavorTyping(obs: string): void;
  obsFlavorClear(): void;
}

interface Props {
  children: React.ReactNode;
}

const ProductSearchContext = createContext<ProductSearchContextState>(
  {} as ProductSearchContextState,
);

const ProductSearchProvider: React.FC<Props> = ({ children }: Props) => {
  const [productCodeTyped, setProductCodeTyped] = useState<string>('');
  const [obsTyped, setObsTyped] = useState<string>('');

  const productCodeTyping = useCallback((codigo: string) => {
    setProductCodeTyped(codigo);
  }, []);

  const productCodeClear = useCallback(() => {
    setProductCodeTyped('');
  }, []);

  const obsFlavorTyping = useCallback((obs: string) => {
    setObsTyped(obs);
  }, []);

  const obsFlavorClear = useCallback(() => {
    setObsTyped('');
  }, []);

  return (
    <ProductSearchContext.Provider
      value={{
        productCode: productCodeTyped,
        productCodeTyping,
        productCodeClear,
        obsFlavor: obsTyped,
        obsFlavorTyping,
        obsFlavorClear,
      }}>
      {children}
    </ProductSearchContext.Provider>
  );
};

function useProductSearch(): ProductSearchContextState {
  const context = useContext(ProductSearchContext);

  if (!context) {
    throw new Error(
      'useProductSearch must be used within an ProductSearchProvider',
    );
  }

  return context;
}

export { ProductSearchProvider, useProductSearch };
