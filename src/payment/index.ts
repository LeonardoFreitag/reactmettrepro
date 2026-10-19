import { useSelector } from 'react-redux';
import { RootState } from '../store/combineReducers';
import { ConfigModel } from '../models/ConfigModel';
import { PaymentProvider } from './types';
import { useCieloProvider } from './cielo';
import { useStoneProvider } from './stone';

export * from './types';

/**
 * Devolve o `PaymentProvider` configurado neste aparelho (`config.provider`).
 * Instalações antigas (sem o campo) caem em 'CIELO'.
 *
 * Ambos os hooks são sempre chamados (regra dos hooks); só o selecionado é devolvido.
 */
export function usePaymentProviderFor(config: ConfigModel): PaymentProvider {
  const cielo = useCieloProvider(config);
  const stone = useStoneProvider(config);
  return config.provider === 'STONE' ? stone : cielo;
}

export function usePaymentProvider(): PaymentProvider {
  const config = useSelector((state: RootState) => state.configEdit.data);
  return usePaymentProviderFor(config);
}
