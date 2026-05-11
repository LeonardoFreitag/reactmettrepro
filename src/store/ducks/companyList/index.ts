import { CompanyListTypes, CompanyListState } from './types';
const INITIAL_STATE: CompanyListState = { data: [] };
export default function companyListReducer(state = INITIAL_STATE, action: { type: CompanyListTypes; payload?: any }): CompanyListState {
  switch (action.type) {
    case CompanyListTypes.LOAD:
      return { data: action.payload };
    case CompanyListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case CompanyListTypes.UPDATE:
      return { data: action.payload };
    case CompanyListTypes.DELETE:
      return { data: state.data.filter(c => c.id !== action.payload) };
    case CompanyListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
