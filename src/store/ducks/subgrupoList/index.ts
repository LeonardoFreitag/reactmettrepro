import { SubgrupoModel } from '../../../models/SubgrupoModel';
import {
  SubgrupoListTypes,
  SubgrupoListState,
  SubgrupoListActionsTypes,
} from './types';

const INITIAL_STATE: SubgrupoListState = {
  data: [],
};

export default function SubgrupoListReducer(
  state = INITIAL_STATE,
  action: SubgrupoListActionsTypes,
): SubgrupoListState {
  switch (action.type) {
    case SubgrupoListTypes.LOAD_SUBGRUPOLIST_REQUEST:
      return {
        data: action.payload.subgrupoList,
      };
    case SubgrupoListTypes.CREATE_SUBGRUPOLIST_REQUEST:
      return {
        data: [...state.data, action.payload.subgrupoList],
      };
    case SubgrupoListTypes.UPDATE_SUBGRUPOLIST_REQUEST: {
      const data = state.data.map(subgrupo =>
        subgrupo.codigo === action.payload.subgrupoList.codigo
          ? action.payload.subgrupoList
          : subgrupo,
      );
      return { data };
    }
    case SubgrupoListTypes.DELETE_SUBGRUPOLIST_REQUEST: {
      const data = state.data.filter(
        subgrupo => subgrupo.codigo !== action.payload.subgrupoList.codigo,
      );
      return { data };
    }
    case SubgrupoListTypes.CLEAR_SUBGRUPOLIST_REQUEST: {
      const data = [] as SubgrupoModel[];
      return { data };
    }
    default:
      return state;
  }
}
