import { ComandaModel } from '../../../models/ComandaModel';
export enum ComandaEditTypes {
  CREATE = 'comandaEdit/CREATE',
  UPDATE = 'comandaEdit/UPDATE',
  DELETE = 'comandaEdit/DELETE',
  CLEAR  = 'comandaEdit/CLEAR',
}
export interface ComandaEditState { data: ComandaModel; }
