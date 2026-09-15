import { ItemModel } from '../../../models/ItemModel';
import { ItemListTypes } from './types';
export const loadItemList   = (data: ItemModel[]) => ({ type: ItemListTypes.LOAD,   payload: data });
export const createItemList = (data: ItemModel)   => ({ type: ItemListTypes.CREATE, payload: data });
export const updateItemList = (data: ItemModel)   => ({ type: ItemListTypes.UPDATE, payload: data });
export const deleteItemList = (mobileId: string)  => ({ type: ItemListTypes.DELETE, payload: mobileId });
export const clearItemList  = ()                  => ({ type: ItemListTypes.CLEAR });
