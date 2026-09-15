import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { ObservacoesListTypes } from './types';
export const loadObservacoesList   = (data: ObservacoesModel[]) => ({ type: ObservacoesListTypes.LOAD,   payload: data });
export const createObservacoesList = (data: ObservacoesModel)   => ({ type: ObservacoesListTypes.CREATE, payload: data });
export const deleteObservacoesList = (codigo: string)           => ({ type: ObservacoesListTypes.DELETE, payload: codigo });
export const clearObservacoesList  = ()                         => ({ type: ObservacoesListTypes.CLEAR });
