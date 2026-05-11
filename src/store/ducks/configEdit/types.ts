import { ConfigModel } from '../../../models/ConfigModel';
export enum ConfigEditTypes {
  CREATE = 'configEdit/CREATE',
  UPDATE = 'configEdit/UPDATE',
  CLEAR  = 'configEdit/CLEAR',
}
export interface ConfigEditState { data: ConfigModel; }
