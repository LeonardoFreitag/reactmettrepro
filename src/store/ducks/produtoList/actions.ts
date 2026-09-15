import { ProdutoModel } from '../../../models/ProdutoModel';
import { ProdutoListTypes } from './types';
export const loadProdutoList   = (data: ProdutoModel[]) => ({ type: ProdutoListTypes.LOAD,   payload: data });
export const createProdutoList = (data: ProdutoModel)   => ({ type: ProdutoListTypes.CREATE, payload: data });
export const deleteProdutoList = (codigo: string)       => ({ type: ProdutoListTypes.DELETE, payload: codigo });
export const clearProdutoList  = ()                     => ({ type: ProdutoListTypes.CLEAR });
