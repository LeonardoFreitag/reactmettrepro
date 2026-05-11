import { FlavorsSelectedTypes, FlavorsSelectedState } from './types';
const INITIAL_STATE: FlavorsSelectedState = { data: [] };
export default function flavorsSelectedReducer(state = INITIAL_STATE, action: { type: FlavorsSelectedTypes; payload?: any }): FlavorsSelectedState {
  switch (action.type) {
    case FlavorsSelectedTypes.LOAD:
      return { data: action.payload };
    case FlavorsSelectedTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case FlavorsSelectedTypes.DELETE:
      return { data: state.data.filter(f => f.codigo !== action.payload) };
    case FlavorsSelectedTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
