import { ComandaModel } from '../../../models/ComandaModel';
import { ComandaListTypes } from './types';
export const loadComandaList   = (data: ComandaModel[]) => ({ type: ComandaListTypes.LOAD,   payload: data });
export const createComandaList = (data: ComandaModel)   => ({ type: ComandaListTypes.CREATE, payload: data });
export const deleteComandaList = (codigo: string)       => ({ type: ComandaListTypes.DELETE, payload: codigo });
export const clearComandaList  = ()                     => ({ type: ComandaListTypes.CLEAR });
