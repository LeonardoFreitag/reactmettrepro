import { CompanyModel } from '../../../models/CompanyModel';
import { CompanyEditTypes, CompanyEditActionsTypes } from './types';

export function createCompanyEdit(
  companyEdit: CompanyModel,
): CompanyEditActionsTypes {
  return {
    type: CompanyEditTypes.CREATE_COMPANYEDIT_REQUEST,
    payload: { companyEdit },
  };
}

export function updateCompanyEdit(
  companyEdit: CompanyModel,
): CompanyEditActionsTypes {
  return {
    type: CompanyEditTypes.UPDATE_COMPANYEDIT_REQUEST,
    payload: { companyEdit },
  };
}

export function deleteCompanyEdit(
  companyEdit: CompanyModel,
): CompanyEditActionsTypes {
  return {
    type: CompanyEditTypes.DELETE_COMPANYEDIT_REQUEST,
    payload: { companyEdit },
  };
}

export function clearCompanyEdit(
  companyEdit: CompanyModel,
): CompanyEditActionsTypes {
  return {
    type: CompanyEditTypes.CLEAR_COMPANYEDIT_REQUEST,
    payload: { companyEdit },
  };
}
