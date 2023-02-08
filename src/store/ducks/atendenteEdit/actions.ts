import { AtendenteModel } from '../../../models/AtendenteModel';
import { AtendenteEditTypes, AtendenteEditActionsTypes } from './types';

export function createAtendenteEdit(
  atendenteEdit: AtendenteModel,
): AtendenteEditActionsTypes {
  return {
    type: AtendenteEditTypes.CREATE_ATENDENTEEDIT_REQUEST,
    payload: { atendenteEdit },
  };
}

export function updateAtendenteEdit(
  atendenteEdit: AtendenteModel,
): AtendenteEditActionsTypes {
  return {
    type: AtendenteEditTypes.UPDATE_ATENDENTEEDIT_REQUEST,
    payload: { atendenteEdit },
  };
}

export function deleteAtendenteEdit(
  atendenteEdit: AtendenteModel,
): AtendenteEditActionsTypes {
  return {
    type: AtendenteEditTypes.DELETE_ATENDENTEEDIT_REQUEST,
    payload: { atendenteEdit },
  };
}

export function clearAtendenteEdit(
  atendenteEdit: AtendenteModel,
): AtendenteEditActionsTypes {
  return {
    type: AtendenteEditTypes.CLEAR_ATENDENTEEDIT_REQUEST,
    payload: { atendenteEdit },
  };
}
