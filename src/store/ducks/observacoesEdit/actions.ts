import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { ObservacoesEditTypes, ObservacoesEditActionsTypes } from './types';

export function createObservacoesEdit(
  observacoesEdit: ObservacoesModel,
): ObservacoesEditActionsTypes {
  return {
    type: ObservacoesEditTypes.CREATE_OBSERVACOESEDIT_REQUEST,
    payload: { observacoesEdit },
  };
}

export function updateObservacoesEdit(
  observacoesEdit: ObservacoesModel,
): ObservacoesEditActionsTypes {
  return {
    type: ObservacoesEditTypes.UPDATE_OBSERVACOESEDIT_REQUEST,
    payload: { observacoesEdit },
  };
}

export function deleteObservacoesEdit(
  observacoesEdit: ObservacoesModel,
): ObservacoesEditActionsTypes {
  return {
    type: ObservacoesEditTypes.DELETE_OBSERVACOESEDIT_REQUEST,
    payload: { observacoesEdit },
  };
}

export function clearObservacoesEdit(
  observacoesEdit: ObservacoesModel,
): ObservacoesEditActionsTypes {
  return {
    type: ObservacoesEditTypes.CLEAR_OBSERVACOESEDIT_REQUEST,
    payload: { observacoesEdit },
  };
}
