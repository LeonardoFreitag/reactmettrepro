import { SubgrupoModel } from '../../../models/SubgrupoModel';
import {
  SubgrupoEditTypes,
  SubgrupoEditState,
  SubgrupoEditActionsTypes,
} from './types';

const INITIAL_STATE: SubgrupoEditState = {
  data: {} as SubgrupoModel,
};

export default function SubgrupoEditReducer(
  state = INITIAL_STATE,
  action: SubgrupoEditActionsTypes,
): SubgrupoEditState {
  switch (action.type) {
    case SubgrupoEditTypes.CREATE_SUBGRUPOEDIT_REQUEST:
      return {
        data: action.payload.subgrupoEdit,
      };
    case SubgrupoEditTypes.UPDATE_SUBGRUPOEDIT_REQUEST: {
      const data = action.payload.subgrupoEdit;
      return { data };
    }
    case SubgrupoEditTypes.DELETE_SUBGRUPOEDIT_REQUEST: {
      const data = {} as SubgrupoModel;
      return { data };
    }
    case SubgrupoEditTypes.CLEAR_SUBGRUPOEDIT_REQUEST: {
      const data = {} as SubgrupoModel;
      return { data };
    }
    default:
      return state;
  }
}
