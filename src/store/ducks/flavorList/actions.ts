import { FlavorModel } from '../../../models/FlavorModel';
import { FlavorListTypes } from './types';
export const loadFlavorList   = (data: FlavorModel[]) => ({ type: FlavorListTypes.LOAD,   payload: data });
export const createFlavorList = (data: FlavorModel)   => ({ type: FlavorListTypes.CREATE, payload: data });
export const deleteFlavorList = (codigo: string)      => ({ type: FlavorListTypes.DELETE, payload: codigo });
export const clearFlavorList  = ()                    => ({ type: FlavorListTypes.CLEAR });
