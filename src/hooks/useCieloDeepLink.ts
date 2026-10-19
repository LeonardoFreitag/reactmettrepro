import { useEffect, useRef, useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { encodeBase64 } from '../utils/base64';
import { CieloPaymentRequest } from '../models/CieloModel';
import { CIELO_CALLBACK_URL, CieloResult } from '../payment/cieloCallback';
import { registerWaiter } from '../payment/deepLinkInbox';

export type { CieloResult };

// O scheme registrado em app.json ("order") define o contrato de callback.
// A Cielo Smart retorna: order://response?response=<base64>&responsecode=<code>
// Quem escuta a URL é o inbox global (payment/deepLinkInbox.ts) — inclusive no
// cold start via Linking.getInitialURL(); este hook só registra quem espera.
const URL_CALLBACK      = CIELO_CALLBACK_URL;
const CIELO_PAYMENT_URI = 'lio://payment';
const CIELO_PRINT_URI   = 'lio://print';
// Cancelamento/estorno (Order Manager URI): request = { accessToken, clientID, id, authCode, cieloCode }
// Referência: github.com/matheus-caldeira/cielo_sample (Payment.java, CANCEL = "payment-reversal").
const CIELO_REVERSAL_URI = 'lio://payment-reversal';

export function useCieloDeepLink() {
  const [isWaiting, setIsWaiting] = useState(false);
  // Resolve da Promise em andamento (cancelWait) e unregister do waiter no inbox.
  const settleRef = useRef<((r: CieloResult) => void) | null>(null);
  const unregisterRef = useRef<(() => void) | null>(null);

  // Ao desmontar, solta o waiter: se a resposta chegar depois, o inbox grava
  // o pagamento sozinho (pendente persistido) em vez de entregá-la a ninguém.
  useEffect(() => () => {
    unregisterRef.current?.();
    unregisterRef.current = null;
    settleRef.current = null;
  }, []);

  const open = useCallback((uri: string, openError: string): Promise<CieloResult> => {
    setIsWaiting(true);
    return new Promise<CieloResult>(resolve => {
      const settle = (r: CieloResult) => {
        if (settleRef.current !== settle) return; // já resolvida / substituída
        settleRef.current = null;
        unregisterRef.current?.();
        unregisterRef.current = null;
        setIsWaiting(false);
        resolve(r);
      };
      settleRef.current = settle;
      unregisterRef.current = registerWaiter({ provider: 'CIELO', resolve: settle });
      Linking.openURL(uri).catch(() => settle({ success: false, error: openError }));
    });
  }, []);

  /**
   * Inicia um pagamento via Deep Link na Cielo Smart.
   *
   * @param params.accessToken  Token de acesso da Cielo
   * @param params.clientID     Client-ID da Cielo
   * @param params.totalCents   Valor total em centavos (ex: 1000 = R$10,00)
   * @param params.items        Itens do pedido
   * @param params.paymentCode  Meio de pagamento (ex: "CREDITO_AVISTA")
   * @param params.reference    Referência do pedido — a Cielo a ecoa na resposta
   *                            (usada para casar com o pagamento pendente)
   * @param params.installments Nº de parcelas (opcional; 0/ausente = a Cielo pergunta — comportamento original)
   */
  const sendPayment = useCallback(async (params: {
    accessToken: string;
    clientID: string;
    totalCents: number;
    items: Array<{
      name: string;
      quantity: number;
      sku: string;
      unitPrice: number; // centavos
    }>;
    paymentCode: string;
    reference?: string;
    installments?: number;
  }): Promise<CieloResult> => {
    const request: CieloPaymentRequest = {
      accessToken:  params.accessToken,
      clientID:     params.clientID,
      reference:    params.reference ?? '',
      installments: params.installments ?? 0,
      items: params.items.map(it => ({
        name:          it.name,
        quantity:      it.quantity,
        sku:           it.sku,
        unitOfMeasure: 'unidade',
        unitPrice:     it.unitPrice,
      })),
      paymentCode: params.paymentCode,
      value:       String(params.totalCents),
    };

    const base64 = encodeBase64(JSON.stringify(request));
    const uri = `${CIELO_PAYMENT_URI}?request=${base64}&urlCallback=${URL_CALLBACK}`;
    return open(uri, 'Não foi possível abrir o aplicativo Cielo. Verifique se a Cielo Smart está instalada neste dispositivo.');
  }, [open]);

  /**
   * Imprime texto na impressora térmica da Cielo Smart via Deep Link.
   * O texto deve estar pré-formatado (largura ~32 colunas para 58mm).
   * Use '\n' para quebras de linha e '\n\n' ao final para avançar o papel.
   */
  const printText = useCallback(async (text: string): Promise<CieloResult> => {
    const request = {
      operation: 'PRINT_TEXT',
      styles: [{}],
      value: [text],
    };
    const base64 = encodeBase64(JSON.stringify(request));
    const uri = `${CIELO_PRINT_URI}?request=${base64}&urlCallback=${URL_CALLBACK}`;
    return open(uri, 'Não foi possível acionar a impressora Cielo.');
  }, [open]);

  /**
   * Estorna (cancela) um pagamento já aprovado via Deep Link `lio://payment-reversal`.
   * Reaproveita o mesmo callback `order://response`.
   *
   * @param params.id         id da ordem Cielo (CIELO_PAGAMENTOS.CIELO_ORDER_ID)
   * @param params.authCode   código de autorização do pagamento
   * @param params.cieloCode  cieloCode do pagamento
   */
  const sendReversal = useCallback(async (params: {
    accessToken: string;
    clientID: string;
    id: string;
    authCode: string;
    cieloCode: string;
  }): Promise<CieloResult> => {
    const request = {
      accessToken: params.accessToken,
      clientID:    params.clientID,
      id:          params.id,
      authCode:    params.authCode,
      cieloCode:   params.cieloCode,
    };
    const base64 = encodeBase64(JSON.stringify(request));
    const uri = `${CIELO_REVERSAL_URI}?request=${base64}&urlCallback=${URL_CALLBACK}`;
    return open(uri, 'Não foi possível abrir o aplicativo Cielo para o estorno.');
  }, [open]);

  /**
   * Cancela a espera por uma resposta da Cielo (ex: usuário voltou sem pagar).
   */
  const cancelWait = useCallback(() => {
    settleRef.current?.({ success: false, error: 'Pagamento cancelado pelo operador.' });
  }, []);

  return { sendPayment, sendReversal, printText, cancelWait, isWaiting };
}
