import { ItemModel } from '../../../models/ItemModel';
import { ItemEditTypes, ItemEditActionsTypes } from './types';

export function createItemEdit(itemEdit: ItemModel): ItemEditActionsTypes {
  return {
    type: ItemEditTypes.CREATE_ITEMEDIT_REQUEST,
    payload: { itemEdit },
  };
}

export function updateItemEdit(itemEdit: ItemModel): ItemEditActionsTypes {
  return {
    type: ItemEditTypes.UPDATE_ITEMEDIT_REQUEST,
    payload: { itemEdit },
  };
}

export function deleteItemEdit(itemEdit: ItemModel): ItemEditActionsTypes {
  return {
    type: ItemEditTypes.DELETE_ITEMEDIT_REQUEST,
    payload: { itemEdit },
  };
}

export function clearItemEdit(itemEdit: ItemModel): ItemEditActionsTypes {
  return {
    type: ItemEditTypes.CLEAR_ITEMEDIT_REQUEST,
    payload: { itemEdit },
  };
}
