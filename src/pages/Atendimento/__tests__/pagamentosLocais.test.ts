import { mesclarPagamentos, somarItens, ItemFila } from '../pagamentosLocais';
import type { PagamentoRecord } from '../../../models/CobrancaModel';

const servidor: PagamentoRecord[] = [
  { id: 1, provider: 'CIELO', transactionType: 'CREDIT', meioPagamento: 'CREDITO_AVISTA', bandeira: 'VISA', valorPago: 50, authCode: 'A1', nsu: 'N1' },
];

function fila(idLocal: string, authCode: string, nsu: string, amountCents: number, itens?: ItemFila['body']['itens']): ItemFila {
  return {
    id: `q-${idLocal}`, tipo: 'pagamento', cobrancaId: idLocal, codVenda: 55, criadoEm: '', tentativas: 0,
    body: {
      provider: 'CIELO', origem: 'M', codVenda: 55, transactionType: 'INSTANT_PAYMENT', installments: 1,
      amountCents, totalCents: 12000, providerData: { paymentCode: 'PIX' }, rawResponse: {},
      resumo: { authCode, brand: '', nsu }, itens,
    },
  };
}

describe('mesclarPagamentos', () => {
  it('acrescenta os da fila como "a sincronizar" e não duplica o que o servidor já tem', () => {
    const out = mesclarPagamentos(servidor, [fila('x', 'A1', 'N1', 5000), fila('y', 'E2E', 'N2', 7000)]);
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({ pendenteSync: true, valorPago: 70, authCode: 'E2E', meioPagamento: 'PIX' });
    expect(out[1].id).toBeLessThan(0);
  });

  it('rejeitados entram uma vez só', () => {
    const rej: PagamentoRecord = { id: -5, provider: 'CIELO', transactionType: 'DEBIT', meioPagamento: 'DEBITO_AVISTA', bandeira: '', valorPago: 20, authCode: 'R1', nsu: '' };
    expect(mesclarPagamentos(servidor, [], [rej, rej])).toHaveLength(2);
  });
});

describe('somarItens', () => {
  it('acumula qtde e valor por item (com arredondamento de centavos)', () => {
    const out = somarItens(
      { '901': { qtde: 1, valor: 3.67 } },
      [[{ codItem: 901, codConjuga: 0, qtde: 2, valor: 7.33 }], undefined, [{ codItem: 902, codConjuga: 0, qtde: 1, valor: 10 }]],
    );
    expect(out).toEqual({ '901': { qtde: 3, valor: 11 }, '902': { qtde: 1, valor: 10 } });
  });
});
