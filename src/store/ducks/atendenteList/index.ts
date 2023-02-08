import { AtendenteModel } from '../../../models/AtendenteModel';
import {
  AtendenteListTypes,
  AtendenteListState,
  AtendenteListActionsTypes,
} from './types';

const INITIAL_STATE: AtendenteListState = {
  data: [],
};

export default function AtendenteListReducer(
  state = INITIAL_STATE,
  action: AtendenteListActionsTypes,
): AtendenteListState {
  switch (action.type) {
    case AtendenteListTypes.LOAD_ATENDENTELIST_REQUEST:
      return {
        data: action.payload.atendenteList,
      };
    case AtendenteListTypes.CREATE_ATENDENTELIST_REQUEST:
      return {
        data: [...state.data, action.payload.atendenteList],
      };
    case AtendenteListTypes.UPDATE_ATENDENTELIST_REQUEST: {
      const data = state.data.map(atendente =>
        atendente.codigo === action.payload.atendenteList.codigo
          ? action.payload.atendenteList
          : atendente,
      );
      return { data };
    }
    case AtendenteListTypes.DELETE_ATENDENTELIST_REQUEST: {
      const data = state.data.filter(
        atendente => atendente.codigo !== action.payload.atendenteList.codigo,
      );
      return { data };
    }
    case AtendenteListTypes.CLEAR_ATENDENTELIST_REQUEST: {
      const data = [] as AtendenteModel[];
      return { data };
    }
    default:
      return state;
  }
}
