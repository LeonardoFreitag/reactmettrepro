import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PendingPayment, buildReference, completaTotal, concluirPendente, getPendentes, iniciarPendente,
  matchPendente, parseReference,
} from '../pending';

function pendente(over: Partial<PendingPayment> = {}): PendingPayment {
  const idLocal = over.idLocal ?? '3f2a1c9e-0000-4000-8000-000000000001';
  return {
    idLocal,
    provider: 'CIELO',
    origem: 'M',
    codVenda: 55,
    amountCents: 5000,
    totalCents: 12000,
    paidBeforeCents: 0,
    transactionType: 'INSTANT_PAYMENT',
    installments: 1,
    itens: [],
    reference: buildReference('M', 55, idLocal),
    descricao: 'Comanda 12',
    iniciadoEm: '2026-10-19T12:00:00.000Z',
    ...over,
  };
}

describe('reference estruturada', () => {
  it('monta e interpreta <origem>:<codVenda>:<idLocal>', () => {
    const ref = buildReference('M', 55, '3f2a1c9e-0000-4000-8000-000000000001');
    expect(ref).toBe('M:55:3f2a1c9e-0000-4000-8000-000000000001');
    expect(ref.length).toBeLessThanOrEqual(60); // REFERENCIA VARCHAR(60)
    expect(parseReference(ref)).toEqual({ origem: 'M', codVenda: 55, idLocal: '3f2a1c9e-0000-4000-8000-000000000001' });
    expect(parseReference('Comanda 12')).toBeNull();
    expect(parseReference('')).toBeNull();
  });
});

describe('matchPendente', () => {
  const a = pendente();
  const b = pendente({ idLocal: 'aaaaaaaa-0000-4000-8000-000000000002', codVenda: 56 });

  it('casa pela reference exata', () => {
    expect(matchPendente(b.reference, [a, b])).toBe(b);
  });
  it('casa pelo idLocal quando a reference vem parcialmente alterada', () => {
    expect(matchPendente('M:999:aaaaaaaa-0000-4000-8000-000000000002', [a, b])).toBe(b);
  });
  it('sem reference: usa o único pendente; com vários, não arrisca', () => {
    expect(matchPendente('', [a])).toBe(a);
    expect(matchPendente(undefined, [a, b])).toBeNull();
    expect(matchPendente('', [])).toBeNull();
  });
  it('reference desconhecida com um único pendente cai no único', () => {
    expect(matchPendente('outra', [a])).toBe(a);
  });
});

describe('completaTotal (impressão única ao atingir o total)', () => {
  it('true quando pago antes + este pagamento cobre o total (tolerância de 1 centavo)', () => {
    expect(completaTotal({ paidBeforeCents: 7000, amountCents: 5000, totalCents: 12000 })).toBe(true);
    expect(completaTotal({ paidBeforeCents: 7000, amountCents: 4999, totalCents: 12000 })).toBe(true);
    expect(completaTotal({ paidBeforeCents: 0, amountCents: 5000, totalCents: 12000 })).toBe(false);
    expect(completaTotal({ paidBeforeCents: 0, amountCents: 5000, totalCents: 0 })).toBe(false);
  });
});

describe('persistência', () => {
  beforeEach(async () => { await AsyncStorage.clear(); });

  it('iniciar grava antes do Deep Link; concluir apaga', async () => {
    const p = await iniciarPendente({
      provider: 'CIELO', origem: 'M', codVenda: 55, amountCents: 5000, totalCents: 5000, paidBeforeCents: 0,
      transactionType: 'CREDIT', installments: 1, itens: [], descricao: 'Comanda 12',
    });
    expect(p.reference).toBe(`M:55:${p.idLocal}`);
    expect(await getPendentes()).toHaveLength(1);
    await concluirPendente(p.idLocal);
    expect(await getPendentes()).toHaveLength(0);
    await concluirPendente(p.idLocal); // idempotente
  });
});
