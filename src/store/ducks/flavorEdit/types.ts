import { ItemModel } from '../../../models/ItemModel';
export enum FlavorEditTypes {
  CREATE = 'flavorEdit/CREATE',
  UPDATE = 'flavorEdit/UPDATE',
  DELETE = 'flavorEdit/DELETE',
  CLEAR  = 'flavorEdit/CLEAR',
}
export interface FlavorEditState { data: ItemModel; }
