import { SubgrupoModel } from '../../../models/SubgrupoModel';
import { SubgrupoEditTypes } from './types';
export const createSubgrupoEdit = (data: SubgrupoModel) => ({ type: SubgrupoEditTypes.CREATE, payload: data });
export const updateSubgrupoEdit = (data: SubgrupoModel) => ({ type: SubgrupoEditTypes.UPDATE, payload: data });
export const deleteSubgrupoEdit = () => ({ type: SubgrupoEditTypes.DELETE });
export const clearSubgrupoEdit  = () => ({ type: SubgrupoEditTypes.CLEAR });
