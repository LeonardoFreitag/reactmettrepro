import { combineReducers } from 'redux';
import AtendenteEditReducer from './atendenteEdit';
import AtendenteListReducer from './atendenteList';
import ComandaEditReducer from './comandaEdit';
import ComandaListReducer from './comandaList';
import ConfigEditReducer from './configEdit';
import GrupoEditReducer from './grupoEdit';
import GrupoListReducer from './grupoList';
import ItemEditReducer from './itemEdit';
import ItemListReducer from './itemList';
import ObservacoesEditReducer from './observacoesEdit';
import ObservacoesListReducer from './observacoesList';
import ProdutoEditReducer from './produtoEdit';
import ProdutoListReducer from './produtoList';
import FlavorEditReducer from './flavorEdit';
import SubgrupoEditReducer from './subgrupoEdit';
import SubgrupoListReducer from './subgrupoList';
import FlavorListReducer from './flavorList';
import FlavorsSelectedReducer from './flavorsSelected';
import CompanyEditReducer from './companyEdit';
import CompanyListReducer from './companyList';

// import UserReducer from './user';

const rootReducer = combineReducers({
  configEdit: ConfigEditReducer,
  atendenteEdit: AtendenteEditReducer,
  atendenteList: AtendenteListReducer,
  comandaEdit: ComandaEditReducer,
  comandaList: ComandaListReducer,
  itemList: ItemListReducer,
  itemEdit: ItemEditReducer,
  grupoList: GrupoListReducer,
  grupoEdit: GrupoEditReducer,
  subgrupoEdit: SubgrupoEditReducer,
  subgrupoList: SubgrupoListReducer,
  observacoesEdit: ObservacoesEditReducer,
  observacoesList: ObservacoesListReducer,
  produtoEdit: ProdutoEditReducer,
  produtoList: ProdutoListReducer,
  flavorEdit: FlavorEditReducer,
  flavorList: FlavorListReducer,
  flavorsSelected: FlavorsSelectedReducer,
  companyEdit: CompanyEditReducer,
  companyList: CompanyListReducer,
  // user: UserReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
