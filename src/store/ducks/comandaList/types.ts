import { ComandaModel } from '../../../models/ComandaModel';
export enum ComandaListTypes {
  LOAD   = 'comandaList/LOAD',
  CREATE = 'comandaList/CREATE',
  DELETE = 'comandaList/DELETE',
  CLEAR  = 'comandaList/CLEAR',
}
export interface ComandaListState { data: ComandaModel[]; }
