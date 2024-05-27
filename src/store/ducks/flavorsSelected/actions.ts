import { FlavorModel } from '../../../models/FlavorModel';
import { FlavorsSelectedTypes, FlavorsSelectedActionsTypes } from './types';

export function loadFlavorsSelected(
  flavorsSelected: FlavorModel[],
): FlavorsSelectedActionsTypes {
  return {
    type: FlavorsSelectedTypes.LOAD_FLAVORSSELECTED_REQUEST,
    payload: { flavorsSelected },
  };
}

export function createFlavorsSelected(
  flavorsSelected: FlavorModel,
): FlavorsSelectedActionsTypes {
  return {
    type: FlavorsSelectedTypes.CREATE_FLAVORSSELECTED_REQUEST,
    payload: { flavorsSelected },
  };
}

export function updateFlavorsSelected(
  flavorsSelected: FlavorModel,
): FlavorsSelectedActionsTypes {
  return {
    type: FlavorsSelectedTypes.UPDATE_FLAVORSSELECTED_REQUEST,
    payload: { flavorsSelected },
  };
}

export function deleteFlavorsSelected(
  flavorsSelected: FlavorModel,
): FlavorsSelectedActionsTypes {
  return {
    type: FlavorsSelectedTypes.DELETE_FLAVORSSELECTED_REQUEST,
    payload: { flavorsSelected },
  };
}

export function clearFlavorsSelected(
  flavorsSelected: FlavorModel,
): FlavorsSelectedActionsTypes {
  return {
    type: FlavorsSelectedTypes.CLEAR_FLAVORSSELECTED_REQUEST,
    payload: { flavorsSelected },
  };
}
