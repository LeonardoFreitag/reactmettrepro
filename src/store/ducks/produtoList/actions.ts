import { ProdutoModel } from '../../../models/ProdutoModel';
import { ProdutoListTypes, ProdutoListActionsTypes } from './types';

export function loadProdutoList(
  produtoList: ProdutoModel[],
): ProdutoListActionsTypes {
  return {
    type: ProdutoListTypes.LOAD_PRODUTOLIST_REQUEST,
    payload: { produtoList },
  };
}

export function createProdutoList(
  produtoList: ProdutoModel,
): ProdutoListActionsTypes {
  return {
    type: ProdutoListTypes.CREATE_PRODUTOLIST_REQUEST,
    payload: { produtoList },
  };
}

export function updateProdutoList(
  produtoList: ProdutoModel,
): ProdutoListActionsTypes {
  return {
    type: ProdutoListTypes.UPDATE_PRODUTOLIST_REQUEST,
    payload: { produtoList },
  };
}

export function deleteProdutoList(
  produtoList: ProdutoModel,
): ProdutoListActionsTypes {
  return {
    type: ProdutoListTypes.DELETE_PRODUTOLIST_REQUEST,
    payload: { produtoList },
  };
}

export function clearProdutoList(
  produtoList: ProdutoModel,
): ProdutoListActionsTypes {
  return {
    type: ProdutoListTypes.CLEAR_PRODUTOLIST_REQUEST,
    payload: { produtoList },
  };
}
