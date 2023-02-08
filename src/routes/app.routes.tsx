import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Atendimento from '../pages/Atendimento';
import Comandas from '../pages/Comandas';
import Configuracoes from '../pages/Configuracoes';
import EditaProduto from '../pages/EditaProduto';
import EditaItemCombinado from '../pages/EditItemCombinado';
import GruposDeCombinados from '../pages/GruposDeCombinados';
import ProdutosGrupoCombinado from '../pages/GruposDeCombinados/ProdutosGrupoCombinado';
import LancaPorCodigo from '../pages/LancaPorCodigo';
import Observacoes from '../pages/LancaPorCodigo/Observacoes';
import SearchProduct from '../pages/LancaPorCodigo/SearchProduct';
import ListaPorSubgrupo from '../pages/ListaPorSubgrupo';
import ProdutosPorGrupo from '../pages/ListaPorSubgrupo/ProdutosPorGrupo';
import ObservacoesPorGrupo from '../pages/ListaPorSubgrupo/ProdutosPorGrupo/ObservacoesPorGrupo';
import SignIn from '../pages/SignIn';
const { Navigator, Screen } = createNativeStackNavigator();

export function AppRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="signin" component={SignIn} />
      <Screen name="configuracoes" component={Configuracoes} />
      <Screen name="comandas" component={Comandas} />
      <Screen name="atendimento" component={Atendimento} />
      <Screen name="lancaPorCodigo" component={LancaPorCodigo} />
      <Screen name="searchProduct" component={SearchProduct} />

      <Screen name="observacoes" component={Observacoes} />
      <Screen name="listaPorSubgrupo" component={ListaPorSubgrupo} />
      <Screen name="produtosPorGrupo" component={ProdutosPorGrupo} />
      <Screen name="editaProduto" component={EditaProduto} />
      <Screen name="observacoesPorGrupo" component={ObservacoesPorGrupo} />
      <Screen name="gruposDeCombinados" component={GruposDeCombinados} />
      <Screen
        name="produtosGrupoCombinado"
        component={ProdutosGrupoCombinado}
      />
      <Screen name="editaItemCombinado" component={EditaItemCombinado} />
    </Navigator>
  );
}
