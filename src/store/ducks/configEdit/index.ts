import { ConfigModel } from '../../../models/ConfigModel';
import {
  ConfigEditTypes,
  ConfigEditState,
  ConfigEditActionsTypes,
} from './types';

const INITIAL_STATE: ConfigEditState = {
  data: {} as ConfigModel,
};

export default function ConfigEditReducer(
  state = INITIAL_STATE,
  action: ConfigEditActionsTypes,
): ConfigEditState {
  switch (action.type) {
    case ConfigEditTypes.CREATE_CONFIGEDIT_REQUEST:
      return {
        data: action.payload.configEdit,
      };
    case ConfigEditTypes.UPDATE_CONFIGEDIT_REQUEST: {
      const data = action.payload.configEdit;
      return { data };
    }
    case ConfigEditTypes.DELETE_CONFIGEDIT_REQUEST: {
      const data = {} as ConfigModel;
      return { data };
    }
    case ConfigEditTypes.CLEAR_CONFIGEDIT_REQUEST: {
      const data = {} as ConfigModel;
      return { data };
    }
    default:
      return state;
  }
}
