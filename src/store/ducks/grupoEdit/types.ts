import { GrupoModel } from '../../../models/GrupoModel';

/*
 * actiontpes
 */
export enum GrupoEditTypes {
  CREATE_GRUPOEDIT_REQUEST = '@grupoEdit/CREATE_GRUPOEDIT_REQUEST',
  UPDATE_GRUPOEDIT_REQUEST = '@grupoEdit/UPDATE_GRUPOEDIT_REQUEST',
  DELETE_GRUPOEDIT_REQUEST = '@grupoEdit/DELETE_GRUPOEDIT_REQUEST',
  CLEAR_GRUPOEDIT_REQUEST = '@grupoEdit/CLEAR_GRUPOEDIT_REQUEST',
}

/*
 * state types
 */
export interface GrupoEditState {
  readonly data: GrupoModel;
}

// export const CREATE_GRUPOEDIT_REQUEST = '@grupoEdit/CREATE_GRUPOEDIT_REQUEST';
interface CreateGrupoEditRequest {
  type: GrupoEditTypes.CREATE_GRUPOEDIT_REQUEST; // typeof CREATE_GRUPOEDIT_REQUEST;
  payload: { grupoEdit: GrupoModel };
}

// export const UPDATE_GRUPOEDIT_REQUEST = '@grupoEdit/UPDATE_GRUPOEDIT_REQUEST';
interface UpdateGrupoEditRequest {
  type: GrupoEditTypes.UPDATE_GRUPOEDIT_REQUEST;
  payload: { grupoEdit: GrupoModel };
}
// export const DELETE_GRUPOEDIT_REQUEST = '@grupoEdit/DELETE_GRUPOEDIT_REQUEST';
interface DeleteGrupoEditRequest {
  type: GrupoEditTypes.DELETE_GRUPOEDIT_REQUEST;
  payload: { grupoEdit: GrupoModel };
}

interface ClearGrupoEditRequest {
  type: GrupoEditTypes.CLEAR_GRUPOEDIT_REQUEST;
  payload: { grupoEdit: GrupoModel };
}

export type GrupoEditActionsTypes =
  | CreateGrupoEditRequest
  | UpdateGrupoEditRequest
  | DeleteGrupoEditRequest
  | ClearGrupoEditRequest;
