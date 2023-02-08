import { ProdutoModel } from '../../../models/ProdutoModel';

/*
 * actiontpes
 */
export enum ProdutoListTypes {
  LOAD_PRODUTOLIST_REQUEST = '@produtoList/LOAD_PRODUTOLIST_REQUEST',
  CREATE_PRODUTOLIST_REQUEST = '@produtoList/CREATE_PRODUTOLIST_REQUEST',
  UPDATE_PRODUTOLIST_REQUEST = '@produtoList/UPDATE_PRODUTOLIST_REQUEST',
  DELETE_PRODUTOLIST_REQUEST = '@produtoList/DELETE_PRODUTOLIST_REQUEST',
  CLEAR_PRODUTOLIST_REQUEST = '@produtoList/CLEAR_PRODUTOLIST_REQUEST',
}

/*
 * state types
 */
export interface ProdutoListState {
  readonly data: ProdutoModel[];
}

// export const LOAD_PRODUTOLIST_REQUEST = '@produtoList/LOAD_PRODUTOLIST_REQUEST';
interface LoadProdutoListRequest {
  type: ProdutoListTypes.LOAD_PRODUTOLIST_REQUEST; // typeof LOAD_PRODUTOLIST_REQUEST;
  payload: { produtoList: ProdutoModel[] };
}

// export const CREATE_PRODUTOLIST_REQUEST = '@produtoList/CREATE_PRODUTOLIST_REQUEST';
interface CreateProdutoListRequest {
  type: ProdutoListTypes.CREATE_PRODUTOLIST_REQUEST; // typeof CREATE_PRODUTOLIST_REQUEST;
  payload: { produtoList: ProdutoModel };
}

// export const UPDATE_PRODUTOLIST_REQUEST = '@produtoList/UPDATE_PRODUTOLIST_REQUEST';
interface UpdateProdutoListRequest {
  type: ProdutoListTypes.UPDATE_PRODUTOLIST_REQUEST;
  payload: { produtoList: ProdutoModel };
}
// export const DELETE_PRODUTOLIST_REQUEST = '@produtoList/DELETE_PRODUTOLIST_REQUEST';
interface DeleteProdutoListRequest {
  type: ProdutoListTypes.DELETE_PRODUTOLIST_REQUEST;
  payload: { produtoList: ProdutoModel };
}

interface ClearProdutoListRequest {
  type: ProdutoListTypes.CLEAR_PRODUTOLIST_REQUEST;
  payload: { produtoList: ProdutoModel };
}

export type ProdutoListActionsTypes =
  | LoadProdutoListRequest
  | CreateProdutoListRequest
  | UpdateProdutoListRequest
  | DeleteProdutoListRequest
  | ClearProdutoListRequest;
