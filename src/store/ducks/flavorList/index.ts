import { FlavorModel } from '../../../models/FlavorModel';
import {
  FlavorListTypes,
  FlavorListState,
  FlavorListActionsTypes,
} from './types';

const INITIAL_STATE: FlavorListState = {
  data: [],
};

export default function FlavorListReducer(
  state = INITIAL_STATE,
  action: FlavorListActionsTypes,
): FlavorListState {
  switch (action.type) {
    case FlavorListTypes.LOAD_FLAVORLIST_REQUEST:
      return {
        data: action.payload.flavorList,
      };
    case FlavorListTypes.CREATE_FLAVORLIST_REQUEST:
      return {
        data: [...state.data, action.payload.flavorList],
      };
    case FlavorListTypes.UPDATE_FLAVORLIST_REQUEST: {
      const data = state.data.map(flavor =>
        flavor.codigo === action.payload.flavorList.codigo
          ? action.payload.flavorList
          : flavor,
      );
      return { data };
    }
    case FlavorListTypes.DELETE_FLAVORLIST_REQUEST: {
      const data = state.data.filter(
        flavor => flavor.codigo !== action.payload.flavorList.codigo,
      );
      return { data };
    }
    case FlavorListTypes.CLEAR_FLAVORLIST_REQUEST: {
      const data = [] as FlavorModel[];
      return { data };
    }
    default:
      return state;
  }
}
