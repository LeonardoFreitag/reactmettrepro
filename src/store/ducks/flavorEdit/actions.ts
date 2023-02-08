import { ItemModel } from '../../../models/ItemModel';
import { FlavorEditTypes, FlavorEditActionsTypes } from './types';

export function createFlavorEdit(
  flavorEdit: ItemModel,
): FlavorEditActionsTypes {
  return {
    type: FlavorEditTypes.CREATE_FLAVOREDIT_REQUEST,
    payload: { flavorEdit },
  };
}

export function updateFlavorEdit(
  flavorEdit: ItemModel,
): FlavorEditActionsTypes {
  return {
    type: FlavorEditTypes.UPDATE_FLAVOREDIT_REQUEST,
    payload: { flavorEdit },
  };
}

export function deleteFlavorEdit(
  flavorEdit: ItemModel,
): FlavorEditActionsTypes {
  return {
    type: FlavorEditTypes.DELETE_FLAVOREDIT_REQUEST,
    payload: { flavorEdit },
  };
}

export function clearFlavorEdit(flavorEdit: ItemModel): FlavorEditActionsTypes {
  return {
    type: FlavorEditTypes.CLEAR_FLAVOREDIT_REQUEST,
    payload: { flavorEdit },
  };
}
