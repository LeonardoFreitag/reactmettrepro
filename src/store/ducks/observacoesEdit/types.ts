import { ObservacoesModel } from '../../../models/ObservacoesModel';
export enum ObservacoesEditTypes {
  CREATE = 'observacoesEdit/CREATE',
  UPDATE = 'observacoesEdit/UPDATE',
  DELETE = 'observacoesEdit/DELETE',
  CLEAR  = 'observacoesEdit/CLEAR',
}
export interface ObservacoesEditState { data: ObservacoesModel; }
