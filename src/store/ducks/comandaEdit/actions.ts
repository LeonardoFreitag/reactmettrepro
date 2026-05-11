import { ComandaModel } from '../../../models/ComandaModel';
import { ComandaEditTypes } from './types';
export const createComandaEdit = (data: ComandaModel) => ({ type: ComandaEditTypes.CREATE, payload: data });
export const updateComandaEdit = (data: ComandaModel) => ({ type: ComandaEditTypes.UPDATE, payload: data });
export const deleteComandaEdit = () => ({ type: ComandaEditTypes.DELETE });
export const clearComandaEdit  = () => ({ type: ComandaEditTypes.CLEAR });
