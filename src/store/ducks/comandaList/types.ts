import { ComandaModel } from '../../../models/ComandaModel';

/*
 * actiontpes
 */
export enum ComandaListTypes {
  LOAD_COMANDALIST_REQUEST = '@comandaList/LOAD_COMANDALIST_REQUEST',
  CREATE_COMANDALIST_REQUEST = '@comandaList/CREATE_COMANDALIST_REQUEST',
  UPDATE_COMANDALIST_REQUEST = '@comandaList/UPDATE_COMANDALIST_REQUEST',
  DELETE_COMANDALIST_REQUEST = '@comandaList/DELETE_COMANDALIST_REQUEST',
  CLEAR_COMANDALIST_REQUEST = '@comandaList/CLEAR_COMANDALIST_REQUEST',
}

/*
 * state types
 */
export interface ComandaListState {
  readonly data: ComandaModel[];
}

// export const LOAD_COMANDALIST_REQUEST = '@comandaList/LOAD_COMANDALIST_REQUEST';
interface LoadComandaListRequest {
  type: ComandaListTypes.LOAD_COMANDALIST_REQUEST; // typeof LOAD_COMANDALIST_REQUEST;
  payload: { comandaList: ComandaModel[] };
}

// export const CREATE_COMANDALIST_REQUEST = '@comandaList/CREATE_COMANDALIST_REQUEST';
interface CreateComandaListRequest {
  type: ComandaListTypes.CREATE_COMANDALIST_REQUEST; // typeof CREATE_COMANDALIST_REQUEST;
  payload: { comandaList: ComandaModel };
}

// export const UPDATE_COMANDALIST_REQUEST = '@comandaList/UPDATE_COMANDALIST_REQUEST';
interface UpdateComandaListRequest {
  type: ComandaListTypes.UPDATE_COMANDALIST_REQUEST;
  payload: { comandaList: ComandaModel };
}
// export const DELETE_COMANDALIST_REQUEST = '@comandaList/DELETE_COMANDALIST_REQUEST';
interface DeleteComandaListRequest {
  type: ComandaListTypes.DELETE_COMANDALIST_REQUEST;
  payload: { comandaList: ComandaModel };
}

interface ClearComandaListRequest {
  type: ComandaListTypes.CLEAR_COMANDALIST_REQUEST;
  payload: { comandaList: ComandaModel };
}

export type ComandaListActionsTypes =
  | LoadComandaListRequest
  | CreateComandaListRequest
  | UpdateComandaListRequest
  | DeleteComandaListRequest
  | ClearComandaListRequest;
