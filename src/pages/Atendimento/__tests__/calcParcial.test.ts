import { calcParcial } from '../FechamentoModal';
import type { ItemModel } from '../../../models/ItemModel';

function item(over: Partial<ItemModel>): ItemModel {
  return {
    quantidade: 1, total: 10, servico: 0, ...over,
  } as ItemModel;
}

describe('calcParcial (inalterado)', () => {
  it('fatia proporcional e última fatia fecha exatamente com o total + serviço − já pago', () => {
    const i = item({ quantidade: 3, total: 10, servico: 1 }); // 11,00 / 3 = 3,6667
    expect(calcParcial(i, 1)).toBe(3.67);
    expect(calcParcial(i, 2)).toBe(7.33);
    expect(calcParcial(i, 3)).toBe(11);
    // 1 já pago (3,67): as 2 restantes fecham em 7,33
    expect(calcParcial(i, 2, { qtde: 1, valor: 3.67 })).toBe(7.33);
    expect(calcParcial(i, 1, { qtde: 1, valor: 3.67 })).toBe(3.67);
  });

  it('fracionado (kg) é tudo-ou-nada: a quantidade inteira devolve o total', () => {
    const i = item({ quantidade: 0.45, total: 27.9, servico: 2.79 });
    expect(calcParcial(i, 0.45)).toBe(30.69);
  });

  it('zero ou item sem quantidade → 0', () => {
    expect(calcParcial(item({ quantidade: 2, total: 10 }), 0)).toBe(0);
    expect(calcParcial(item({ quantidade: 0, total: 10 }), 1)).toBe(0);
  });
});
