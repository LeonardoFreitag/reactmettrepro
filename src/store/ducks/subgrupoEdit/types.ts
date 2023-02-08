import { SubgrupoModel } from '../../../models/SubgrupoModel';

/*
 * actiontpes
 */
export enum SubgrupoEditTypes {
  CREATE_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/CREATE_SUBGRUPOEDIT_REQUEST',
  UPDATE_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/UPDATE_SUBGRUPOEDIT_REQUEST',
  DELETE_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/DELETE_SUBGRUPOEDIT_REQUEST',
  CLEAR_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/CLEAR_SUBGRUPOEDIT_REQUEST',
}

/*
 * state types
 */
export interface SubgrupoEditState {
  readonly data: SubgrupoModel;
}

// export const CREATE_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/CREATE_SUBGRUPOEDIT_REQUEST';
interface CreateSubgrupoEditRequest {
  type: SubgrupoEditTypes.CREATE_SUBGRUPOEDIT_REQUEST; // typeof CREATE_SUBGRUPOEDIT_REQUEST;
  payload: { subgrupoEdit: SubgrupoModel };
}

// export const UPDATE_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/UPDATE_SUBGRUPOEDIT_REQUEST';
interface UpdateSubgrupoEditRequest {
  type: SubgrupoEditTypes.UPDATE_SUBGRUPOEDIT_REQUEST;
  payload: { subgrupoEdit: SubgrupoModel };
}
// export const DELETE_SUBGRUPOEDIT_REQUEST = '@subgrupoEdit/DELETE_SUBGRUPOEDIT_REQUEST';
interface DeleteSubgrupoEditRequest {
  type: SubgrupoEditTypes.DELETE_SUBGRUPOEDIT_REQUEST;
  payload: { subgrupoEdit: SubgrupoModel };
}

interface ClearSubgrupoEditRequest {
  type: SubgrupoEditTypes.CLEAR_SUBGRUPOEDIT_REQUEST;
  payload: { subgrupoEdit: SubgrupoModel };
}

export type SubgrupoEditActionsTypes =
  | CreateSubgrupoEditRequest
  | UpdateSubgrupoEditRequest
  | DeleteSubgrupoEditRequest
  | ClearSubgrupoEditRequest;
