import { AtendenteEditTypes, AtendenteEditState } from './types';
const INITIAL_STATE: AtendenteEditState = { data: { codigo: '', nome: '', senha: '' } };
export default function atendenteEditReducer(state = INITIAL_STATE, action: { type: AtendenteEditTypes; payload?: any }): AtendenteEditState {
  switch (action.type) {
    case AtendenteEditTypes.CREATE:
    case AtendenteEditTypes.UPDATE:
      return { data: action.payload };
    case AtendenteEditTypes.DELETE:
    case AtendenteEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
