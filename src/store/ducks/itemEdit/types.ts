import { ItemModel } from '../../../models/ItemModel';

/*
 * actiontpes
 */
export enum ItemEditTypes {
  CREATE_ITEMEDIT_REQUEST = '@itemEdit/CREATE_ITEMEDIT_REQUEST',
  UPDATE_ITEMEDIT_REQUEST = '@itemEdit/UPDATE_ITEMEDIT_REQUEST',
  DELETE_ITEMEDIT_REQUEST = '@itemEdit/DELETE_ITEMEDIT_REQUEST',
  CLEAR_ITEMEDIT_REQUEST = '@itemEdit/CLEAR_ITEMEDIT_REQUEST',
}

/*
 * state types
 */
export interface ItemEditState {
  readonly data: ItemModel;
}

// export const CREATE_ITEMEDIT_REQUEST = '@itemEdit/CREATE_ITEMEDIT_REQUEST';
interface CreateItemEditRequest {
  type: ItemEditTypes.CREATE_ITEMEDIT_REQUEST; // typeof CREATE_ITEMEDIT_REQUEST;
  payload: { itemEdit: ItemModel };
}

// export const UPDATE_ITEMEDIT_REQUEST = '@itemEdit/UPDATE_ITEMEDIT_REQUEST';
interface UpdateItemEditRequest {
  type: ItemEditTypes.UPDATE_ITEMEDIT_REQUEST;
  payload: { itemEdit: ItemModel };
}
// export const DELETE_ITEMEDIT_REQUEST = '@itemEdit/DELETE_ITEMEDIT_REQUEST';
interface DeleteItemEditRequest {
  type: ItemEditTypes.DELETE_ITEMEDIT_REQUEST;
  payload: { itemEdit: ItemModel };
}

interface ClearItemEditRequest {
  type: ItemEditTypes.CLEAR_ITEMEDIT_REQUEST;
  payload: { itemEdit: ItemModel };
}

export type ItemEditActionsTypes =
  | CreateItemEditRequest
  | UpdateItemEditRequest
  | DeleteItemEditRequest
  | ClearItemEditRequest;
