import { useEffect, useState } from 'react';
import { getTerminalState, subscribeTerminal } from './state';

export function useTerminalState() {
  const [s, setS] = useState(getTerminalState());
  useEffect(() => subscribeTerminal(() => setS(getTerminalState())), []);
  return s;
}
