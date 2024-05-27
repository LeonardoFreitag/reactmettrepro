import { FlavorModel } from '../../../models/FlavorModel';

/*
 * actiontpes
 */
export enum FlavorListTypes {
  LOAD_FLAVORLIST_REQUEST = '@flavorList/LOAD_FLAVORLIST_REQUEST',
  CREATE_FLAVORLIST_REQUEST = '@flavorList/CREATE_FLAVORLIST_REQUEST',
  UPDATE_FLAVORLIST_REQUEST = '@flavorList/UPDATE_FLAVORLIST_REQUEST',
  DELETE_FLAVORLIST_REQUEST = '@flavorList/DELETE_FLAVORLIST_REQUEST',
  CLEAR_FLAVORLIST_REQUEST = '@flavorList/CLEAR_FLAVORLIST_REQUEST',
}

/*
 * state types
 */
export interface FlavorListState {
  readonly data: FlavorModel[];
}

// export const LOAD_FLAVORLIST_REQUEST = '@flavorList/LOAD_FLAVORLIST_REQUEST';
interface LoadFlavorListRequest {
  type: FlavorListTypes.LOAD_FLAVORLIST_REQUEST; // typeof LOAD_FLAVORLIST_REQUEST;
  payload: { flavorList: FlavorModel[] };
}

// export const CREATE_FLAVORLIST_REQUEST = '@flavorList/CREATE_FLAVORLIST_REQUEST';
interface CreateFlavorListRequest {
  type: FlavorListTypes.CREATE_FLAVORLIST_REQUEST; // typeof CREATE_FLAVORLIST_REQUEST;
  payload: { flavorList: FlavorModel };
}

// export const UPDATE_FLAVORLIST_REQUEST = '@flavorList/UPDATE_FLAVORLIST_REQUEST';
interface UpdateFlavorListRequest {
  type: FlavorListTypes.UPDATE_FLAVORLIST_REQUEST;
  payload: { flavorList: FlavorModel };
}
// export const DELETE_FLAVORLIST_REQUEST = '@flavorList/DELETE_FLAVORLIST_REQUEST';
interface DeleteFlavorListRequest {
  type: FlavorListTypes.DELETE_FLAVORLIST_REQUEST;
  payload: { flavorList: FlavorModel };
}

interface ClearFlavorListRequest {
  type: FlavorListTypes.CLEAR_FLAVORLIST_REQUEST;
  payload: { flavorList: FlavorModel };
}

export type FlavorListActionsTypes =
  | LoadFlavorListRequest
  | CreateFlavorListRequest
  | UpdateFlavorListRequest
  | DeleteFlavorListRequest
  | ClearFlavorListRequest;
