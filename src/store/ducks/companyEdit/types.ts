import { CompanyModel } from '../../../models/CompanyModel';

/*
 * actiontpes
 */
export enum CompanyEditTypes {
  CREATE_COMPANYEDIT_REQUEST = '@companyEdit/CREATE_COMPANYEDIT_REQUEST',
  UPDATE_COMPANYEDIT_REQUEST = '@companyEdit/UPDATE_COMPANYEDIT_REQUEST',
  DELETE_COMPANYEDIT_REQUEST = '@companyEdit/DELETE_COMPANYEDIT_REQUEST',
  CLEAR_COMPANYEDIT_REQUEST = '@companyEdit/CLEAR_COMPANYEDIT_REQUEST',
}

/*
 * state types
 */
export interface CompanyEditState {
  readonly data: CompanyModel;
}

// export const CREATE_COMPANYEDIT_REQUEST = '@companyEdit/CREATE_COMPANYEDIT_REQUEST';
interface CreateCompanyEditRequest {
  type: CompanyEditTypes.CREATE_COMPANYEDIT_REQUEST; // typeof CREATE_COMPANYEDIT_REQUEST;
  payload: { companyEdit: CompanyModel };
}

// export const UPDATE_COMPANYEDIT_REQUEST = '@companyEdit/UPDATE_COMPANYEDIT_REQUEST';
interface UpdateCompanyEditRequest {
  type: CompanyEditTypes.UPDATE_COMPANYEDIT_REQUEST;
  payload: { companyEdit: CompanyModel };
}
// export const DELETE_COMPANYEDIT_REQUEST = '@companyEdit/DELETE_COMPANYEDIT_REQUEST';
interface DeleteCompanyEditRequest {
  type: CompanyEditTypes.DELETE_COMPANYEDIT_REQUEST;
  payload: { companyEdit: CompanyModel };
}

interface ClearCompanyEditRequest {
  type: CompanyEditTypes.CLEAR_COMPANYEDIT_REQUEST;
  payload: { companyEdit: CompanyModel };
}

export type CompanyEditActionsTypes =
  | CreateCompanyEditRequest
  | UpdateCompanyEditRequest
  | DeleteCompanyEditRequest
  | ClearCompanyEditRequest;
