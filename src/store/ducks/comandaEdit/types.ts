import { ComandaModel } from '../../../models/ComandaModel';

/*
 * actiontpes
 */
export enum ComandaEditTypes {
  CREATE_COMANDAEDIT_REQUEST = '@comandaEdit/CREATE_COMANDAEDIT_REQUEST',
  UPDATE_COMANDAEDIT_REQUEST = '@comandaEdit/UPDATE_COMANDAEDIT_REQUEST',
  DELETE_COMANDAEDIT_REQUEST = '@comandaEdit/DELETE_COMANDAEDIT_REQUEST',
  CLEAR_COMANDAEDIT_REQUEST = '@comandaEdit/CLEAR_COMANDAEDIT_REQUEST',
}

/*
 * state types
 */
export interface ComandaEditState {
  readonly data: ComandaModel;
}

// export const CREATE_COMANDAEDIT_REQUEST = '@comandaEdit/CREATE_COMANDAEDIT_REQUEST';
interface CreateComandaEditRequest {
  type: ComandaEditTypes.CREATE_COMANDAEDIT_REQUEST; // typeof CREATE_COMANDAEDIT_REQUEST;
  payload: { comandaEdit: ComandaModel };
}

// export const UPDATE_COMANDAEDIT_REQUEST = '@comandaEdit/UPDATE_COMANDAEDIT_REQUEST';
interface UpdateComandaEditRequest {
  type: ComandaEditTypes.UPDATE_COMANDAEDIT_REQUEST;
  payload: { comandaEdit: ComandaModel };
}
// export const DELETE_COMANDAEDIT_REQUEST = '@comandaEdit/DELETE_COMANDAEDIT_REQUEST';
interface DeleteComandaEditRequest {
  type: ComandaEditTypes.DELETE_COMANDAEDIT_REQUEST;
  payload: { comandaEdit: ComandaModel };
}

interface ClearComandaEditRequest {
  type: ComandaEditTypes.CLEAR_COMANDAEDIT_REQUEST;
  payload: { comandaEdit: ComandaModel };
}

export type ComandaEditActionsTypes =
  | CreateComandaEditRequest
  | UpdateComandaEditRequest
  | DeleteComandaEditRequest
  | ClearComandaEditRequest;
