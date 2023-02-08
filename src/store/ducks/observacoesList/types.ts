import { ObservacoesModel } from '../../../models/ObservacoesModel';

/*
 * actiontpes
 */
export enum ObservacoesListTypes {
  LOAD_OBSERVACOESLIST_REQUEST = '@observacoesList/LOAD_OBSERVACOESLIST_REQUEST',
  CREATE_OBSERVACOESLIST_REQUEST = '@observacoesList/CREATE_OBSERVACOESLIST_REQUEST',
  UPDATE_OBSERVACOESLIST_REQUEST = '@observacoesList/UPDATE_OBSERVACOESLIST_REQUEST',
  DELETE_OBSERVACOESLIST_REQUEST = '@observacoesList/DELETE_OBSERVACOESLIST_REQUEST',
  CLEAR_OBSERVACOESLIST_REQUEST = '@observacoesList/CLEAR_OBSERVACOESLIST_REQUEST',
}

/*
 * state types
 */
export interface ObservacoesListState {
  readonly data: ObservacoesModel[];
}

// export const LOAD_OBSERVACOESLIST_REQUEST = '@observacoesList/LOAD_OBSERVACOESLIST_REQUEST';
interface LoadObservacoesListRequest {
  type: ObservacoesListTypes.LOAD_OBSERVACOESLIST_REQUEST; // typeof LOAD_OBSERVACOESLIST_REQUEST;
  payload: { observacoesList: ObservacoesModel[] };
}

// export const CREATE_OBSERVACOESLIST_REQUEST = '@observacoesList/CREATE_OBSERVACOESLIST_REQUEST';
interface CreateObservacoesListRequest {
  type: ObservacoesListTypes.CREATE_OBSERVACOESLIST_REQUEST; // typeof CREATE_OBSERVACOESLIST_REQUEST;
  payload: { observacoesList: ObservacoesModel };
}

// export const UPDATE_OBSERVACOESLIST_REQUEST = '@observacoesList/UPDATE_OBSERVACOESLIST_REQUEST';
interface UpdateObservacoesListRequest {
  type: ObservacoesListTypes.UPDATE_OBSERVACOESLIST_REQUEST;
  payload: { observacoesList: ObservacoesModel };
}
// export const DELETE_OBSERVACOESLIST_REQUEST = '@observacoesList/DELETE_OBSERVACOESLIST_REQUEST';
interface DeleteObservacoesListRequest {
  type: ObservacoesListTypes.DELETE_OBSERVACOESLIST_REQUEST;
  payload: { observacoesList: ObservacoesModel };
}

interface ClearObservacoesListRequest {
  type: ObservacoesListTypes.CLEAR_OBSERVACOESLIST_REQUEST;
  payload: { observacoesList: ObservacoesModel };
}

export type ObservacoesListActionsTypes =
  | LoadObservacoesListRequest
  | CreateObservacoesListRequest
  | UpdateObservacoesListRequest
  | DeleteObservacoesListRequest
  | ClearObservacoesListRequest;
