import { FlavorListTypes, FlavorListState } from './types';
const INITIAL_STATE: FlavorListState = { data: [] };
export default function flavorListReducer(state = INITIAL_STATE, action: { type: FlavorListTypes; payload?: any }): FlavorListState {
  switch (action.type) {
    case FlavorListTypes.LOAD:
      return { data: action.payload };
    case FlavorListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case FlavorListTypes.DELETE:
      return { data: state.data.filter(f => f.codigo !== action.payload) };
    case FlavorListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
