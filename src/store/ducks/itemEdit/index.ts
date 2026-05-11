import { ItemEditTypes, ItemEditState } from './types';
const INITIAL_STATE: ItemEditState = {
  data: { mobileId: '', codigo: '', comandaCodigo: '', funcionarioCodigo: '', produtoCodigo: '', descricao: '', unidade: '', quantidade: 0, unitario: 0, total: 0, hora: 0, grupo: '', subgrupo: '', impresso: '', obs: '', enviado: '', combinado: false, codCombinado: '', flavors: [], repeat: false },
};
export default function itemEditReducer(state = INITIAL_STATE, action: { type: ItemEditTypes; payload?: any }): ItemEditState {
  switch (action.type) {
    case ItemEditTypes.CREATE:
    case ItemEditTypes.UPDATE:
      return { data: action.payload };
    case ItemEditTypes.DELETE:
    case ItemEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
