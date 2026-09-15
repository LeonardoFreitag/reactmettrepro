import { useEffect, useRef, useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { encodeBase64, decodeBase64 } from '../utils/base64';
import {
  CieloPaymentRequest,
  CieloPaymentResponse,
  CieloPaymentError,
} from '../models/CieloModel';

// O scheme registrado em app.json ("order") define o contrato de callback.
// A Cielo Smart retorna: order://response?response=<base64>&responsecode=<code>
const URL_CALLBACK    = 'order://response';
const CIELO_PAYMENT_URI = 'lio://payment';
const CIELO_PRINT_URI   = 'lio://print';

export type CieloResult =
  | { success: true;  data: CieloPaymentResponse }
  | { success: false; error: string; errorCode?: number };

export function useCieloDeepLink() {
  const [isWaiting, setIsWaiting] = useState(false);
  // Guardamos o resolve da Promise para chamar ao receber o callback
  const resolveRef = useRef<((r: CieloResult) => void) | null>(null);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLinkUrl);
    return () => subscription.remove();
  }, []);

  function handleDeepLinkUrl({ url }: { url: string }) {
    if (!url.startsWith('order://response')) return;

    try {
      const [, queryString] = url.split('?');
      const params: Record<string, string> = {};
      queryString?.split('&').forEach(pair => {
        const eqIdx = pair.indexOf('=');
        if (eqIdx === -1) return;
        const k = pair.substring(0, eqIdx);
        const v = pair.substring(eqIdx + 1);
        if (k) params[k] = decodeURIComponent(v);
      });

      const responseB64 = params['response'];
      if (!responseB64) {
        settle({ success: false, error: 'Resposta inválida da Cielo.' });
        return;
      }

      let json: string;
      try {
        // Emulador retorna base64 com quebras de linha (MIME wrap) — remover antes de decodificar
        const cleanB64 = responseB64.replace(/\s+/g, '');
        json = decodeBase64(cleanB64);
      } catch {
        settle({ success: false, error: 'Erro ao decodificar resposta da Cielo.' });
        return;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(json);
      } catch {
        settle({ success: false, error: 'Erro ao interpretar JSON da Cielo.' });
        return;
      }

      if (typeof parsed.code === 'number') {
        const err = parsed as CieloPaymentError;
        settle({ success: false, error: err.reason, errorCode: err.code });
        return;
      }

      settle({ success: true, data: parsed as CieloPaymentResponse });
    } catch {
      settle({ success: false, error: 'Erro ao processar retorno da Cielo.' });
    }
  }

  function settle(result: CieloResult) {
    setIsWaiting(false);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }

  /**
   * Inicia um pagamento via Deep Link na Cielo Smart.
   *
   * @param params.accessToken  Token de acesso da Cielo
   * @param params.clientID     Client-ID da Cielo
   * @param params.totalCents   Valor total em centavos (ex: 1000 = R$10,00)
   * @param params.items        Itens do pedido
   * @param params.paymentCode  Meio de pagamento (ex: "CREDITO_AVISTA")
   * @param params.reference    Referência do pedido (opcional)
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
  }): Promise<CieloResult> => {
    const request: CieloPaymentRequest = {
      accessToken:  params.accessToken,
      clientID:     params.clientID,
      reference:    params.reference ?? '',
      installments: 0,
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

    setIsWaiting(true);

    return new Promise<CieloResult>(resolve => {
      resolveRef.current = resolve;
      Linking.openURL(uri).catch(() => {
        settle({
          success: false,
          error: 'Não foi possível abrir o aplicativo Cielo. Verifique se a Cielo Smart está instalada neste dispositivo.',
        });
      });
    });
  }, []);

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

    setIsWaiting(true);

    return new Promise<CieloResult>(resolve => {
      resolveRef.current = resolve;
      Linking.openURL(uri).catch(() => {
        settle({
          success: false,
          error: 'Não foi possível acionar a impressora Cielo.',
        });
      });
    });
  }, []);

  /**
   * Cancela a espera por uma resposta da Cielo (ex: usuário voltou sem pagar).
   */
  const cancelWait = useCallback(() => {
    if (resolveRef.current) {
      settle({ success: false, error: 'Pagamento cancelado pelo operador.' });
    }
  }, []);

  return { sendPayment, printText, cancelWait, isWaiting };
}
