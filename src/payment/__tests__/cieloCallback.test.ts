import { encodeBase64 } from '../../utils/base64';
import { cieloReferenceOf, isCieloCallbackUrl, parseCieloCallbackUrl, parseQueryString } from '../cieloCallback';
import { cieloRespostaEhPix, normalizeCieloOk, toCieloPaymentCode } from '../cieloMapping';

/** Resposta de Pix da Cielo Smart: authCode é o E2E ID de 32 caracteres, brand vazia. */
const E2E = 'E12345678202610191230ABCDEFGHIJK'; // 32 chars
const respostaPix = {
  id: 'ord-123',
  reference: 'M:55:3f2a1c9e-0000-4000-8000-000000000001',
  status: 'PAID',
  type: 'PAYMENT',
  price: 5000,
  paidAmount: 5000,
  pendingAmount: 0,
  createdAt: '2026-10-19T12:30:00',
  updatedAt: '2026-10-19T12:31:00',
  payments: [{
    id: 'pay-1',
    amount: 5000,
    authCode: E2E,
    cieloCode: '',
    brand: '',
    mask: '',
    installments: 1,
    terminal: '12345678',
    merchantCode: '0000000000000001',
    applicationName: 'ReactMettre',
    externalId: 'ext-1',
    requestDate: '2026-10-19T12:30:00',
    paymentFields: {
      statusCode: '0',
      primaryProductCode: '2',
      primaryProductName: 'PIX',
      secondaryProductName: 'PIX',
      merchantCode: '0000000000000001',
      numberOfQuotas: '0',
      hasPassword: 'false',
      hasSignature: 'false',
      applicationName: 'ReactMettre',
      paymentTransactionId: 'nsu-777',
      pan: '',
      cityState: '',
      merchantName: 'Mettre',
      merchantAddress: '',
      productName: 'PIX',
    },
  }],
};

function urlDe(b64: string, code = '0') {
  return `order://response?response=${encodeURIComponent(b64)}&responsecode=${code}`;
}

describe('parseCieloCallbackUrl', () => {
  it('decodifica a resposta de Pix com authCode de 32 caracteres', () => {
    const r = parseCieloCallbackUrl(urlDe(encodeBase64(JSON.stringify(respostaPix))));
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.payments[0].authCode).toHaveLength(32);
    expect(r.data.payments[0].authCode).toBe(E2E);
    expect(cieloReferenceOf(r)).toBe('M:55:3f2a1c9e-0000-4000-8000-000000000001');
  });

  it('aceita base64 com quebras de linha (MIME wrap do emulador)', () => {
    const b64 = encodeBase64(JSON.stringify(respostaPix));
    const wrapped = b64.replace(/(.{76})/g, '$1\n');
    expect(wrapped).toContain('\n');
    const r = parseCieloCallbackUrl(urlDe(wrapped));
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe('ord-123');
  });

  it('aceita a query string sem percent-encoding (base64 cru com "=")', () => {
    const b64 = encodeBase64(JSON.stringify(respostaPix));
    const r = parseCieloCallbackUrl(`order://response?response=${b64}&responsecode=0`);
    expect(r.success).toBe(true);
  });

  it('trata o payload de erro { code, reason } (1 = cancelado pelo usuário)', () => {
    const r = parseCieloCallbackUrl(urlDe(encodeBase64(JSON.stringify({ code: 1, reason: 'Cancelado pelo usuário' })), '1'));
    expect(r).toEqual({ success: false, error: 'Cancelado pelo usuário', errorCode: 1 });
  });

  it('nunca lança: sem response, base64 inválido, JSON inválido', () => {
    expect(parseCieloCallbackUrl('order://response').success).toBe(false);
    expect(parseCieloCallbackUrl('order://response?response=').success).toBe(false);
    expect(parseCieloCallbackUrl('order://response?response=%%%').success).toBe(false);
    expect(parseCieloCallbackUrl(urlDe(encodeBase64('{nao é json'))).success).toBe(false);
  });

  it('isCieloCallbackUrl distingue o callback da Cielo do retorno da Stone', () => {
    expect(isCieloCallbackUrl('order://response?response=abc')).toBe(true);
    expect(isCieloCallbackUrl('order://pay?atk=1')).toBe(false);
    expect(isCieloCallbackUrl(null)).toBe(false);
  });

  it('parseQueryString mantém o "=" dentro do valor', () => {
    expect(parseQueryString('x://y?a=b=c&d=e')).toEqual({ a: 'b=c', d: 'e' });
  });
});

describe('normalizeCieloOk', () => {
  it('Pix: identifica por primaryProductName e preserva o authCode inteiro e a reference', () => {
    const r = parseCieloCallbackUrl(urlDe(encodeBase64(JSON.stringify(respostaPix))));
    if (!r.success) throw new Error('parse');
    expect(cieloRespostaEhPix(r.data)).toBe(true);
    const ok = normalizeCieloOk(r, 'PIX', {
      transactionType: 'INSTANT_PAYMENT', installments: 1, amountCents: 5000, reference: respostaPix.reference,
    });
    expect(ok.authCode).toBe(E2E);
    expect(ok.brand).toBe('');
    expect(ok.nsu).toBe('nsu-777');
    expect(ok.transactionType).toBe('INSTANT_PAYMENT');
    expect(ok.providerData).toEqual({ paymentCode: 'PIX', reference: respostaPix.reference });
  });

  it('corrige o tipo para Pix quando o operador escolheu outro meio e a Cielo devolveu PIX', () => {
    const r = parseCieloCallbackUrl(urlDe(encodeBase64(JSON.stringify(respostaPix))));
    if (!r.success) throw new Error('parse');
    const ok = normalizeCieloOk(r, 'DEBITO_AVISTA', { transactionType: 'DEBIT', installments: 1, amountCents: 5000 });
    expect(ok.transactionType).toBe('INSTANT_PAYMENT');
  });

  it('toCieloPaymentCode cobre os meios da UI', () => {
    expect(toCieloPaymentCode({ transactionType: 'CREDIT', installments: 1 })).toBe('CREDITO_AVISTA');
    expect(toCieloPaymentCode({ transactionType: 'CREDIT', installments: 0 })).toBe('CREDITO_PARCELADO_LOJA');
    expect(toCieloPaymentCode({ transactionType: 'DEBIT', installments: 1 })).toBe('DEBITO_AVISTA');
    expect(toCieloPaymentCode({ transactionType: 'INSTANT_PAYMENT', installments: 1 })).toBe('PIX');
    expect(toCieloPaymentCode({ transactionType: 'VOUCHER', installments: 1, voucherKind: 'ALIMENTACAO' })).toBe('VOUCHER_ALIMENTACAO');
    expect(toCieloPaymentCode({ transactionType: 'VOUCHER', installments: 1 })).toBe('VOUCHER_REFEICAO');
  });
});
