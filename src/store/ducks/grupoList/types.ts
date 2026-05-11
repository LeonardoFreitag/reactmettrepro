import { GrupoModel } from '../../../models/GrupoModel';
export enum GrupoListTypes {
  LOAD   = 'grupoList/LOAD',
  CREATE = 'grupoList/CREATE',
  DELETE = 'grupoList/DELETE',
  CLEAR  = 'grupoList/CLEAR',
}
export interface GrupoListState { data: GrupoModel[]; }
