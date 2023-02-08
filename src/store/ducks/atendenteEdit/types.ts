import { AtendenteModel } from '../../../models/AtendenteModel';

/*
 * actiontpes
 */
export enum AtendenteEditTypes {
  CREATE_ATENDENTEEDIT_REQUEST = '@atendenteEdit/CREATE_ATENDENTEEDIT_REQUEST',
  UPDATE_ATENDENTEEDIT_REQUEST = '@atendenteEdit/UPDATE_ATENDENTEEDIT_REQUEST',
  DELETE_ATENDENTEEDIT_REQUEST = '@atendenteEdit/DELETE_ATENDENTEEDIT_REQUEST',
  CLEAR_ATENDENTEEDIT_REQUEST = '@atendenteEdit/CLEAR_ATENDENTEEDIT_REQUEST',
}

/*
 * state types
 */
export interface AtendenteEditState {
  readonly data: AtendenteModel;
}

// export const CREATE_ATENDENTEEDIT_REQUEST = '@atendenteEdit/CREATE_ATENDENTEEDIT_REQUEST';
interface CreateAtendenteEditRequest {
  type: AtendenteEditTypes.CREATE_ATENDENTEEDIT_REQUEST; // typeof CREATE_ATENDENTEEDIT_REQUEST;
  payload: { atendenteEdit: AtendenteModel };
}

// export const UPDATE_ATENDENTEEDIT_REQUEST = '@atendenteEdit/UPDATE_ATENDENTEEDIT_REQUEST';
interface UpdateAtendenteEditRequest {
  type: AtendenteEditTypes.UPDATE_ATENDENTEEDIT_REQUEST;
  payload: { atendenteEdit: AtendenteModel };
}
// export const DELETE_ATENDENTEEDIT_REQUEST = '@atendenteEdit/DELETE_ATENDENTEEDIT_REQUEST';
interface DeleteAtendenteEditRequest {
  type: AtendenteEditTypes.DELETE_ATENDENTEEDIT_REQUEST;
  payload: { atendenteEdit: AtendenteModel };
}

interface ClearAtendenteEditRequest {
  type: AtendenteEditTypes.CLEAR_ATENDENTEEDIT_REQUEST;
  payload: { atendenteEdit: AtendenteModel };
}

export type AtendenteEditActionsTypes =
  | CreateAtendenteEditRequest
  | UpdateAtendenteEditRequest
  | DeleteAtendenteEditRequest
  | ClearAtendenteEditRequest;
