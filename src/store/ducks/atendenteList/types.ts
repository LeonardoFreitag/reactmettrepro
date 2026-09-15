import { AtendenteModel } from '../../../models/AtendenteModel';
export enum AtendenteListTypes {
  LOAD   = 'atendenteList/LOAD',
  CREATE = 'atendenteList/CREATE',
  DELETE = 'atendenteList/DELETE',
  CLEAR  = 'atendenteList/CLEAR',
}
export interface AtendenteListState { data: AtendenteModel[]; }
