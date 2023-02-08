import { ComandaModel } from '../../../models/ComandaModel';
import { ComandaEditTypes, ComandaEditActionsTypes } from './types';

export function createComandaEdit(
  comandaEdit: ComandaModel,
): ComandaEditActionsTypes {
  return {
    type: ComandaEditTypes.CREATE_COMANDAEDIT_REQUEST,
    payload: { comandaEdit },
  };
}

export function updateComandaEdit(
  comandaEdit: ComandaModel,
): ComandaEditActionsTypes {
  return {
    type: ComandaEditTypes.UPDATE_COMANDAEDIT_REQUEST,
    payload: { comandaEdit },
  };
}

export function deleteComandaEdit(
  comandaEdit: ComandaModel,
): ComandaEditActionsTypes {
  return {
    type: ComandaEditTypes.DELETE_COMANDAEDIT_REQUEST,
    payload: { comandaEdit },
  };
}

export function clearComandaEdit(
  comandaEdit: ComandaModel,
): ComandaEditActionsTypes {
  return {
    type: ComandaEditTypes.CLEAR_COMANDAEDIT_REQUEST,
    payload: { comandaEdit },
  };
}
