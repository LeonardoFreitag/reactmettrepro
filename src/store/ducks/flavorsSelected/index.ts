import { FlavorModel } from '../../../models/FlavorModel';
import {
  FlavorsSelectedTypes,
  FlavorsSelectedState,
  FlavorsSelectedActionsTypes,
} from './types';

const INITIAL_STATE: FlavorsSelectedState = {
  data: [],
};

export default function FlavorsSelectedReducer(
  state = INITIAL_STATE,
  action: FlavorsSelectedActionsTypes,
): FlavorsSelectedState {
  switch (action.type) {
    case FlavorsSelectedTypes.LOAD_FLAVORSSELECTED_REQUEST:
      return {
        data: action.payload.flavorsSelected,
      };
    case FlavorsSelectedTypes.CREATE_FLAVORSSELECTED_REQUEST:
      return {
        data: [...state.data, action.payload.flavorsSelected],
      };
    case FlavorsSelectedTypes.UPDATE_FLAVORSSELECTED_REQUEST: {
      const data = state.data.map(flavor =>
        flavor.codigo === action.payload.flavorsSelected.codigo
          ? action.payload.flavorsSelected
          : flavor,
      );
      return { data };
    }
    case FlavorsSelectedTypes.DELETE_FLAVORSSELECTED_REQUEST: {
      const data = state.data.filter(
        flavor => flavor.codigo !== action.payload.flavorsSelected.codigo,
      );
      return { data };
    }
    case FlavorsSelectedTypes.CLEAR_FLAVORSSELECTED_REQUEST: {
      const data = [] as FlavorModel[];
      return { data };
    }
    default:
      return state;
  }
}
