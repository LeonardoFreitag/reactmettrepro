/**
 * Inbox em cold start: a resposta chega sem nenhum hook esperando e o
 * pagamento tem de ser gravado (fila `pagamento`) e, se completar o total,
 * o fechaConta enfileirado uma única vez.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encodeBase64 } from '../../utils/base64';
import { getPendentes, iniciarPendente } from '../pending';
import { handleDeepLinkUrl, registerWaiter, subscribeInbox } from '../deepLinkInbox';
import { getQueue } from '../../sync/outbox';

const E2E = 'E12345678202610191230ABCDEFGHIJK';

function respostaCielo(reference: string, authCode = E2E) {
  return {
    id: `ord-${reference.slice(-4)}`, reference, status: 'PAID', type: 'PAYMENT', price: 12000, paidAmount: 5000, pendingAmount: 0,
    createdAt: '', updatedAt: '',
    payments: [{
      id: 'p1', amount: 5000, authCode, cieloCode: 'C1', brand: '', mask: '', installments: 1, terminal: 'T', merchantCode: 'M',
      applicationName: 'app', externalId: 'ext', requestDate: '',
      paymentFields: { statusCode: '0', primaryProductName: 'PIX', secondaryProductName: 'PIX', paymentTransactionId: 'nsu-1' },
    }],
  };
}
const urlCielo = (reference: string) =>
  `order://response?response=${encodeBase64(JSON.stringify(respostaCielo(reference)))}&responsecode=0`;

async function novoPendente(over: Partial<Parameters<typeof iniciarPendente>[0]> = {}) {
  return iniciarPendente({
    provider: 'CIELO', origem: 'M', codVenda: 55, amountCents: 5000, totalCents: 12000, paidBeforeCents: 0,
    transactionType: 'INSTANT_PAYMENT', installments: 1,
    itens: [{ codigo: '901', codConjuga: 0, qtde: 1, valor: 50 }], descricao: 'Comanda 12', ...over,
  });
}

beforeEach(async () => { await AsyncStorage.clear(); });

describe('handleDeepLinkUrl (cold start, sem waiter)', () => {
  it('casa pela reference, enfileira POST /pagamentos com providerData.reference e conclui o pendente', async () => {
    const p = await novoPendente();
    const eventos: any[] = [];
    const unsub = subscribeInbox(e => eventos.push(e));

    const ev = await handleDeepLinkUrl(urlCielo(p.reference));
    unsub();

    expect(ev).toMatchObject({ provider: 'CIELO', ok: true, gravado: true, completouTotal: false, entregue: false });
    expect(eventos).toHaveLength(1);
    expect(await getPendentes()).toHaveLength(0);

    const fila = await getQueue();
    expect(fila.map(i => i.tipo)).toEqual(['pagamento']);
    const body: any = fila[0].body;
    expect(fila[0].cobrancaId).toBe(p.idLocal);
    expect(fila[0].codVenda).toBe(55);
    expect(body).toMatchObject({
      provider: 'CIELO', origem: 'M', codVenda: 55, transactionType: 'INSTANT_PAYMENT', installments: 1,
      amountCents: 5000, totalCents: 12000,
      providerData: { paymentCode: 'PIX', reference: p.reference, idLocal: p.idLocal },
      itens: [{ codItem: 901, codConjuga: 0, qtde: 1, valor: 50 }],
      resumo: { authCode: E2E, nsu: 'nsu-1' },
    });
    expect(body.rawResponse.payments[0].authCode).toHaveLength(32);
  });

  it('último pagamento completa o total → enfileira fechaConta depois do pagamento (uma vez)', async () => {
    const p = await novoPendente({ paidBeforeCents: 7000 });
    const ev = await handleDeepLinkUrl(urlCielo(p.reference));
    expect(ev?.completouTotal).toBe(true);
    const fila = await getQueue();
    expect(fila.map(i => i.tipo)).toEqual(['pagamento', 'fechaConta']);
    expect(fila[1].body).toEqual({ codigo: 55, destino: 'F' });
  });

  it('mesma URL reentregue (intent inicial ao reabrir) não grava de novo', async () => {
    const p = await novoPendente();
    const url = urlCielo(p.reference);
    await handleDeepLinkUrl(url);
    const segundo = await handleDeepLinkUrl(url);
    expect(segundo).toBeNull();
    expect((await getQueue()).filter(i => i.tipo === 'pagamento')).toHaveLength(1);
  });

  it('resposta de erro conclui o pendente sem gravar nada', async () => {
    await novoPendente();
    const url = `order://response?response=${encodeBase64(JSON.stringify({ code: 1, reason: 'Cancelado' }))}&responsecode=1`;
    const ev = await handleDeepLinkUrl(url);
    expect(ev).toMatchObject({ ok: false, gravado: false });
    expect(await getPendentes()).toHaveLength(0);
    expect(await getQueue()).toHaveLength(0);
  });

  it('URL que não é retorno de maquineta é ignorada', async () => {
    expect(await handleDeepLinkUrl('https://exemplo.com')).toBeNull();
    expect(await handleDeepLinkUrl(null)).toBeNull();
  });
});

describe('handleDeepLinkUrl (em processo, com waiter)', () => {
  it('entrega ao hook E grava o pagamento do garçom (sem fechaConta: a tela decide)', async () => {
    const p = await novoPendente({ paidBeforeCents: 7000 });
    let recebido: any = null;
    registerWaiter({ provider: 'CIELO', resolve: r => { recebido = r; } });

    const ev = await handleDeepLinkUrl(urlCielo(p.reference));
    expect(ev).toMatchObject({ entregue: true, gravado: true, completouTotal: true });
    expect(recebido?.success).toBe(true);
    expect((await getQueue()).map(i => i.tipo)).toEqual(['pagamento']);
  });

  it('modo Terminal (cobrancaId) com waiter: só entrega; executarCobranca grava o PATCH', async () => {
    const p = await novoPendente({ cobrancaId: 'cob-1', origem: 'B', terminalId: 'T1' });
    registerWaiter({ provider: 'CIELO', resolve: () => {} });
    const ev = await handleDeepLinkUrl(urlCielo(p.reference));
    expect(ev).toMatchObject({ entregue: true, gravado: false });
    expect(await getQueue()).toHaveLength(0);
    expect(await getPendentes()).toHaveLength(1); // quem conclui é o chamador (finally)
  });

  it('modo Terminal (cobrancaId) sem waiter (cold start): enfileira o PATCH approved com o pagamento', async () => {
    const p = await novoPendente({ cobrancaId: 'cob-2', origem: 'B', terminalId: 'T1' });
    const ev = await handleDeepLinkUrl(urlCielo(p.reference));
    expect(ev).toMatchObject({ entregue: false, gravado: true });
    const fila = await getQueue();
    expect(fila.map(i => i.tipo)).toEqual(['patch']);
    expect(fila[0].cobrancaId).toBe('cob-2');
    expect(fila[0].body).toMatchObject({ terminalId: 'T1', provider: 'CIELO', status: 'approved' });
    expect((fila[0].body as any).pagamento.providerData.reference).toBe(p.reference);
  });
});
