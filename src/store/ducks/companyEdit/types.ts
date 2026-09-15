import { CompanyModel } from '../../../models/CompanyModel';
export enum CompanyEditTypes {
  CREATE = 'companyEdit/CREATE',
  UPDATE = 'companyEdit/UPDATE',
  DELETE = 'companyEdit/DELETE',
  CLEAR  = 'companyEdit/CLEAR',
}
export interface CompanyEditState { data: CompanyModel; }
