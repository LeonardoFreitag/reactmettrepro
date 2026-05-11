import { SubgrupoListTypes, SubgrupoListState } from './types';
const INITIAL_STATE: SubgrupoListState = { data: [] };
export default function subgrupoListReducer(state = INITIAL_STATE, action: { type: SubgrupoListTypes; payload?: any }): SubgrupoListState {
  switch (action.type) {
    case SubgrupoListTypes.LOAD:
      return { data: action.payload };
    case SubgrupoListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case SubgrupoListTypes.DELETE:
      return { data: state.data.filter(s => s.nome !== action.payload) };
    case SubgrupoListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
