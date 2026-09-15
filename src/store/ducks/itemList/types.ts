import { ItemModel } from '../../../models/ItemModel';
export enum ItemListTypes {
  LOAD   = 'itemList/LOAD',
  CREATE = 'itemList/CREATE',
  UPDATE = 'itemList/UPDATE',
  DELETE = 'itemList/DELETE',
  CLEAR  = 'itemList/CLEAR',
}
export interface ItemListState { data: ItemModel[]; }
