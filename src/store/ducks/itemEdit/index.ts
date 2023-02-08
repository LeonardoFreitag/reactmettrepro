import { ItemModel } from '../../../models/ItemModel';
import { ItemEditTypes, ItemEditState, ItemEditActionsTypes } from './types';

const INITIAL_STATE: ItemEditState = {
  data: {} as ItemModel,
};

export default function ItemEditReducer(
  state = INITIAL_STATE,
  action: ItemEditActionsTypes,
): ItemEditState {
  switch (action.type) {
    case ItemEditTypes.CREATE_ITEMEDIT_REQUEST:
      return {
        data: action.payload.itemEdit,
      };
    case ItemEditTypes.UPDATE_ITEMEDIT_REQUEST: {
      const data = action.payload.itemEdit;
      return { data };
    }
    case ItemEditTypes.DELETE_ITEMEDIT_REQUEST: {
      const data = {} as ItemModel;
      return { data };
    }
    case ItemEditTypes.CLEAR_ITEMEDIT_REQUEST: {
      const data = {} as ItemModel;
      return { data };
    }
    default:
      return state;
  }
}
