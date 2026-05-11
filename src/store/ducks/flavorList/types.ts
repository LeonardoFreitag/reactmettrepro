import { FlavorModel } from '../../../models/FlavorModel';
export enum FlavorListTypes {
  LOAD   = 'flavorList/LOAD',
  CREATE = 'flavorList/CREATE',
  DELETE = 'flavorList/DELETE',
  CLEAR  = 'flavorList/CLEAR',
}
export interface FlavorListState { data: FlavorModel[]; }
