import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/createStore';
import { AppProvider } from './src/hooks';
import { Routes } from './src/routes';
import { TerminalRunner } from './src/terminal/TerminalRunner';
import { TerminalPausadoBanner } from './src/components/TerminalPausadoBanner';
import { startDrainer } from './src/sync/outbox';

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  // Fila de saída dos desfechos de cobrança (reenvio a cada 10 s / ao voltar ao foreground).
  useEffect(() => { startDrainer(); }, []);
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppProvider>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          {/* A faixa fica em fluxo acima das telas: nunca cobre cabeçalho nem rodapé. */}
          <View style={{ flex: 1 }}>
            <TerminalPausadoBanner />
            <Routes />
          </View>
          <TerminalRunner />
        </AppProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
