import { ItemModel } from '../../../models/ItemModel';

/*
 * actiontpes
 */
export enum FlavorEditTypes {
  CREATE_FLAVOREDIT_REQUEST = '@flavorEdit/CREATE_FLAVOREDIT_REQUEST',
  UPDATE_FLAVOREDIT_REQUEST = '@flavorEdit/UPDATE_FLAVOREDIT_REQUEST',
  DELETE_FLAVOREDIT_REQUEST = '@flavorEdit/DELETE_FLAVOREDIT_REQUEST',
  CLEAR_FLAVOREDIT_REQUEST = '@flavorEdit/CLEAR_FLAVOREDIT_REQUEST',
}

/*
 * state types
 */
export interface FlavorEditState {
  readonly data: ItemModel;
}

// export const CREATE_FLAVOREDIT_REQUEST = '@flavorEdit/CREATE_FLAVOREDIT_REQUEST';
interface CreateFlavorEditRequest {
  type: FlavorEditTypes.CREATE_FLAVOREDIT_REQUEST; // typeof CREATE_FLAVOREDIT_REQUEST;
  payload: { flavorEdit: ItemModel };
}

// export const UPDATE_FLAVOREDIT_REQUEST = '@flavorEdit/UPDATE_FLAVOREDIT_REQUEST';
interface UpdateFlavorEditRequest {
  type: FlavorEditTypes.UPDATE_FLAVOREDIT_REQUEST;
  payload: { flavorEdit: ItemModel };
}
// export const DELETE_FLAVOREDIT_REQUEST = '@flavorEdit/DELETE_FLAVOREDIT_REQUEST';
interface DeleteFlavorEditRequest {
  type: FlavorEditTypes.DELETE_FLAVOREDIT_REQUEST;
  payload: { flavorEdit: ItemModel };
}

interface ClearFlavorEditRequest {
  type: FlavorEditTypes.CLEAR_FLAVOREDIT_REQUEST;
  payload: { flavorEdit: ItemModel };
}

export type FlavorEditActionsTypes =
  | CreateFlavorEditRequest
  | UpdateFlavorEditRequest
  | DeleteFlavorEditRequest
  | ClearFlavorEditRequest;
