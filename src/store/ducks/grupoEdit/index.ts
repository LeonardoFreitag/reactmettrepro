import { GrupoEditTypes, GrupoEditState } from './types';
const INITIAL_STATE: GrupoEditState = { data: { codigo: '', nome: '', combinado: '', sabores: 0, selected: false } };
export default function grupoEditReducer(state = INITIAL_STATE, action: { type: GrupoEditTypes; payload?: any }): GrupoEditState {
  switch (action.type) {
    case GrupoEditTypes.CREATE:
    case GrupoEditTypes.UPDATE:
      return { data: action.payload };
    case GrupoEditTypes.DELETE:
    case GrupoEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
