import { SubgrupoModel } from '../../../models/SubgrupoModel';
import { SubgrupoListTypes, SubgrupoListActionsTypes } from './types';

export function loadSubgrupoList(
  subgrupoList: SubgrupoModel[],
): SubgrupoListActionsTypes {
  return {
    type: SubgrupoListTypes.LOAD_SUBGRUPOLIST_REQUEST,
    payload: { subgrupoList },
  };
}

export function createSubgrupoList(
  subgrupoList: SubgrupoModel,
): SubgrupoListActionsTypes {
  return {
    type: SubgrupoListTypes.CREATE_SUBGRUPOLIST_REQUEST,
    payload: { subgrupoList },
  };
}

export function updateSubgrupoList(
  subgrupoList: SubgrupoModel,
): SubgrupoListActionsTypes {
  return {
    type: SubgrupoListTypes.UPDATE_SUBGRUPOLIST_REQUEST,
    payload: { subgrupoList },
  };
}

export function deleteSubgrupoList(
  subgrupoList: SubgrupoModel,
): SubgrupoListActionsTypes {
  return {
    type: SubgrupoListTypes.DELETE_SUBGRUPOLIST_REQUEST,
    payload: { subgrupoList },
  };
}

export function clearSubgrupoList(
  subgrupoList: SubgrupoModel,
): SubgrupoListActionsTypes {
  return {
    type: SubgrupoListTypes.CLEAR_SUBGRUPOLIST_REQUEST,
    payload: { subgrupoList },
  };
}
