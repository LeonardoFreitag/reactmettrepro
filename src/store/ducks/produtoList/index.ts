import { ProdutoListTypes, ProdutoListState } from './types';
const INITIAL_STATE: ProdutoListState = { data: [] };
export default function produtoListReducer(state = INITIAL_STATE, action: { type: ProdutoListTypes; payload?: any }): ProdutoListState {
  switch (action.type) {
    case ProdutoListTypes.LOAD:
      return { data: action.payload };
    case ProdutoListTypes.CREATE:
      return { data: [...state.data, action.payload] };
    case ProdutoListTypes.DELETE:
      return { data: state.data.filter(p => p.codigo !== action.payload) };
    case ProdutoListTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
