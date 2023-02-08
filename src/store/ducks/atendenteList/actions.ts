import { AtendenteModel } from '../../../models/AtendenteModel';
import { AtendenteListTypes, AtendenteListActionsTypes } from './types';

export function loadAtendenteList(
  atendenteList: AtendenteModel[],
): AtendenteListActionsTypes {
  return {
    type: AtendenteListTypes.LOAD_ATENDENTELIST_REQUEST,
    payload: { atendenteList },
  };
}

export function createAtendenteList(
  atendenteList: AtendenteModel,
): AtendenteListActionsTypes {
  return {
    type: AtendenteListTypes.CREATE_ATENDENTELIST_REQUEST,
    payload: { atendenteList },
  };
}

export function updateAtendenteList(
  atendenteList: AtendenteModel,
): AtendenteListActionsTypes {
  return {
    type: AtendenteListTypes.UPDATE_ATENDENTELIST_REQUEST,
    payload: { atendenteList },
  };
}

export function deleteAtendenteList(
  atendenteList: AtendenteModel,
): AtendenteListActionsTypes {
  return {
    type: AtendenteListTypes.DELETE_ATENDENTELIST_REQUEST,
    payload: { atendenteList },
  };
}

export function clearAtendenteList(
  atendenteList: AtendenteModel,
): AtendenteListActionsTypes {
  return {
    type: AtendenteListTypes.CLEAR_ATENDENTELIST_REQUEST,
    payload: { atendenteList },
  };
}
