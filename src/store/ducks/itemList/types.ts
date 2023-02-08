import { ItemModel } from '../../../models/ItemModel';

/*
 * actiontpes
 */
export enum ItemListTypes {
  LOAD_ITEMLIST_REQUEST = '@itemList/LOAD_ITEMLIST_REQUEST',
  CREATE_ITEMLIST_REQUEST = '@itemList/CREATE_ITEMLIST_REQUEST',
  UPDATE_ITEMLIST_REQUEST = '@itemList/UPDATE_ITEMLIST_REQUEST',
  DELETE_ITEMLIST_REQUEST = '@itemList/DELETE_ITEMLIST_REQUEST',
  CLEAR_ITEMLIST_REQUEST = '@itemList/CLEAR_ITEMLIST_REQUEST',
}

/*
 * state types
 */
export interface ItemListState {
  readonly data: ItemModel[];
}

// export const LOAD_ITEMLIST_REQUEST = '@itemList/LOAD_ITEMLIST_REQUEST';
interface LoadItemListRequest {
  type: ItemListTypes.LOAD_ITEMLIST_REQUEST; // typeof LOAD_ITEMLIST_REQUEST;
  payload: { itemList: ItemModel[] };
}

// export const CREATE_ITEMLIST_REQUEST = '@itemList/CREATE_ITEMLIST_REQUEST';
interface CreateItemListRequest {
  type: ItemListTypes.CREATE_ITEMLIST_REQUEST; // typeof CREATE_ITEMLIST_REQUEST;
  payload: { itemList: ItemModel };
}

// export const UPDATE_ITEMLIST_REQUEST = '@itemList/UPDATE_ITEMLIST_REQUEST';
interface UpdateItemListRequest {
  type: ItemListTypes.UPDATE_ITEMLIST_REQUEST;
  payload: { itemList: ItemModel };
}
// export const DELETE_ITEMLIST_REQUEST = '@itemList/DELETE_ITEMLIST_REQUEST';
interface DeleteItemListRequest {
  type: ItemListTypes.DELETE_ITEMLIST_REQUEST;
  payload: { itemList: ItemModel };
}

interface ClearItemListRequest {
  type: ItemListTypes.CLEAR_ITEMLIST_REQUEST;
  payload: { itemList: ItemModel };
}

export type ItemListActionsTypes =
  | LoadItemListRequest
  | CreateItemListRequest
  | UpdateItemListRequest
  | DeleteItemListRequest
  | ClearItemListRequest;
