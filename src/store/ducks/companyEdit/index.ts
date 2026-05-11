import { CompanyEditTypes, CompanyEditState } from './types';
const INITIAL_STATE: CompanyEditState = { data: { id: '', nome: '', ip: '', porta: '', isSelected: false } };
export default function companyEditReducer(state = INITIAL_STATE, action: { type: CompanyEditTypes; payload?: any }): CompanyEditState {
  switch (action.type) {
    case CompanyEditTypes.CREATE:
    case CompanyEditTypes.UPDATE:
      return { data: action.payload };
    case CompanyEditTypes.DELETE:
    case CompanyEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
