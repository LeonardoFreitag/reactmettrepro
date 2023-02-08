import { GrupoModel } from '../../../models/GrupoModel';

/*
 * actiontpes
 */
export enum GrupoListTypes {
  LOAD_GRUPOLIST_REQUEST = '@grupoList/LOAD_GRUPOLIST_REQUEST',
  CREATE_GRUPOLIST_REQUEST = '@grupoList/CREATE_GRUPOLIST_REQUEST',
  UPDATE_GRUPOLIST_REQUEST = '@grupoList/UPDATE_GRUPOLIST_REQUEST',
  DELETE_GRUPOLIST_REQUEST = '@grupoList/DELETE_GRUPOLIST_REQUEST',
  CLEAR_GRUPOLIST_REQUEST = '@grupoList/CLEAR_GRUPOLIST_REQUEST',
}

/*
 * state types
 */
export interface GrupoListState {
  readonly data: GrupoModel[];
}

// export const LOAD_GRUPOLIST_REQUEST = '@grupoList/LOAD_GRUPOLIST_REQUEST';
interface LoadGrupoListRequest {
  type: GrupoListTypes.LOAD_GRUPOLIST_REQUEST; // typeof LOAD_GRUPOLIST_REQUEST;
  payload: { grupoList: GrupoModel[] };
}

// export const CREATE_GRUPOLIST_REQUEST = '@grupoList/CREATE_GRUPOLIST_REQUEST';
interface CreateGrupoListRequest {
  type: GrupoListTypes.CREATE_GRUPOLIST_REQUEST; // typeof CREATE_GRUPOLIST_REQUEST;
  payload: { grupoList: GrupoModel };
}

// export const UPDATE_GRUPOLIST_REQUEST = '@grupoList/UPDATE_GRUPOLIST_REQUEST';
interface UpdateGrupoListRequest {
  type: GrupoListTypes.UPDATE_GRUPOLIST_REQUEST;
  payload: { grupoList: GrupoModel };
}
// export const DELETE_GRUPOLIST_REQUEST = '@grupoList/DELETE_GRUPOLIST_REQUEST';
interface DeleteGrupoListRequest {
  type: GrupoListTypes.DELETE_GRUPOLIST_REQUEST;
  payload: { grupoList: GrupoModel };
}

interface ClearGrupoListRequest {
  type: GrupoListTypes.CLEAR_GRUPOLIST_REQUEST;
  payload: { grupoList: GrupoModel };
}

export type GrupoListActionsTypes =
  | LoadGrupoListRequest
  | CreateGrupoListRequest
  | UpdateGrupoListRequest
  | DeleteGrupoListRequest
  | ClearGrupoListRequest;
