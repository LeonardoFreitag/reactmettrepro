import { GrupoModel } from '../../../models/GrupoModel';
import { GrupoListTypes, GrupoListState, GrupoListActionsTypes } from './types';

const INITIAL_STATE: GrupoListState = {
  data: [],
};

export default function GrupoListReducer(
  state = INITIAL_STATE,
  action: GrupoListActionsTypes,
): GrupoListState {
  switch (action.type) {
    case GrupoListTypes.LOAD_GRUPOLIST_REQUEST:
      return {
        data: action.payload.grupoList,
      };
    case GrupoListTypes.CREATE_GRUPOLIST_REQUEST:
      return {
        data: [...state.data, action.payload.grupoList],
      };
    case GrupoListTypes.UPDATE_GRUPOLIST_REQUEST: {
      const data = state.data.map(grupo =>
        grupo.codigo === action.payload.grupoList.codigo
          ? action.payload.grupoList
          : grupo,
      );
      return { data };
    }
    case GrupoListTypes.DELETE_GRUPOLIST_REQUEST: {
      const data = state.data.filter(
        grupo => grupo.codigo !== action.payload.grupoList.codigo,
      );
      return { data };
    }
    case GrupoListTypes.CLEAR_GRUPOLIST_REQUEST: {
      const data = [] as GrupoModel[];
      return { data };
    }
    default:
      return state;
  }
}
