import { ConfigEditTypes, ConfigEditState } from './types';
const INITIAL_STATE: ConfigEditState = { data: { ip: '', destino: false, keyboardHasLetters: false } };
export default function configEditReducer(state = INITIAL_STATE, action: { type: ConfigEditTypes; payload?: any }): ConfigEditState {
  switch (action.type) {
    case ConfigEditTypes.CREATE:
    case ConfigEditTypes.UPDATE:
      return { data: action.payload };
    case ConfigEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
