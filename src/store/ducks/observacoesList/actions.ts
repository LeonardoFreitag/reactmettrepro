import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { ObservacoesListTypes, ObservacoesListActionsTypes } from './types';

export function loadObservacoesList(
  observacoesList: ObservacoesModel[],
): ObservacoesListActionsTypes {
  return {
    type: ObservacoesListTypes.LOAD_OBSERVACOESLIST_REQUEST,
    payload: { observacoesList },
  };
}

export function createObservacoesList(
  observacoesList: ObservacoesModel,
): ObservacoesListActionsTypes {
  return {
    type: ObservacoesListTypes.CREATE_OBSERVACOESLIST_REQUEST,
    payload: { observacoesList },
  };
}

export function updateObservacoesList(
  observacoesList: ObservacoesModel,
): ObservacoesListActionsTypes {
  return {
    type: ObservacoesListTypes.UPDATE_OBSERVACOESLIST_REQUEST,
    payload: { observacoesList },
  };
}

export function deleteObservacoesList(
  observacoesList: ObservacoesModel,
): ObservacoesListActionsTypes {
  return {
    type: ObservacoesListTypes.DELETE_OBSERVACOESLIST_REQUEST,
    payload: { observacoesList },
  };
}

export function clearObservacoesList(
  observacoesList: ObservacoesModel,
): ObservacoesListActionsTypes {
  return {
    type: ObservacoesListTypes.CLEAR_OBSERVACOESLIST_REQUEST,
    payload: { observacoesList },
  };
}
