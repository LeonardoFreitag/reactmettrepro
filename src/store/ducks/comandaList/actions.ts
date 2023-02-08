import { ComandaModel } from '../../../models/ComandaModel';
import { ComandaListTypes, ComandaListActionsTypes } from './types';

export function loadComandaList(
  comandaList: ComandaModel[],
): ComandaListActionsTypes {
  return {
    type: ComandaListTypes.LOAD_COMANDALIST_REQUEST,
    payload: { comandaList },
  };
}

export function createComandaList(
  comandaList: ComandaModel,
): ComandaListActionsTypes {
  return {
    type: ComandaListTypes.CREATE_COMANDALIST_REQUEST,
    payload: { comandaList },
  };
}

export function updateComandaList(
  comandaList: ComandaModel,
): ComandaListActionsTypes {
  return {
    type: ComandaListTypes.UPDATE_COMANDALIST_REQUEST,
    payload: { comandaList },
  };
}

export function deleteComandaList(
  comandaList: ComandaModel,
): ComandaListActionsTypes {
  return {
    type: ComandaListTypes.DELETE_COMANDALIST_REQUEST,
    payload: { comandaList },
  };
}

export function clearComandaList(
  comandaList: ComandaModel,
): ComandaListActionsTypes {
  return {
    type: ComandaListTypes.CLEAR_COMANDALIST_REQUEST,
    payload: { comandaList },
  };
}
