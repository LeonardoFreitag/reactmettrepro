import { ProdutoModel } from '../../../models/ProdutoModel';
export enum ProdutoListTypes {
  LOAD   = 'produtoList/LOAD',
  CREATE = 'produtoList/CREATE',
  DELETE = 'produtoList/DELETE',
  CLEAR  = 'produtoList/CLEAR',
}
export interface ProdutoListState { data: ProdutoModel[]; }
