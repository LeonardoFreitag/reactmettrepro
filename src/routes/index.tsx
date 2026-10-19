import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SignIn } from '../pages/SignIn';
import { Configuracoes } from '../pages/Configuracoes';
import { Comandas } from '../pages/Comandas';
import { Atendimento } from '../pages/Atendimento';
import { LancaPorCodigo } from '../pages/LancaPorCodigo';
import { SearchProduct } from '../pages/LancaPorCodigo/SearchProduct';
import { ListaPorSubgrupo } from '../pages/ListaPorSubgrupo';
import { ProdutosPorGrupo } from '../pages/ListaPorSubgrupo/ProdutosPorGrupo';
import { ObservacoesPorGrupo } from '../pages/ListaPorSubgrupo/ProdutosPorGrupo/ObservacoesPorGrupo';
import { GruposDeCombinados } from '../pages/GruposDeCombinados';
import { ProdutosGrupoCombinado } from '../pages/GruposDeCombinados/ProdutosGrupoCombinado';
import { Terminal } from '../pages/Terminal';
import { TerminalEspera } from '../pages/TerminalEspera';
import { Cobrancas } from '../pages/Cobrancas';
import { Cobranca } from '../models/CobrancaModel';
import { navigationRef } from './navigationRef';

export type AppStackParamList = {
  signin: undefined;
  configuracoes: undefined;
  comandas: undefined;
  atendimento: undefined;
  lancaPorCodigo: undefined;
  searchProduct: undefined;
  observacoes: undefined;
  listaPorSubgrupo: undefined;
  produtosPorGrupo: undefined;
  editaProduto: undefined;
  observacoesPorGrupo: { amount: string };
  gruposDeCombinados: undefined;
  produtosGrupoCombinado: undefined;
  editaItemCombinado: undefined;
  /** Modo "Terminal de pagamento" (attended) — aberto pelo TerminalRunner. */
  terminal: { cobranca: Cobranca };
  /** Tela de plantão do Modo Terminal: onde o aparelho dedicado fica parado. */
  terminalEspera: undefined;
  /** Cards de cobrança (detached, offline-first). */
  cobrancas: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function Routes() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="signin">
        <Stack.Screen name="signin" component={SignIn} />
        <Stack.Screen name="configuracoes" component={Configuracoes} />
        <Stack.Screen name="comandas" component={Comandas} />
        <Stack.Screen name="atendimento" component={Atendimento} />
        <Stack.Screen name="lancaPorCodigo" component={LancaPorCodigo} />
        <Stack.Screen name="searchProduct" component={SearchProduct} />
        <Stack.Screen name="listaPorSubgrupo" component={ListaPorSubgrupo} />
        <Stack.Screen name="produtosPorGrupo" component={ProdutosPorGrupo} />
        <Stack.Screen name="observacoesPorGrupo" component={ObservacoesPorGrupo} />
        <Stack.Screen name="gruposDeCombinados" component={GruposDeCombinados} />
        <Stack.Screen name="produtosGrupoCombinado" component={ProdutosGrupoCombinado} />
        <Stack.Screen name="terminalEspera" component={TerminalEspera} options={{ gestureEnabled: false }} />
        <Stack.Screen name="terminal" component={Terminal} options={{ gestureEnabled: false }} />
        <Stack.Screen name="cobrancas" component={Cobrancas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
