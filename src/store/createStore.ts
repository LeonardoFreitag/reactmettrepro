import { createStore } from 'redux';
import reducer from './ducks/combineReducers';

export default createStore(reducer);
