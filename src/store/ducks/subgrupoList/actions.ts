import { SubgrupoModel } from '../../../models/SubgrupoModel';
import { SubgrupoListTypes } from './types';
export const loadSubgrupoList   = (data: SubgrupoModel[]) => ({ type: SubgrupoListTypes.LOAD,   payload: data });
export const createSubgrupoList = (data: SubgrupoModel)   => ({ type: SubgrupoListTypes.CREATE, payload: data });
export const deleteSubgrupoList = (nome: string)          => ({ type: SubgrupoListTypes.DELETE, payload: nome });
export const clearSubgrupoList  = ()                      => ({ type: SubgrupoListTypes.CLEAR });
