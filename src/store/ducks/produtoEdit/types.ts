import { ProdutoModel } from '../../../models/ProdutoModel';

/*
 * actiontpes
 */
export enum ProdutoEditTypes {
  CREATE_PRODUTOEDIT_REQUEST = '@produtoEdit/CREATE_PRODUTOEDIT_REQUEST',
  UPDATE_PRODUTOEDIT_REQUEST = '@produtoEdit/UPDATE_PRODUTOEDIT_REQUEST',
  DELETE_PRODUTOEDIT_REQUEST = '@produtoEdit/DELETE_PRODUTOEDIT_REQUEST',
  CLEAR_PRODUTOEDIT_REQUEST = '@produtoEdit/CLEAR_PRODUTOEDIT_REQUEST',
}

/*
 * state types
 */
export interface ProdutoEditState {
  readonly data: ProdutoModel;
}

// export const CREATE_PRODUTOEDIT_REQUEST = '@produtoEdit/CREATE_PRODUTOEDIT_REQUEST';
interface CreateProdutoEditRequest {
  type: ProdutoEditTypes.CREATE_PRODUTOEDIT_REQUEST; // typeof CREATE_PRODUTOEDIT_REQUEST;
  payload: { produtoEdit: ProdutoModel };
}

// export const UPDATE_PRODUTOEDIT_REQUEST = '@produtoEdit/UPDATE_PRODUTOEDIT_REQUEST';
interface UpdateProdutoEditRequest {
  type: ProdutoEditTypes.UPDATE_PRODUTOEDIT_REQUEST;
  payload: { produtoEdit: ProdutoModel };
}
// export const DELETE_PRODUTOEDIT_REQUEST = '@produtoEdit/DELETE_PRODUTOEDIT_REQUEST';
interface DeleteProdutoEditRequest {
  type: ProdutoEditTypes.DELETE_PRODUTOEDIT_REQUEST;
  payload: { produtoEdit: ProdutoModel };
}

interface ClearProdutoEditRequest {
  type: ProdutoEditTypes.CLEAR_PRODUTOEDIT_REQUEST;
  payload: { produtoEdit: ProdutoModel };
}

export type ProdutoEditActionsTypes =
  | CreateProdutoEditRequest
  | UpdateProdutoEditRequest
  | DeleteProdutoEditRequest
  | ClearProdutoEditRequest;
