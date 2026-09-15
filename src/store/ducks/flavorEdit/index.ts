import { FlavorEditTypes, FlavorEditState } from './types';
const INITIAL_STATE: FlavorEditState = {
  data: { mobileId: '', codigo: '', comandaCodigo: '', funcionarioCodigo: '', produtoCodigo: '', descricao: '', unidade: '', quantidade: 0, unitario: 0, total: 0, hora: 0, grupo: '', subgrupo: '', impresso: '', obs: '', enviado: '', combinado: false, codCombinado: '', flavors: [], repeat: false },
};
export default function flavorEditReducer(state = INITIAL_STATE, action: { type: FlavorEditTypes; payload?: any }): FlavorEditState {
  switch (action.type) {
    case FlavorEditTypes.CREATE:
    case FlavorEditTypes.UPDATE:
      return { data: action.payload };
    case FlavorEditTypes.DELETE:
    case FlavorEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
