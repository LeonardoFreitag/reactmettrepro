import { createStore } from 'redux';
import { rootReducer } from './combineReducers';

export const store = createStore(rootReducer);
