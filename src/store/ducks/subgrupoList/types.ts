import { SubgrupoModel } from '../../../models/SubgrupoModel';
export enum SubgrupoListTypes {
  LOAD   = 'subgrupoList/LOAD',
  CREATE = 'subgrupoList/CREATE',
  DELETE = 'subgrupoList/DELETE',
  CLEAR  = 'subgrupoList/CLEAR',
}
export interface SubgrupoListState { data: SubgrupoModel[]; }
