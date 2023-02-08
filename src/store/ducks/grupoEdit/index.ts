import { GrupoModel } from '../../../models/GrupoModel';
import { GrupoEditTypes, GrupoEditState, GrupoEditActionsTypes } from './types';

const INITIAL_STATE: GrupoEditState = {
  data: {} as GrupoModel,
};

export default function GrupoEditReducer(
  state = INITIAL_STATE,
  action: GrupoEditActionsTypes,
): GrupoEditState {
  switch (action.type) {
    case GrupoEditTypes.CREATE_GRUPOEDIT_REQUEST:
      return {
        data: action.payload.grupoEdit,
      };
    case GrupoEditTypes.UPDATE_GRUPOEDIT_REQUEST: {
      const data = action.payload.grupoEdit;
      return { data };
    }
    case GrupoEditTypes.DELETE_GRUPOEDIT_REQUEST: {
      const data = {} as GrupoModel;
      return { data };
    }
    case GrupoEditTypes.CLEAR_GRUPOEDIT_REQUEST: {
      const data = {} as GrupoModel;
      return { data };
    }
    default:
      return state;
  }
}
