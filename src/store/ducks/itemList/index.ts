import { ItemListTypes, ItemListState } from './types';
const INITIAL_STATE: ItemListState = { data: [] };
export default function itemListReducer(state = INITIAL_STATE, action: { type: ItemListTypes; payload?: any }): ItemListState {
  switch (action.type) {
    case ItemListTypes.LOAD:
      return { data: action.payload };
    case ItemListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case ItemListTypes.UPDATE:
      return { data: state.data.map(i => i.mobileId === action.payload.mobileId ? action.payload : i) };
    case ItemListTypes.DELETE:
      return { data: state.data.filter(i => i.mobileId !== action.payload) };
    case ItemListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
