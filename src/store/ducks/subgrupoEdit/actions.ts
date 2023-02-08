import { SubgrupoModel } from '../../../models/SubgrupoModel';
import { SubgrupoEditTypes, SubgrupoEditActionsTypes } from './types';

export function createSubgrupoEdit(
  subgrupoEdit: SubgrupoModel,
): SubgrupoEditActionsTypes {
  return {
    type: SubgrupoEditTypes.CREATE_SUBGRUPOEDIT_REQUEST,
    payload: { subgrupoEdit },
  };
}

export function updateSubgrupoEdit(
  subgrupoEdit: SubgrupoModel,
): SubgrupoEditActionsTypes {
  return {
    type: SubgrupoEditTypes.UPDATE_SUBGRUPOEDIT_REQUEST,
    payload: { subgrupoEdit },
  };
}

export function deleteSubgrupoEdit(
  subgrupoEdit: SubgrupoModel,
): SubgrupoEditActionsTypes {
  return {
    type: SubgrupoEditTypes.DELETE_SUBGRUPOEDIT_REQUEST,
    payload: { subgrupoEdit },
  };
}

export function clearSubgrupoEdit(
  subgrupoEdit: SubgrupoModel,
): SubgrupoEditActionsTypes {
  return {
    type: SubgrupoEditTypes.CLEAR_SUBGRUPOEDIT_REQUEST,
    payload: { subgrupoEdit },
  };
}
