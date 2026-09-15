import { FlavorModel } from '../../../models/FlavorModel';
export enum FlavorsSelectedTypes {
  LOAD   = 'flavorsSelected/LOAD',
  CREATE = 'flavorsSelected/CREATE',
  DELETE = 'flavorsSelected/DELETE',
  CLEAR  = 'flavorsSelected/CLEAR',
}
export interface FlavorsSelectedState { data: FlavorModel[]; }
