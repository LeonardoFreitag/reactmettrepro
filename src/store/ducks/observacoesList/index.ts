import { ObservacoesListTypes, ObservacoesListState } from './types';
const INITIAL_STATE: ObservacoesListState = { data: [] };
export default function observacoesListReducer(state = INITIAL_STATE, action: { type: ObservacoesListTypes; payload?: any }): ObservacoesListState {
  switch (action.type) {
    case ObservacoesListTypes.LOAD:
      return { data: action.payload };
    case ObservacoesListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case ObservacoesListTypes.DELETE:
      return { data: state.data.filter(o => o.codigo !== action.payload) };
    case ObservacoesListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
