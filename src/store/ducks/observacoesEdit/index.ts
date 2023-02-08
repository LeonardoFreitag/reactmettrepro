import { ObservacoesModel } from '../../../models/ObservacoesModel';
import {
  ObservacoesEditTypes,
  ObservacoesEditState,
  ObservacoesEditActionsTypes,
} from './types';

const INITIAL_STATE: ObservacoesEditState = {
  data: {} as ObservacoesModel,
};

export default function ObservacoesEditReducer(
  state = INITIAL_STATE,
  action: ObservacoesEditActionsTypes,
): ObservacoesEditState {
  switch (action.type) {
    case ObservacoesEditTypes.CREATE_OBSERVACOESEDIT_REQUEST:
      return {
        data: action.payload.observacoesEdit,
      };
    case ObservacoesEditTypes.UPDATE_OBSERVACOESEDIT_REQUEST: {
      const data = action.payload.observacoesEdit;
      return { data };
    }
    case ObservacoesEditTypes.DELETE_OBSERVACOESEDIT_REQUEST: {
      const data = {} as ObservacoesModel;
      return { data };
    }
    case ObservacoesEditTypes.CLEAR_OBSERVACOESEDIT_REQUEST: {
      const data = {} as ObservacoesModel;
      return { data };
    }
    default:
      return state;
  }
}
