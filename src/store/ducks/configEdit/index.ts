import { ConfigEditTypes, ConfigEditState } from './types';
import { CONFIG_DEFAULTS, normalizeConfig } from '../../../models/ConfigModel';

const INITIAL_STATE: ConfigEditState = {
  data: { ...CONFIG_DEFAULTS },
};

export default function configEditReducer(
  state = INITIAL_STATE,
  action: { type: ConfigEditTypes; payload?: any },
): ConfigEditState {
  switch (action.type) {
    case ConfigEditTypes.CREATE:
    case ConfigEditTypes.UPDATE:
      return { data: normalizeConfig(action.payload) };
    case ConfigEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
