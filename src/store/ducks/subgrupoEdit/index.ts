import { SubgrupoEditTypes, SubgrupoEditState } from './types';
const INITIAL_STATE: SubgrupoEditState = { data: { nome: '' } };
export default function subgrupoEditReducer(state = INITIAL_STATE, action: { type: SubgrupoEditTypes; payload?: any }): SubgrupoEditState {
  switch (action.type) {
    case SubgrupoEditTypes.CREATE:
    case SubgrupoEditTypes.UPDATE:
      return { data: action.payload };
    case SubgrupoEditTypes.DELETE:
    case SubgrupoEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
