import { ProdutoModel } from '../../../models/ProdutoModel';
import { ProdutoEditTypes } from './types';
export const createProdutoEdit = (data: ProdutoModel) => ({ type: ProdutoEditTypes.CREATE, payload: data });
export const updateProdutoEdit = (data: ProdutoModel) => ({ type: ProdutoEditTypes.UPDATE, payload: data });
export const deleteProdutoEdit = () => ({ type: ProdutoEditTypes.DELETE });
export const clearProdutoEdit  = () => ({ type: ProdutoEditTypes.CLEAR });
