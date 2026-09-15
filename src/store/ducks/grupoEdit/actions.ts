import { GrupoModel } from '../../../models/GrupoModel';
import { GrupoEditTypes } from './types';
export const createGrupoEdit = (data: GrupoModel) => ({ type: GrupoEditTypes.CREATE, payload: data });
export const updateGrupoEdit = (data: GrupoModel) => ({ type: GrupoEditTypes.UPDATE, payload: data });
export const deleteGrupoEdit = () => ({ type: GrupoEditTypes.DELETE });
export const clearGrupoEdit  = () => ({ type: GrupoEditTypes.CLEAR });
