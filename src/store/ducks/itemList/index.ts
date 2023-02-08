import { ItemModel } from '../../../models/ItemModel';
import { ItemListTypes, ItemListState, ItemListActionsTypes } from './types';

const INITIAL_STATE: ItemListState = {
  data: [],
};

export default function ItemListReducer(
  state = INITIAL_STATE,
  action: ItemListActionsTypes,
): ItemListState {
  switch (action.type) {
    case ItemListTypes.LOAD_ITEMLIST_REQUEST:
      return {
        data: action.payload.itemList,
      };
    case ItemListTypes.CREATE_ITEMLIST_REQUEST:
      return {
        data: [...state.data, action.payload.itemList],
      };
    case ItemListTypes.UPDATE_ITEMLIST_REQUEST: {
      const data = state.data.map(item =>
        item.codigo === action.payload.itemList.codigo
          ? action.payload.itemList
          : item,
      );
      return { data };
    }
    case ItemListTypes.DELETE_ITEMLIST_REQUEST: {
      const data = state.data.filter(
        item => item.codigo !== action.payload.itemList.codigo,
      );
      return { data };
    }
    case ItemListTypes.CLEAR_ITEMLIST_REQUEST: {
      const data = [] as ItemModel[];
      return { data };
    }
    default:
      return state;
  }
}
