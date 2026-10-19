import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppStackParamList } from './index';

/** Ref global do NavigationContainer — permite navegar fora de telas (TerminalRunner). */
export const navigationRef = createNavigationContainerRef<AppStackParamList>();
