export interface ConfigModel {
  ip: string;
  destino: boolean;
  keyboardHasLetters: boolean;
  cieloClientId: string;
  cieloAccessToken: string;
  cobrServico: string;   // 'S' | 'N'
  perServico: number;    // ex: 10 = 10%
}
