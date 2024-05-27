import { CompanyModel } from '../../../models/CompanyModel';
import { CompanyListTypes, CompanyListActionsTypes } from './types';

export function loadCompanyList(
  companyList: CompanyModel[],
): CompanyListActionsTypes {
  return {
    type: CompanyListTypes.LOAD_COMPANYLIST_REQUEST,
    payload: { companyList },
  };
}

export function createCompanyList(
  companyList: CompanyModel,
): CompanyListActionsTypes {
  return {
    type: CompanyListTypes.CREATE_COMPANYLIST_REQUEST,
    payload: { companyList },
  };
}

export function updateCompanyList(
  companyList: CompanyModel,
): CompanyListActionsTypes {
  return {
    type: CompanyListTypes.UPDATE_COMPANYLIST_REQUEST,
    payload: { companyList },
  };
}

export function deleteCompanyList(
  companyList: CompanyModel,
): CompanyListActionsTypes {
  return {
    type: CompanyListTypes.DELETE_COMPANYLIST_REQUEST,
    payload: { companyList },
  };
}

export function clearCompanyList(
  companyList: CompanyModel,
): CompanyListActionsTypes {
  return {
    type: CompanyListTypes.CLEAR_COMPANYLIST_REQUEST,
    payload: { companyList },
  };
}
