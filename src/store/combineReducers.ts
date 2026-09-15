import { combineReducers } from 'redux';
import atendenteEditReducer from './ducks/atendenteEdit';
import atendenteListReducer from './ducks/atendenteList';
import comandaEditReducer from './ducks/comandaEdit';
import comandaListReducer from './ducks/comandaList';
import companyEditReducer from './ducks/companyEdit';
import companyListReducer from './ducks/companyList';
import configEditReducer from './ducks/configEdit';
import flavorEditReducer from './ducks/flavorEdit';
import flavorListReducer from './ducks/flavorList';
import flavorsSelectedReducer from './ducks/flavorsSelected';
import grupoEditReducer from './ducks/grupoEdit';
import grupoListReducer from './ducks/grupoList';
import itemEditReducer from './ducks/itemEdit';
import itemListReducer from './ducks/itemList';
import observacoesEditReducer from './ducks/observacoesEdit';
import observacoesListReducer from './ducks/observacoesList';
import produtoEditReducer from './ducks/produtoEdit';
import produtoListReducer from './ducks/produtoList';
import subgrupoEditReducer from './ducks/subgrupoEdit';
import subgrupoListReducer from './ducks/subgrupoList';

export const rootReducer = combineReducers({
  atendenteEdit: atendenteEditReducer,
  atendenteList: atendenteListReducer,
  comandaEdit: comandaEditReducer,
  comandaList: comandaListReducer,
  companyEdit: companyEditReducer,
  companyList: companyListReducer,
  configEdit: configEditReducer,
  flavorEdit: flavorEditReducer,
  flavorList: flavorListReducer,
  flavorsSelected: flavorsSelectedReducer,
  grupoEdit: grupoEditReducer,
  grupoList: grupoListReducer,
  itemEdit: itemEditReducer,
  itemList: itemListReducer,
  observacoesEdit: observacoesEditReducer,
  observacoesList: observacoesListReducer,
  produtoEdit: produtoEditReducer,
  produtoList: produtoListReducer,
  subgrupoEdit: subgrupoEditReducer,
  subgrupoList: subgrupoListReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
