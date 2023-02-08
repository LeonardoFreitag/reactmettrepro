import { ProdutoModel } from '../../../models/ProdutoModel';
import {
  ProdutoEditTypes,
  ProdutoEditState,
  ProdutoEditActionsTypes,
} from './types';

const INITIAL_STATE: ProdutoEditState = {
  data: {} as ProdutoModel,
};

export default function ProdutoEditReducer(
  state = INITIAL_STATE,
  action: ProdutoEditActionsTypes,
): ProdutoEditState {
  switch (action.type) {
    case ProdutoEditTypes.CREATE_PRODUTOEDIT_REQUEST:
      return {
        data: action.payload.produtoEdit,
      };
    case ProdutoEditTypes.UPDATE_PRODUTOEDIT_REQUEST: {
      const data = action.payload.produtoEdit;
      return { data };
    }
    case ProdutoEditTypes.DELETE_PRODUTOEDIT_REQUEST: {
      const data = {} as ProdutoModel;
      return { data };
    }
    case ProdutoEditTypes.CLEAR_PRODUTOEDIT_REQUEST: {
      const data = {} as ProdutoModel;
      return { data };
    }
    default:
      return state;
  }
}
