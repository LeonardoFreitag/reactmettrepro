import { ProdutoEditTypes, ProdutoEditState } from './types';
const INITIAL_STATE: ProdutoEditState = { data: { codigo: '', nome: '', unidade: '', preco: 0, grupo: '', subgrupo: '', fracionado: '', impressao: '', selected: false } };
export default function produtoEditReducer(state = INITIAL_STATE, action: { type: ProdutoEditTypes; payload?: any }): ProdutoEditState {
  switch (action.type) {
    case ProdutoEditTypes.CREATE:
    case ProdutoEditTypes.UPDATE:
      return { data: action.payload };
    case ProdutoEditTypes.DELETE:
    case ProdutoEditTypes.CLEAR:
      return INITIAL_STATE;
    default:
      return state;
  }
}
