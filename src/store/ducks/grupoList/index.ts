import { GrupoListTypes, GrupoListState } from './types';
const INITIAL_STATE: GrupoListState = { data: [] };
export default function grupoListReducer(state = INITIAL_STATE, action: { type: GrupoListTypes; payload?: any }): GrupoListState {
  switch (action.type) {
    case GrupoListTypes.LOAD:
      return { data: action.payload };
    case GrupoListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case GrupoListTypes.DELETE:
      return { data: state.data.filter(g => g.codigo !== action.payload) };
    case GrupoListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
