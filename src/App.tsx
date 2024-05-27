import 'react-native-gesture-handler';
import { NativeBaseProvider } from 'native-base';
import { StatusBar } from 'react-native';
import Routes from './routes';
import { Provider } from 'react-redux';
import store from './store';
import AppProvider from './hooks';

// LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <AppProvider>
          <Routes />
        </AppProvider>
      </NativeBaseProvider>
    </Provider>
  );
};

export default App;
