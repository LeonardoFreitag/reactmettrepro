import { ObservacoesEditTypes, ObservacoesEditState } from './types';
const INITIAL_STATE: ObservacoesEditState = { data: { codigo: '', observacao: '', grupo: '' } };
export default function observacoesEditReducer(state = INITIAL_STATE, action: { type: ObservacoesEditTypes; payload?: any }): ObservacoesEditState {
  switch (action.type) {
    case ObservacoesEditTypes.CREATE:
    case ObservacoesEditTypes.UPDATE:
      return { data: action.payload };
    case ObservacoesEditTypes.DELETE:
    case ObservacoesEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
