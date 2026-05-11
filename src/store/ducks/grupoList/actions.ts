import { GrupoModel } from '../../../models/GrupoModel';
import { GrupoListTypes } from './types';
export const loadGrupoList   = (data: GrupoModel[]) => ({ type: GrupoListTypes.LOAD,   payload: data });
export const createGrupoList = (data: GrupoModel)   => ({ type: GrupoListTypes.CREATE, payload: data });
export const deleteGrupoList = (codigo: string)     => ({ type: GrupoListTypes.DELETE, payload: codigo });
export const clearGrupoList  = ()                   => ({ type: GrupoListTypes.CLEAR });
