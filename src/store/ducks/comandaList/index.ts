import { ComandaModel } from '../../../models/ComandaModel';
import {
  ComandaListTypes,
  ComandaListState,
  ComandaListActionsTypes,
} from './types';

const INITIAL_STATE: ComandaListState = {
  data: [],
};

export default function ComandaListReducer(
  state = INITIAL_STATE,
  action: ComandaListActionsTypes,
): ComandaListState {
  switch (action.type) {
    case ComandaListTypes.LOAD_COMANDALIST_REQUEST:
      return {
        data: action.payload.comandaList,
      };
    case ComandaListTypes.CREATE_COMANDALIST_REQUEST:
      return {
        data: [...state.data, action.payload.comandaList],
      };
    case ComandaListTypes.UPDATE_COMANDALIST_REQUEST: {
      const data = state.data.map(comanda =>
        comanda.codigo === action.payload.comandaList.codigo
          ? action.payload.comandaList
          : comanda,
      );
      return { data };
    }
    case ComandaListTypes.DELETE_COMANDALIST_REQUEST: {
      const data = state.data.filter(
        comanda => comanda.codigo !== action.payload.comandaList.codigo,
      );
      return { data };
    }
    case ComandaListTypes.CLEAR_COMANDALIST_REQUEST: {
      const data = [] as ComandaModel[];
      return { data };
    }
    default:
      return state;
  }
}
