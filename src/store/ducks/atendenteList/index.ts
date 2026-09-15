import { AtendenteListTypes, AtendenteListState } from './types';
const INITIAL_STATE: AtendenteListState = { data: [] };
export default function atendenteListReducer(state = INITIAL_STATE, action: { type: AtendenteListTypes; payload?: any }): AtendenteListState {
  switch (action.type) {
    case AtendenteListTypes.LOAD:
      return { data: action.payload };
    case AtendenteListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case AtendenteListTypes.DELETE:
      return { data: state.data.filter(a => a.codigo !== action.payload) };
    case AtendenteListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
