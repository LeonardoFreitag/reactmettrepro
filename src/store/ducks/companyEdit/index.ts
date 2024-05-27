import { CompanyModel } from '../../../models/CompanyModel';
import {
  CompanyEditTypes,
  CompanyEditState,
  CompanyEditActionsTypes,
} from './types';

const INITIAL_STATE: CompanyEditState = {
  data: {} as CompanyModel,
};

export default function CompanyEditReducer(
  state = INITIAL_STATE,
  action: CompanyEditActionsTypes,
): CompanyEditState {
  switch (action.type) {
    case CompanyEditTypes.CREATE_COMPANYEDIT_REQUEST:
      return {
        data: action.payload.companyEdit,
      };
    case CompanyEditTypes.UPDATE_COMPANYEDIT_REQUEST: {
      const data = action.payload.companyEdit;
      return { data };
    }
    case CompanyEditTypes.DELETE_COMPANYEDIT_REQUEST: {
      const data = {} as CompanyModel;
      return { data };
    }
    case CompanyEditTypes.CLEAR_COMPANYEDIT_REQUEST: {
      const data = {} as CompanyModel;
      return { data };
    }
    default:
      return state;
  }
}
