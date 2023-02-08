import { GrupoModel } from '../../../models/GrupoModel';
import { GrupoListTypes, GrupoListActionsTypes } from './types';

export function loadGrupoList(grupoList: GrupoModel[]): GrupoListActionsTypes {
  return {
    type: GrupoListTypes.LOAD_GRUPOLIST_REQUEST,
    payload: { grupoList },
  };
}

export function createGrupoList(grupoList: GrupoModel): GrupoListActionsTypes {
  return {
    type: GrupoListTypes.CREATE_GRUPOLIST_REQUEST,
    payload: { grupoList },
  };
}

export function updateGrupoList(grupoList: GrupoModel): GrupoListActionsTypes {
  return {
    type: GrupoListTypes.UPDATE_GRUPOLIST_REQUEST,
    payload: { grupoList },
  };
}

export function deleteGrupoList(grupoList: GrupoModel): GrupoListActionsTypes {
  return {
    type: GrupoListTypes.DELETE_GRUPOLIST_REQUEST,
    payload: { grupoList },
  };
}

export function clearGrupoList(grupoList: GrupoModel): GrupoListActionsTypes {
  return {
    type: GrupoListTypes.CLEAR_GRUPOLIST_REQUEST,
    payload: { grupoList },
  };
}
