import { ProdutoModel } from '../../../models/ProdutoModel';
import {
  ProdutoListTypes,
  ProdutoListState,
  ProdutoListActionsTypes,
} from './types';

const INITIAL_STATE: ProdutoListState = {
  data: [],
};

export default function ProdutoListReducer(
  state = INITIAL_STATE,
  action: ProdutoListActionsTypes,
): ProdutoListState {
  switch (action.type) {
    case ProdutoListTypes.LOAD_PRODUTOLIST_REQUEST:
      return {
        data: action.payload.produtoList,
      };
    case ProdutoListTypes.CREATE_PRODUTOLIST_REQUEST:
      return {
        data: [...state.data, action.payload.produtoList],
      };
    case ProdutoListTypes.UPDATE_PRODUTOLIST_REQUEST: {
      const data = state.data.map(produto =>
        produto.codigo === action.payload.produtoList.codigo
          ? action.payload.produtoList
          : produto,
      );
      return { data };
    }
    case ProdutoListTypes.DELETE_PRODUTOLIST_REQUEST: {
      const data = state.data.filter(
        produto => produto.codigo !== action.payload.produtoList.codigo,
      );
      return { data };
    }
    case ProdutoListTypes.CLEAR_PRODUTOLIST_REQUEST: {
      const data = [] as ProdutoModel[];
      return { data };
    }
    default:
      return state;
  }
}
