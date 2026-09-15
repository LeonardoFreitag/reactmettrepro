import { GrupoModel } from '../../../models/GrupoModel';
export enum GrupoEditTypes {
  CREATE = 'grupoEdit/CREATE',
  UPDATE = 'grupoEdit/UPDATE',
  DELETE = 'grupoEdit/DELETE',
  CLEAR  = 'grupoEdit/CLEAR',
}
export interface GrupoEditState { data: GrupoModel; }
