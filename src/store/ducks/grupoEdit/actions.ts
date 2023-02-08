import { GrupoModel } from '../../../models/GrupoModel';
import { GrupoEditTypes, GrupoEditActionsTypes } from './types';

export function createGrupoEdit(grupoEdit: GrupoModel): GrupoEditActionsTypes {
  return {
    type: GrupoEditTypes.CREATE_GRUPOEDIT_REQUEST,
    payload: { grupoEdit },
  };
}

export function updateGrupoEdit(grupoEdit: GrupoModel): GrupoEditActionsTypes {
  return {
    type: GrupoEditTypes.UPDATE_GRUPOEDIT_REQUEST,
    payload: { grupoEdit },
  };
}

export function deleteGrupoEdit(grupoEdit: GrupoModel): GrupoEditActionsTypes {
  return {
    type: GrupoEditTypes.DELETE_GRUPOEDIT_REQUEST,
    payload: { grupoEdit },
  };
}

export function clearGrupoEdit(grupoEdit: GrupoModel): GrupoEditActionsTypes {
  return {
    type: GrupoEditTypes.CLEAR_GRUPOEDIT_REQUEST,
    payload: { grupoEdit },
  };
}
