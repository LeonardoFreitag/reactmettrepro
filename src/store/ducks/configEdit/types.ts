import { ConfigModel } from '../../../models/ConfigModel';

/*
 * actiontpes
 */
export enum ConfigEditTypes {
  CREATE_CONFIGEDIT_REQUEST = '@configEdit/CREATE_CONFIGEDIT_REQUEST',
  UPDATE_CONFIGEDIT_REQUEST = '@configEdit/UPDATE_CONFIGEDIT_REQUEST',
  DELETE_CONFIGEDIT_REQUEST = '@configEdit/DELETE_CONFIGEDIT_REQUEST',
  CLEAR_CONFIGEDIT_REQUEST = '@configEdit/CLEAR_CONFIGEDIT_REQUEST',
}

/*
 * state types
 */
export interface ConfigEditState {
  readonly data: ConfigModel;
}

// export const CREATE_CONFIGEDIT_REQUEST = '@configEdit/CREATE_CONFIGEDIT_REQUEST';
interface CreateConfigEditRequest {
  type: ConfigEditTypes.CREATE_CONFIGEDIT_REQUEST; // typeof CREATE_CONFIGEDIT_REQUEST;
  payload: { configEdit: ConfigModel };
}

// export const UPDATE_CONFIGEDIT_REQUEST = '@configEdit/UPDATE_CONFIGEDIT_REQUEST';
interface UpdateConfigEditRequest {
  type: ConfigEditTypes.UPDATE_CONFIGEDIT_REQUEST;
  payload: { configEdit: ConfigModel };
}
// export const DELETE_CONFIGEDIT_REQUEST = '@configEdit/DELETE_CONFIGEDIT_REQUEST';
interface DeleteConfigEditRequest {
  type: ConfigEditTypes.DELETE_CONFIGEDIT_REQUEST;
  payload: { configEdit: ConfigModel };
}

interface ClearConfigEditRequest {
  type: ConfigEditTypes.CLEAR_CONFIGEDIT_REQUEST;
  payload: { configEdit: ConfigModel };
}

export type ConfigEditActionsTypes =
  | CreateConfigEditRequest
  | UpdateConfigEditRequest
  | DeleteConfigEditRequest
  | ClearConfigEditRequest;
