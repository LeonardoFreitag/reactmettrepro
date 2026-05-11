import { CompanyModel } from '../../../models/CompanyModel';
export enum CompanyListTypes {
  LOAD   = 'companyList/LOAD',
  CREATE = 'companyList/CREATE',
  UPDATE = 'companyList/UPDATE',
  DELETE = 'companyList/DELETE',
  CLEAR  = 'companyList/CLEAR',
}
export interface CompanyListState { data: CompanyModel[]; }
