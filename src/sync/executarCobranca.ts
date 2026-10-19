/**
 * Executa uma cobrança (pagamento ou estorno) no provedor e registra o
 * desfecho na fila de saída. Compartilhado por Terminal (attended) e Cobranças (cards).
 */
import { Cobranca } from '../models/CobrancaModel';
import { PaymentProvider, PaymentResult, TransactionType } from '../payment/types';
import { buildDesfecho, DesfechoBody } from './cobrancasApi';
import { enqueuePatch, registrarConcluida } from './outbox';

export type MetodoCobranca = {
  transactionType: TransactionType;
  installments: number;
  voucherKind?: 'REFEICAO' | 'ALIMENTACAO';
};

export type ResultadoCobranca = {
  desfecho: DesfechoBody;
  result: PaymentResult;
};

export function descricaoCobranca(c: Cobranca): string {
  return c.descricao ?? c.externalRef ?? c.id;
}

const nomeProvedor = (p: string): string => (p === 'STONE' ? 'Stone' : p === 'CIELO' ? 'Cielo' : p);

export async function executarCobranca(
  provider: PaymentProvider,
  terminalId: string,
  cobranca: Cobranca,
  metodo: MetodoCobranca | null,
): Promise<ResultadoCobranca> {
  let result: PaymentResult;
  let desfecho: DesfechoBody;

  /** Atalho para desfecho de erro sem tocar na maquineta. */
  const erro = (msg: string): [PaymentResult, DesfechoBody] => ([
    { success: false, error: msg },
    { terminalId, provider: provider.name, status: 'error', motivoErro: msg.slice(0, 200), pagamento: null },
  ]);

  if (cobranca.operacao === 'C') {
    if (!cobranca.alvo) {
      [result, desfecho] = erro('Cobrança de estorno sem pagamento alvo.');
    } else if (cobranca.alvo.provider && cobranca.alvo.provider !== provider.name) {
      // O estorno só funciona na rede em que o pagamento foi feito: cada provedor
      // só conhece as próprias transações (ATK na Stone, orderId/authCode na Cielo).
      [result, desfecho] = erro(
        `Pagamento feito na ${nomeProvedor(cobranca.alvo.provider)}; estorne numa maquineta ${nomeProvedor(cobranca.alvo.provider)}.`,
      );
    } else {
      result = await provider.reverse({ alvo: cobranca.alvo });
      desfecho = result.success
        ? buildDesfecho(terminalId, provider.name, { success: true, value: result })
        : {
            terminalId, provider: provider.name,
            status: result.canceledByUser ? 'canceled' : 'error',
            motivoErro: result.error.slice(0, 200), pagamento: null,
          };
      // Estorno aprovado: a API só precisa marcar ESTORNADO_POR; não insere pagamento.
      if (desfecho.status === 'approved') desfecho = { ...desfecho, pagamento: null };
    }
  } else {
    const m: MetodoCobranca = metodo ?? {
      transactionType: cobranca.tipoPre ?? 'CREDIT',
      installments: Math.max(cobranca.parcelasPre || 1, 1),
    };
    result = await provider.pay({
      amountCents: cobranca.valorCents,
      transactionType: m.transactionType,
      installments: m.installments,
      voucherKind: m.voucherKind,
      reference: cobranca.externalRef ?? cobranca.id,
      items: [{
        name: descricaoCobranca(cobranca).slice(0, 60),
        quantity: 1,
        sku: cobranca.externalRef ?? cobranca.id,
        unitPrice: cobranca.valorCents,
      }],
    });
    desfecho = result.success
      ? buildDesfecho(terminalId, provider.name, { success: true, value: result })
      : buildDesfecho(terminalId, provider.name, { success: false, error: result.error, canceledByUser: result.canceledByUser });
  }

  // Todo desfecho passa pela fila de saída: se a API cair no meio, não se perde.
  await enqueuePatch(cobranca.id, desfecho);
  await registrarConcluida({
    cobrancaId: cobranca.id,
    descricao: descricaoCobranca(cobranca),
    valorCents: cobranca.valorCents,
    status: desfecho.status,
    em: new Date().toISOString(),
  });

  return { desfecho, result };
}
