import { CompanyModel } from '../../../models/CompanyModel';
import { CompanyListTypes } from './types';
export const loadCompanyList   = (data: CompanyModel[]) => ({ type: CompanyListTypes.LOAD,   payload: data });
export const createCompanyList = (data: CompanyModel)   => ({ type: CompanyListTypes.CREATE, payload: data });
export const updateCompanyList = (data: CompanyModel[]) => ({ type: CompanyListTypes.UPDATE, payload: data });
export const deleteCompanyList = (id: string)           => ({ type: CompanyListTypes.DELETE, payload: id });
export const clearCompanyList  = ()                     => ({ type: CompanyListTypes.CLEAR });
