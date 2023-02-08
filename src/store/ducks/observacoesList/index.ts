import { ObservacoesModel } from '../../../models/ObservacoesModel';
import {
  ObservacoesListTypes,
  ObservacoesListState,
  ObservacoesListActionsTypes,
} from './types';

const INITIAL_STATE: ObservacoesListState = {
  data: [],
};

export default function ObservacoesListReducer(
  state = INITIAL_STATE,
  action: ObservacoesListActionsTypes,
): ObservacoesListState {
  switch (action.type) {
    case ObservacoesListTypes.LOAD_OBSERVACOESLIST_REQUEST:
      return {
        data: action.payload.observacoesList,
      };
    case ObservacoesListTypes.CREATE_OBSERVACOESLIST_REQUEST:
      return {
        data: [...state.data, action.payload.observacoesList],
      };
    case ObservacoesListTypes.UPDATE_OBSERVACOESLIST_REQUEST: {
      const data = state.data.map(observacoes =>
        observacoes.codigo === action.payload.observacoesList.codigo
          ? action.payload.observacoesList
          : observacoes,
      );
      return { data };
    }
    case ObservacoesListTypes.DELETE_OBSERVACOESLIST_REQUEST: {
      const data = state.data.filter(
        observacoes =>
          observacoes.codigo !== action.payload.observacoesList.codigo,
      );
      return { data };
    }
    case ObservacoesListTypes.CLEAR_OBSERVACOESLIST_REQUEST: {
      const data = [] as ObservacoesModel[];
      return { data };
    }
    default:
      return state;
  }
}
