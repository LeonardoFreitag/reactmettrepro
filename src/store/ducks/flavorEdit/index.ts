import { ItemModel } from '../../../models/ItemModel';
import {
  FlavorEditTypes,
  FlavorEditState,
  FlavorEditActionsTypes,
} from './types';

const INITIAL_STATE: FlavorEditState = {
  data: {} as ItemModel,
};

export default function FlavorEditReducer(
  state = INITIAL_STATE,
  action: FlavorEditActionsTypes,
): FlavorEditState {
  switch (action.type) {
    case FlavorEditTypes.CREATE_FLAVOREDIT_REQUEST:
      return {
        data: action.payload.flavorEdit,
      };
    case FlavorEditTypes.UPDATE_FLAVOREDIT_REQUEST: {
      const data = action.payload.flavorEdit;
      return { data };
    }
    case FlavorEditTypes.DELETE_FLAVOREDIT_REQUEST: {
      const data = {} as ItemModel;
      return { data };
    }
    case FlavorEditTypes.CLEAR_FLAVOREDIT_REQUEST: {
      const data = {} as ItemModel;
      return { data };
    }
    default:
      return state;
  }
}
