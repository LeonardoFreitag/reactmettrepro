import { CompanyModel } from '../../../models/CompanyModel';
import {
  CompanyListTypes,
  CompanyListState,
  CompanyListActionsTypes,
} from './types';

const INITIAL_STATE: CompanyListState = {
  data: [],
};

export default function CompanyListReducer(
  state = INITIAL_STATE,
  action: CompanyListActionsTypes,
): CompanyListState {
  switch (action.type) {
    case CompanyListTypes.LOAD_COMPANYLIST_REQUEST:
      return {
        data: action.payload.companyList,
      };
    case CompanyListTypes.CREATE_COMPANYLIST_REQUEST:
      return {
        data: [...state.data, action.payload.companyList],
      };
    case CompanyListTypes.UPDATE_COMPANYLIST_REQUEST: {
      const data = state.data.map(atendente =>
        atendente.id === action.payload.companyList.id
          ? action.payload.companyList
          : atendente,
      );
      return { data };
    }
    case CompanyListTypes.DELETE_COMPANYLIST_REQUEST: {
      const data = state.data.filter(
        atendente => atendente.id !== action.payload.companyList.id,
      );
      return { data };
    }
    case CompanyListTypes.CLEAR_COMPANYLIST_REQUEST: {
      const data = [] as CompanyModel[];
      return { data };
    }
    default:
      return state;
  }
}
