import { AtendenteModel } from '../../../models/AtendenteModel';
import {
  AtendenteEditTypes,
  AtendenteEditState,
  AtendenteEditActionsTypes,
} from './types';

const INITIAL_STATE: AtendenteEditState = {
  data: {} as AtendenteModel,
};

export default function AtendenteEditReducer(
  state = INITIAL_STATE,
  action: AtendenteEditActionsTypes,
): AtendenteEditState {
  switch (action.type) {
    case AtendenteEditTypes.CREATE_ATENDENTEEDIT_REQUEST:
      return {
        data: action.payload.atendenteEdit,
      };
    case AtendenteEditTypes.UPDATE_ATENDENTEEDIT_REQUEST: {
      const data = action.payload.atendenteEdit;
      return { data };
    }
    case AtendenteEditTypes.DELETE_ATENDENTEEDIT_REQUEST: {
      const data = {} as AtendenteModel;
      return { data };
    }
    case AtendenteEditTypes.CLEAR_ATENDENTEEDIT_REQUEST: {
      const data = {} as AtendenteModel;
      return { data };
    }
    default:
      return state;
  }
}
