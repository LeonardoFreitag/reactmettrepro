import { FlavorModel } from '../../../models/FlavorModel';

/*
 * actiontpes
 */
export enum FlavorsSelectedTypes {
  LOAD_FLAVORSSELECTED_REQUEST = '@flavorsSelected/LOAD_FLAVORSSELECTED_REQUEST',
  CREATE_FLAVORSSELECTED_REQUEST = '@flavorsSelected/CREATE_FLAVORSSELECTED_REQUEST',
  UPDATE_FLAVORSSELECTED_REQUEST = '@flavorsSelected/UPDATE_FLAVORSSELECTED_REQUEST',
  DELETE_FLAVORSSELECTED_REQUEST = '@flavorsSelected/DELETE_FLAVORSSELECTED_REQUEST',
  CLEAR_FLAVORSSELECTED_REQUEST = '@flavorsSelected/CLEAR_FLAVORSSELECTED_REQUEST',
}

/*
 * state types
 */
export interface FlavorsSelectedState {
  readonly data: FlavorModel[];
}

// export const LOAD_FLAVORSSELECTED_REQUEST = '@flavorsSelected/LOAD_FLAVORSSELECTED_REQUEST';
interface LoadFlavorsSelectedRequest {
  type: FlavorsSelectedTypes.LOAD_FLAVORSSELECTED_REQUEST; // typeof LOAD_FLAVORSSELECTED_REQUEST;
  payload: { flavorsSelected: FlavorModel[] };
}

// export const CREATE_FLAVORSSELECTED_REQUEST = '@flavorsSelected/CREATE_FLAVORSSELECTED_REQUEST';
interface CreateFlavorsSelectedRequest {
  type: FlavorsSelectedTypes.CREATE_FLAVORSSELECTED_REQUEST; // typeof CREATE_FLAVORSSELECTED_REQUEST;
  payload: { flavorsSelected: FlavorModel };
}

// export const UPDATE_FLAVORSSELECTED_REQUEST = '@flavorsSelected/UPDATE_FLAVORSSELECTED_REQUEST';
interface UpdateFlavorsSelectedRequest {
  type: FlavorsSelectedTypes.UPDATE_FLAVORSSELECTED_REQUEST;
  payload: { flavorsSelected: FlavorModel };
}
// export const DELETE_FLAVORSSELECTED_REQUEST = '@flavorsSelected/DELETE_FLAVORSSELECTED_REQUEST';
interface DeleteFlavorsSelectedRequest {
  type: FlavorsSelectedTypes.DELETE_FLAVORSSELECTED_REQUEST;
  payload: { flavorsSelected: FlavorModel };
}

interface ClearFlavorsSelectedRequest {
  type: FlavorsSelectedTypes.CLEAR_FLAVORSSELECTED_REQUEST;
  payload: { flavorsSelected: FlavorModel };
}

export type FlavorsSelectedActionsTypes =
  | LoadFlavorsSelectedRequest
  | CreateFlavorsSelectedRequest
  | UpdateFlavorsSelectedRequest
  | DeleteFlavorsSelectedRequest
  | ClearFlavorsSelectedRequest;
