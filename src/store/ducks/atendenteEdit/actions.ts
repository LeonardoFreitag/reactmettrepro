import { AtendenteModel } from '../../../models/AtendenteModel';
import { AtendenteEditTypes } from './types';
export const createAtendenteEdit = (data: AtendenteModel) => ({ type: AtendenteEditTypes.CREATE, payload: data });
export const updateAtendenteEdit = (data: AtendenteModel) => ({ type: AtendenteEditTypes.UPDATE, payload: data });
export const deleteAtendenteEdit = () => ({ type: AtendenteEditTypes.DELETE });
export const clearAtendenteEdit  = () => ({ type: AtendenteEditTypes.CLEAR });
