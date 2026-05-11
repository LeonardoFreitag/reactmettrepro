import { AtendenteModel } from '../../../models/AtendenteModel';
import { AtendenteListTypes } from './types';
export const loadAtendenteList   = (data: AtendenteModel[]) => ({ type: AtendenteListTypes.LOAD,   payload: data });
export const createAtendenteList = (data: AtendenteModel)   => ({ type: AtendenteListTypes.CREATE, payload: data });
export const deleteAtendenteList = (codigo: string)         => ({ type: AtendenteListTypes.DELETE, payload: codigo });
export const clearAtendenteList  = ()                       => ({ type: AtendenteListTypes.CLEAR });
