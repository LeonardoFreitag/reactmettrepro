/**
 * Recuperação, ao iniciar o app, de um pagamento do garçom que ficou sem
 * resposta da maquineta (registro em `payment/pending.ts`).
 *
 * Primeiro deixa o inbox tratar a URL inicial (`Linking.getInitialURL()` — se a
 * resposta chegou como intent de lançamento, o pagamento é gravado ali e o
 * pendente some). O que sobrar vira a pergunta "Cobrança em aberto…":
 *  - Aprovado (registrar manualmente): POST /pagamentos pela fila com
 *    `rawResponse: { manual: true, motivo }` e `providerData.manual = true`;
 *    se completar o total da conta, enfileira o fechaConta (impressão única).
 *  - Não aprovado (descartar): apaga o pendente.
 *  - Verificar depois: mantém; pergunta de novo no próximo início.
 *
 * Pendentes do modo Terminal (com `cobrancaId`) são do TerminalRunner
 * (`terminal.current`); aqui só são limpos.
 *
 * Montado uma única vez em App.tsx (não renderiza nada).
 */
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { startInbox } from './deepLinkInbox';
import { PendingPayment, completaTotal, concluirPendente, getPendentes } from './pending';
import { toCieloPaymentCode } from './cieloMapping';
import { transactionTypeLabel } from './types';
import { PagamentoBody, enqueueFechaConta, enqueuePagamento } from '../sync/outbox';

export const MOTIVO_MANUAL = 'Registrado manualmente: o app reiniciou antes do retorno da maquineta';

/** Corpo de POST /pagamentos para um pagamento confirmado pelo operador, sem retorno da maquineta. */
export function montarPagamentoManual(p: PendingPayment, motivo: string): PagamentoBody {
  return {
    provider: p.provider,
    origem: p.origem,
    codVenda: p.codVenda,
    cobrancaId: p.cobrancaId ?? null,
    transactionType: p.transactionType,
    installments: Math.max(p.installments, 1),
    amountCents: p.amountCents,
    totalCents: p.totalCents,
    providerData: {
      manual: true,
      motivo,
      reference: p.reference,
      idLocal: p.idLocal,
      ...(p.provider === 'CIELO' ? { paymentCode: toCieloPaymentCode(p) } : {}),
    },
    rawResponse: { manual: true, motivo, reference: p.reference, iniciadoEm: p.iniciadoEm },
    ...(p.terminalId ? { terminalId: p.terminalId } : {}),
    itens: p.itens.length
      ? p.itens.map(s => ({ codItem: Number(s.codigo), codConjuga: s.codConjuga, qtde: s.qtde, valor: s.valor }))
      : undefined,
    resumo: { authCode: 'MANUAL', brand: '', nsu: '' },
  };
}

export async function registrarManualmente(p: PendingPayment, motivo = MOTIVO_MANUAL): Promise<void> {
  await enqueuePagamento(p.idLocal, montarPagamentoManual(p, motivo));
  if (!p.cobrancaId && p.origem === 'M' && completaTotal(p)) await enqueueFechaConta(p.codVenda);
  await concluirPendente(p.idLocal);
}

function perguntar(p: PendingPayment): Promise<void> {
  const valor = (p.amountCents / 100).toFixed(2);
  const tipo = transactionTypeLabel(p.transactionType, p.installments);
  const fecha = completaTotal(p)
    ? '\n\nEste pagamento completa o total: ao registrar, a conta será enviada ao caixa como recebida.'
    : '';
  return new Promise(resolve => {
    Alert.alert(
      'Cobrança em aberto',
      `Cobrança de R$ ${valor} (${tipo}) na ${p.descricao} ficou sem resposta da maquineta quando o app foi fechado.\n\nO pagamento foi aprovado? Confira o comprovante na maquineta.${fecha}`,
      [
        { text: 'Verificar depois', onPress: () => resolve() },
        {
          text: 'Não aprovado (descartar)',
          style: 'destructive',
          onPress: async () => { try { await concluirPendente(p.idLocal); } finally { resolve(); } },
        },
        {
          text: 'Aprovado (registrar manualmente)',
          onPress: async () => { try { await registrarManualmente(p); } finally { resolve(); } },
        },
      ],
      { cancelable: false },
    );
  });
}

export function PendingRecovery() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        await startInbox();
        const pendentes = await getPendentes();
        for (const p of pendentes) {
          if (p.cobrancaId) { await concluirPendente(p.idLocal); continue; }
          await perguntar(p);
        }
      } catch {}
    })();
  }, []);

  return null;
}
