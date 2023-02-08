import { ComandaModel } from '../../../models/ComandaModel';
import {
  ComandaEditTypes,
  ComandaEditState,
  ComandaEditActionsTypes,
} from './types';

const INITIAL_STATE: ComandaEditState = {
  data: {} as ComandaModel,
};

export default function ComandaEditReducer(
  state = INITIAL_STATE,
  action: ComandaEditActionsTypes,
): ComandaEditState {
  switch (action.type) {
    case ComandaEditTypes.CREATE_COMANDAEDIT_REQUEST:
      return {
        data: action.payload.comandaEdit,
      };
    case ComandaEditTypes.UPDATE_COMANDAEDIT_REQUEST: {
      const data = action.payload.comandaEdit;
      return { data };
    }
    case ComandaEditTypes.DELETE_COMANDAEDIT_REQUEST: {
      const data = {} as ComandaModel;
      return { data };
    }
    case ComandaEditTypes.CLEAR_COMANDAEDIT_REQUEST: {
      const data = {} as ComandaModel;
      return { data };
    }
    default:
      return state;
  }
}
