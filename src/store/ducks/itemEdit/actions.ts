import { ItemModel } from '../../../models/ItemModel';
import { ItemEditTypes } from './types';
export const createItemEdit = (data: ItemModel) => ({ type: ItemEditTypes.CREATE, payload: data });
export const updateItemEdit = (data: ItemModel) => ({ type: ItemEditTypes.UPDATE, payload: data });
export const deleteItemEdit = () => ({ type: ItemEditTypes.DELETE });
export const clearItemEdit  = () => ({ type: ItemEditTypes.CLEAR });
