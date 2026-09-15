import { ItemModel } from '../../../models/ItemModel';
import { FlavorEditTypes } from './types';
export const createFlavorEdit = (data: ItemModel) => ({ type: FlavorEditTypes.CREATE, payload: data });
export const updateFlavorEdit = (data: ItemModel) => ({ type: FlavorEditTypes.UPDATE, payload: data });
export const deleteFlavorEdit = () => ({ type: FlavorEditTypes.DELETE });
export const clearFlavorEdit  = () => ({ type: FlavorEditTypes.CLEAR });
