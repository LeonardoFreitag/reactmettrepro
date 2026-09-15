import { ProdutoModel } from '../../../models/ProdutoModel';
export enum ProdutoEditTypes {
  CREATE = 'produtoEdit/CREATE',
  UPDATE = 'produtoEdit/UPDATE',
  DELETE = 'produtoEdit/DELETE',
  CLEAR  = 'produtoEdit/CLEAR',
}
export interface ProdutoEditState { data: ProdutoModel; }
