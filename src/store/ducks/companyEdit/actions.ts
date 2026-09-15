import { CompanyModel } from '../../../models/CompanyModel';
import { CompanyEditTypes } from './types';
export const createCompanyEdit = (data: CompanyModel) => ({ type: CompanyEditTypes.CREATE, payload: data });
export const updateCompanyEdit = (data: CompanyModel) => ({ type: CompanyEditTypes.UPDATE, payload: data });
export const deleteCompanyEdit = () => ({ type: CompanyEditTypes.DELETE });
export const clearCompanyEdit  = () => ({ type: CompanyEditTypes.CLEAR });
