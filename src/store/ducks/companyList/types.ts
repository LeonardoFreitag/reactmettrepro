import { CompanyModel } from '../../../models/CompanyModel';

/*
 * actiontpes
 */
export enum CompanyListTypes {
  LOAD_COMPANYLIST_REQUEST = '@companyList/LOAD_COMPANYLIST_REQUEST',
  CREATE_COMPANYLIST_REQUEST = '@companyList/CREATE_COMPANYLIST_REQUEST',
  UPDATE_COMPANYLIST_REQUEST = '@companyList/UPDATE_COMPANYLIST_REQUEST',
  DELETE_COMPANYLIST_REQUEST = '@companyList/DELETE_COMPANYLIST_REQUEST',
  CLEAR_COMPANYLIST_REQUEST = '@companyList/CLEAR_COMPANYLIST_REQUEST',
}

/*
 * state types
 */
export interface CompanyListState {
  readonly data: CompanyModel[];
}

// export const LOAD_COMPANYLIST_REQUEST = '@companyList/LOAD_COMPANYLIST_REQUEST';
interface LoadCompanyListRequest {
  type: CompanyListTypes.LOAD_COMPANYLIST_REQUEST; // typeof LOAD_COMPANYLIST_REQUEST;
  payload: { companyList: CompanyModel[] };
}

// export const CREATE_COMPANYLIST_REQUEST = '@companyList/CREATE_COMPANYLIST_REQUEST';
interface CreateCompanyListRequest {
  type: CompanyListTypes.CREATE_COMPANYLIST_REQUEST; // typeof CREATE_COMPANYLIST_REQUEST;
  payload: { companyList: CompanyModel };
}

// export const UPDATE_COMPANYLIST_REQUEST = '@companyList/UPDATE_COMPANYLIST_REQUEST';
interface UpdateCompanyListRequest {
  type: CompanyListTypes.UPDATE_COMPANYLIST_REQUEST;
  payload: { companyList: CompanyModel };
}
// export const DELETE_COMPANYLIST_REQUEST = '@companyList/DELETE_COMPANYLIST_REQUEST';
interface DeleteCompanyListRequest {
  type: CompanyListTypes.DELETE_COMPANYLIST_REQUEST;
  payload: { companyList: CompanyModel };
}

interface ClearCompanyListRequest {
  type: CompanyListTypes.CLEAR_COMPANYLIST_REQUEST;
  payload: { companyList: CompanyModel };
}

export type CompanyListActionsTypes =
  | LoadCompanyListRequest
  | CreateCompanyListRequest
  | UpdateCompanyListRequest
  | DeleteCompanyListRequest
  | ClearCompanyListRequest;
