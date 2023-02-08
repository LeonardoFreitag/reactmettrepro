import { AtendenteModel } from '../../../models/AtendenteModel';

/*
 * actiontpes
 */
export enum AtendenteListTypes {
  LOAD_ATENDENTELIST_REQUEST = '@atendenteList/LOAD_ATENDENTELIST_REQUEST',
  CREATE_ATENDENTELIST_REQUEST = '@atendenteList/CREATE_ATENDENTELIST_REQUEST',
  UPDATE_ATENDENTELIST_REQUEST = '@atendenteList/UPDATE_ATENDENTELIST_REQUEST',
  DELETE_ATENDENTELIST_REQUEST = '@atendenteList/DELETE_ATENDENTELIST_REQUEST',
  CLEAR_ATENDENTELIST_REQUEST = '@atendenteList/CLEAR_ATENDENTELIST_REQUEST',
}

/*
 * state types
 */
export interface AtendenteListState {
  readonly data: AtendenteModel[];
}

// export const LOAD_ATENDENTELIST_REQUEST = '@atendenteList/LOAD_ATENDENTELIST_REQUEST';
interface LoadAtendenteListRequest {
  type: AtendenteListTypes.LOAD_ATENDENTELIST_REQUEST; // typeof LOAD_ATENDENTELIST_REQUEST;
  payload: { atendenteList: AtendenteModel[] };
}

// export const CREATE_ATENDENTELIST_REQUEST = '@atendenteList/CREATE_ATENDENTELIST_REQUEST';
interface CreateAtendenteListRequest {
  type: AtendenteListTypes.CREATE_ATENDENTELIST_REQUEST; // typeof CREATE_ATENDENTELIST_REQUEST;
  payload: { atendenteList: AtendenteModel };
}

// export const UPDATE_ATENDENTELIST_REQUEST = '@atendenteList/UPDATE_ATENDENTELIST_REQUEST';
interface UpdateAtendenteListRequest {
  type: AtendenteListTypes.UPDATE_ATENDENTELIST_REQUEST;
  payload: { atendenteList: AtendenteModel };
}
// export const DELETE_ATENDENTELIST_REQUEST = '@atendenteList/DELETE_ATENDENTELIST_REQUEST';
interface DeleteAtendenteListRequest {
  type: AtendenteListTypes.DELETE_ATENDENTELIST_REQUEST;
  payload: { atendenteList: AtendenteModel };
}

interface ClearAtendenteListRequest {
  type: AtendenteListTypes.CLEAR_ATENDENTELIST_REQUEST;
  payload: { atendenteList: AtendenteModel };
}

export type AtendenteListActionsTypes =
  | LoadAtendenteListRequest
  | CreateAtendenteListRequest
  | UpdateAtendenteListRequest
  | DeleteAtendenteListRequest
  | ClearAtendenteListRequest;
