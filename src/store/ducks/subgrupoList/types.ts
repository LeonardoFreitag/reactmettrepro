import { SubgrupoModel } from '../../../models/SubgrupoModel';

/*
 * actiontpes
 */
export enum SubgrupoListTypes {
  LOAD_SUBGRUPOLIST_REQUEST = '@subgrupoList/LOAD_SUBGRUPOLIST_REQUEST',
  CREATE_SUBGRUPOLIST_REQUEST = '@subgrupoList/CREATE_SUBGRUPOLIST_REQUEST',
  UPDATE_SUBGRUPOLIST_REQUEST = '@subgrupoList/UPDATE_SUBGRUPOLIST_REQUEST',
  DELETE_SUBGRUPOLIST_REQUEST = '@subgrupoList/DELETE_SUBGRUPOLIST_REQUEST',
  CLEAR_SUBGRUPOLIST_REQUEST = '@subgrupoList/CLEAR_SUBGRUPOLIST_REQUEST',
}

/*
 * state types
 */
export interface SubgrupoListState {
  readonly data: SubgrupoModel[];
}

// export const LOAD_SUBGRUPOLIST_REQUEST = '@subgrupoList/LOAD_SUBGRUPOLIST_REQUEST';
interface LoadSubgrupoListRequest {
  type: SubgrupoListTypes.LOAD_SUBGRUPOLIST_REQUEST; // typeof LOAD_SUBGRUPOLIST_REQUEST;
  payload: { subgrupoList: SubgrupoModel[] };
}

// export const CREATE_SUBGRUPOLIST_REQUEST = '@subgrupoList/CREATE_SUBGRUPOLIST_REQUEST';
interface CreateSubgrupoListRequest {
  type: SubgrupoListTypes.CREATE_SUBGRUPOLIST_REQUEST; // typeof CREATE_SUBGRUPOLIST_REQUEST;
  payload: { subgrupoList: SubgrupoModel };
}

// export const UPDATE_SUBGRUPOLIST_REQUEST = '@subgrupoList/UPDATE_SUBGRUPOLIST_REQUEST';
interface UpdateSubgrupoListRequest {
  type: SubgrupoListTypes.UPDATE_SUBGRUPOLIST_REQUEST;
  payload: { subgrupoList: SubgrupoModel };
}
// export const DELETE_SUBGRUPOLIST_REQUEST = '@subgrupoList/DELETE_SUBGRUPOLIST_REQUEST';
interface DeleteSubgrupoListRequest {
  type: SubgrupoListTypes.DELETE_SUBGRUPOLIST_REQUEST;
  payload: { subgrupoList: SubgrupoModel };
}

interface ClearSubgrupoListRequest {
  type: SubgrupoListTypes.CLEAR_SUBGRUPOLIST_REQUEST;
  payload: { subgrupoList: SubgrupoModel };
}

export type SubgrupoListActionsTypes =
  | LoadSubgrupoListRequest
  | CreateSubgrupoListRequest
  | UpdateSubgrupoListRequest
  | DeleteSubgrupoListRequest
  | ClearSubgrupoListRequest;
