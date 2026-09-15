import { ObservacoesModel } from '../../../models/ObservacoesModel';
import { ObservacoesEditTypes } from './types';
export const createObservacoesEdit = (data: ObservacoesModel) => ({ type: ObservacoesEditTypes.CREATE, payload: data });
export const updateObservacoesEdit = (data: ObservacoesModel) => ({ type: ObservacoesEditTypes.UPDATE, payload: data });
export const deleteObservacoesEdit = () => ({ type: ObservacoesEditTypes.DELETE });
export const clearObservacoesEdit  = () => ({ type: ObservacoesEditTypes.CLEAR });
