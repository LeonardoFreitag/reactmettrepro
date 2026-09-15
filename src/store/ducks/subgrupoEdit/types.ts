import { SubgrupoModel } from '../../../models/SubgrupoModel';
export enum SubgrupoEditTypes {
  CREATE = 'subgrupoEdit/CREATE',
  UPDATE = 'subgrupoEdit/UPDATE',
  DELETE = 'subgrupoEdit/DELETE',
  CLEAR  = 'subgrupoEdit/CLEAR',
}
export interface SubgrupoEditState { data: SubgrupoModel; }
