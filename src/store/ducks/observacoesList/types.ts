import { ObservacoesModel } from '../../../models/ObservacoesModel';
export enum ObservacoesListTypes {
  LOAD   = 'observacoesList/LOAD',
  CREATE = 'observacoesList/CREATE',
  DELETE = 'observacoesList/DELETE',
  CLEAR  = 'observacoesList/CLEAR',
}
export interface ObservacoesListState { data: ObservacoesModel[]; }
