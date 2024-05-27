import { FlavorModel } from '../../../models/FlavorModel';
import { FlavorListTypes, FlavorListActionsTypes } from './types';

export function loadFlavorList(
  flavorList: FlavorModel[],
): FlavorListActionsTypes {
  return {
    type: FlavorListTypes.LOAD_FLAVORLIST_REQUEST,
    payload: { flavorList },
  };
}

export function createFlavorList(
  flavorList: FlavorModel,
): FlavorListActionsTypes {
  return {
    type: FlavorListTypes.CREATE_FLAVORLIST_REQUEST,
    payload: { flavorList },
  };
}

export function updateFlavorList(
  flavorList: FlavorModel,
): FlavorListActionsTypes {
  return {
    type: FlavorListTypes.UPDATE_FLAVORLIST_REQUEST,
    payload: { flavorList },
  };
}

export function deleteFlavorList(
  flavorList: FlavorModel,
): FlavorListActionsTypes {
  return {
    type: FlavorListTypes.DELETE_FLAVORLIST_REQUEST,
    payload: { flavorList },
  };
}

export function clearFlavorList(
  flavorList: FlavorModel,
): FlavorListActionsTypes {
  return {
    type: FlavorListTypes.CLEAR_FLAVORLIST_REQUEST,
    payload: { flavorList },
  };
}
