import { ObservacoesModel } from '../../../models/ObservacoesModel';

/*
 * actiontpes
 */
export enum ObservacoesEditTypes {
  CREATE_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/CREATE_OBSERVACOESEDIT_REQUEST',
  UPDATE_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/UPDATE_OBSERVACOESEDIT_REQUEST',
  DELETE_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/DELETE_OBSERVACOESEDIT_REQUEST',
  CLEAR_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/CLEAR_OBSERVACOESEDIT_REQUEST',
}

/*
 * state types
 */
export interface ObservacoesEditState {
  readonly data: ObservacoesModel;
}

// export const CREATE_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/CREATE_OBSERVACOESEDIT_REQUEST';
interface CreateObservacoesEditRequest {
  type: ObservacoesEditTypes.CREATE_OBSERVACOESEDIT_REQUEST; // typeof CREATE_OBSERVACOESEDIT_REQUEST;
  payload: { observacoesEdit: ObservacoesModel };
}

// export const UPDATE_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/UPDATE_OBSERVACOESEDIT_REQUEST';
interface UpdateObservacoesEditRequest {
  type: ObservacoesEditTypes.UPDATE_OBSERVACOESEDIT_REQUEST;
  payload: { observacoesEdit: ObservacoesModel };
}
// export const DELETE_OBSERVACOESEDIT_REQUEST = '@observacoesEdit/DELETE_OBSERVACOESEDIT_REQUEST';
interface DeleteObservacoesEditRequest {
  type: ObservacoesEditTypes.DELETE_OBSERVACOESEDIT_REQUEST;
  payload: { observacoesEdit: ObservacoesModel };
}

interface ClearObservacoesEditRequest {
  type: ObservacoesEditTypes.CLEAR_OBSERVACOESEDIT_REQUEST;
  payload: { observacoesEdit: ObservacoesModel };
}

export type ObservacoesEditActionsTypes =
  | CreateObservacoesEditRequest
  | UpdateObservacoesEditRequest
  | DeleteObservacoesEditRequest
  | ClearObservacoesEditRequest;
