import { ProdutoModel } from '../../../models/ProdutoModel';
import { ProdutoEditTypes, ProdutoEditActionsTypes } from './types';

export function createProdutoEdit(
  produtoEdit: ProdutoModel,
): ProdutoEditActionsTypes {
  return {
    type: ProdutoEditTypes.CREATE_PRODUTOEDIT_REQUEST,
    payload: { produtoEdit },
  };
}

export function updateProdutoEdit(
  produtoEdit: ProdutoModel,
): ProdutoEditActionsTypes {
  return {
    type: ProdutoEditTypes.UPDATE_PRODUTOEDIT_REQUEST,
    payload: { produtoEdit },
  };
}

export function deleteProdutoEdit(
  produtoEdit: ProdutoModel,
): ProdutoEditActionsTypes {
  return {
    type: ProdutoEditTypes.DELETE_PRODUTOEDIT_REQUEST,
    payload: { produtoEdit },
  };
}

export function clearProdutoEdit(
  produtoEdit: ProdutoModel,
): ProdutoEditActionsTypes {
  return {
    type: ProdutoEditTypes.CLEAR_PRODUTOEDIT_REQUEST,
    payload: { produtoEdit },
  };
}
