import { AtendenteModel } from '../../../models/AtendenteModel';
export enum AtendenteEditTypes {
  CREATE = 'atendenteEdit/CREATE',
  UPDATE = 'atendenteEdit/UPDATE',
  DELETE = 'atendenteEdit/DELETE',
  CLEAR  = 'atendenteEdit/CLEAR',
}
export interface AtendenteEditState { data: AtendenteModel; }
