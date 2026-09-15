import { ConfigModel } from '../../../models/ConfigModel';
import { ConfigEditTypes } from './types';
export const createConfigEdit = (data: ConfigModel) => ({ type: ConfigEditTypes.CREATE, payload: data });
export const updateConfigEdit = (data: ConfigModel) => ({ type: ConfigEditTypes.UPDATE, payload: data });
export const clearConfigEdit  = ()                  => ({ type: ConfigEditTypes.CLEAR });
