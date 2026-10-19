import { interpretStoneResponse, isStoneCallbackUrl, parseStoneQuery, stoneProviderData, stoneReferenceOf } from '../stoneCallback';

describe('stoneCallback', () => {
  const url = 'order://pay?atk=ATK123&authorization_code=A1B2C3&brand=VISA&pan=************1234'
    + '&installment_count=1&transaction_type=CREDIT&order_id=M%3A55%3A3f2a1c9e-0000-4000-8000-000000000001&amount=5000';

  it('reconhece o retorno da Stone e ignora o callback da Cielo', () => {
    expect(isStoneCallbackUrl(url)).toBe(true);
    expect(isStoneCallbackUrl('order://response?response=x')).toBe(false);
    expect(isStoneCallbackUrl('lio://payment')).toBe(false);
  });

  it('decodifica a query string e ecoa o order_id como reference', () => {
    const data = parseStoneQuery(url);
    expect(data.atk).toBe('ATK123');
    expect(stoneReferenceOf(data)).toBe('M:55:3f2a1c9e-0000-4000-8000-000000000001');
    const r = interpretStoneResponse(data, true);
    expect(r.success).toBe(true);
    const pd = stoneProviderData(data, 'T1');
    expect(pd).toMatchObject({ atk: 'ATK123', authorizationCode: 'A1B2C3', brand: 'VISA', orderId: 'M:55:3f2a1c9e-0000-4000-8000-000000000001', terminalId: 'T1' });
  });

  it('falha quando há reason/status de erro ou falta o ATK num pagamento', () => {
    expect(interpretStoneResponse(parseStoneQuery('order://pay?reason=Transacao+negada'), true))
      .toMatchObject({ success: false, error: 'Transacao negada' });
    expect(interpretStoneResponse(parseStoneQuery('order://pay?status=canceled'), true))
      .toMatchObject({ success: false, canceledByUser: true });
    expect(interpretStoneResponse(parseStoneQuery('order://pay?authorization_code=X'), true))
      .toMatchObject({ success: false, error: 'Retorno da Stone sem ATK.' });
    expect(interpretStoneResponse(parseStoneQuery('order://cancel?authorization_code=X'), false).success).toBe(true);
  });
});
