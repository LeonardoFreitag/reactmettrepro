import { ComandaEditTypes, ComandaEditState } from './types';
const INITIAL_STATE: ComandaEditState = { data: { codigo: '', comanda: '', destino: '', subtotal: 0, total: 0, status: '', criada: false } };
export default function comandaEditReducer(state = INITIAL_STATE, action: { type: ComandaEditTypes; payload?: any }): ComandaEditState {
  switch (action.type) {
    case ComandaEditTypes.CREATE:
    case ComandaEditTypes.UPDATE:
      return { data: action.payload };
    case ComandaEditTypes.DELETE:
    case ComandaEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
