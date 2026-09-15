import { ItemModel } from '../../../models/ItemModel';
export enum ItemEditTypes {
  CREATE = 'itemEdit/CREATE',
  UPDATE = 'itemEdit/UPDATE',
  DELETE = 'itemEdit/DELETE',
  CLEAR  = 'itemEdit/CLEAR',
}
export interface ItemEditState { data: ItemModel; }
