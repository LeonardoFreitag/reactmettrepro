import { ConfigModel } from '../../../models/ConfigModel';
import { ConfigEditTypes, ConfigEditActionsTypes } from './types';

export function createConfigEdit(
  configEdit: ConfigModel,
): ConfigEditActionsTypes {
  return {
    type: ConfigEditTypes.CREATE_CONFIGEDIT_REQUEST,
    payload: { configEdit },
  };
}

export function updateConfigEdit(
  configEdit: ConfigModel,
): ConfigEditActionsTypes {
  return {
    type: ConfigEditTypes.UPDATE_CONFIGEDIT_REQUEST,
    payload: { configEdit },
  };
}

export function deleteConfigEdit(
  configEdit: ConfigModel,
): ConfigEditActionsTypes {
  return {
    type: ConfigEditTypes.DELETE_CONFIGEDIT_REQUEST,
    payload: { configEdit },
  };
}

export function clearConfigEdit(
  configEdit: ConfigModel,
): ConfigEditActionsTypes {
  return {
    type: ConfigEditTypes.CLEAR_CONFIGEDIT_REQUEST,
    payload: { configEdit },
  };
}
