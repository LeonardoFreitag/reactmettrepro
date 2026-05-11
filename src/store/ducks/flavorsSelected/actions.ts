import { FlavorModel } from '../../../models/FlavorModel';
import { FlavorsSelectedTypes } from './types';
export const loadFlavorsSelected   = (data: FlavorModel[]) => ({ type: FlavorsSelectedTypes.LOAD,   payload: data });
export const createFlavorsSelected = (data: FlavorModel)   => ({ type: FlavorsSelectedTypes.CREATE, payload: data });
export const deleteFlavorsSelected = (codigo: string)      => ({ type: FlavorsSelectedTypes.DELETE, payload: codigo });
export const clearFlavorsSelected  = ()                    => ({ type: FlavorsSelectedTypes.CLEAR });
