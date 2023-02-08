import { ItemModel } from '../../../models/ItemModel';
import { ItemListTypes, ItemListActionsTypes } from './types';

export function loadItemList(itemList: ItemModel[]): ItemListActionsTypes {
  return {
    type: ItemListTypes.LOAD_ITEMLIST_REQUEST,
    payload: { itemList },
  };
}

export function createItemList(itemList: ItemModel): ItemListActionsTypes {
  return {
    type: ItemListTypes.CREATE_ITEMLIST_REQUEST,
    payload: { itemList },
  };
}

export function updateItemList(itemList: ItemModel): ItemListActionsTypes {
  return {
    type: ItemListTypes.UPDATE_ITEMLIST_REQUEST,
    payload: { itemList },
  };
}

export function deleteItemList(itemList: ItemModel): ItemListActionsTypes {
  return {
    type: ItemListTypes.DELETE_ITEMLIST_REQUEST,
    payload: { itemList },
  };
}

export function clearItemList(itemList: ItemModel): ItemListActionsTypes {
  return {
    type: ItemListTypes.CLEAR_ITEMLIST_REQUEST,
    payload: { itemList },
  };
}
