import { ComandaListTypes, ComandaListState } from './types';
const INITIAL_STATE: ComandaListState = { data: [] };
export default function comandaListReducer(state = INITIAL_STATE, action: { type: ComandaListTypes; payload?: any }): ComandaListState {
  switch (action.type) {
    case ComandaListTypes.LOAD:
      return { data: action.payload };
    case ComandaListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case ComandaListTypes.DELETE:
      return { data: state.data.filter(c => c.codigo !== action.payload) };
    case ComandaListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
