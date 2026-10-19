import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, TextInput, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';
import { PAYMENT_METHODS, PaymentMethodOption, meioPagamentoLabel } from '../../../payment/types';
import { PagamentoRecord } from '../../../models/CobrancaModel';
import { ItemModel } from '../../../models/ItemModel';

/** Pagamento aprovado na maquineta, no formato de GET /pagamentos/M/:codMesa. */
export type CieloPagamentoRecord = PagamentoRecord;

function methodLabel(code: string): string {
  return meioPagamentoLabel(code);
}

/** Item (ou parte dele) escolhido pelo operador para compor o valor de uma cobrança. */
export type SelecaoItem = {
  /** MESAS_ITENS.CODIGO — chave estável (o mobileId muda a cada recarga). */
  codigo: string;
  /** COD_CONJUGA quando combinado; 0 caso contrário. */
  codConjuga: number;
  qtde: number;
  /** Valor em R$ (produto + serviço rateado) desta fatia. */
  valor: number;
};

/** Quanto de cada item já foi cobrado na maquineta (item.codigo → {qtde, valor}). Vem do servidor + sessão. */
export type PagoPorItem = Record<string, { qtde: number; valor: number }>;

/** Chave de `PagoPorItem` / `selecao` para um item. */
export const itemKey = (item: ItemModel) => String(item.codigo);

const round2 = (v: number) => Math.round(v * 100) / 100;
const EPS = 1e-6;

/** Item fracionado (kg) ou combinado: seleção é tudo-ou-nada. */
function isIndivisible(item: ItemModel): boolean {
  return item.combinado || item.quantidade % 1 !== 0;
}

function fmtQtde(q: number): string {
  return q % 1 === 0 ? String(q) : q.toFixed(3).replace(/\.?0+$/, '');
}

/**
 * Valor (R$) de uma fatia `qtdeSel` do item, considerando o que já foi pago.
 * A última fatia fecha exatamente com `total + servico − jáPago`, para que a
 * soma das partes nunca divirja do total por arredondamento.
 */
export function calcParcial(
  item: ItemModel,
  qtdeSel: number,
  pago?: { qtde: number; valor: number },
): number {
  if (qtdeSel <= 0 || item.quantidade <= 0) return 0;
  const totalItem = round2(item.total + (item.servico ?? 0));
  const pagoQtde = pago?.qtde ?? 0;
  const pagoValor = pago?.valor ?? 0;
  const disponivel = item.quantidade - pagoQtde;
  if (qtdeSel >= disponivel - EPS) return round2(totalItem - pagoValor);
  return round2(totalItem * (qtdeSel / item.quantidade));
}

type Props = {
  isOpen: boolean;
  total: number;
  hasPending: boolean;
  /** Provedor de pagamento (Cielo/Stone) configurado neste aparelho. */
  hasCieloConfig: boolean;
  /** Pagamentos já aprovados na maquineta para a comanda (controlado pelo pai; vem do servidor). */
  cieloPagamentos: PagamentoRecord[];
  /** Itens já enviados da comanda (base para "Selecionar itens"). */
  items: ItemModel[];
  /** Quanto de cada item já foi cobrado na maquineta (controlado pelo pai). */
  pagoPorItem: PagoPorItem;
  onConfirm: (destino: string) => void;
  /** Chamado uma única vez quando o total pago na maquineta atinge o total da conta. */
  onCieloComplete: () => void;
  onCieloPayment: (
    method: PaymentMethodOption,
    amountCents: number,
    selecao: SelecaoItem[],
  ) => Promise<{ authCode: string } | null>;
  onCancel: () => void;
};

type Screen = 'main' | 'select' | 'amount' | 'methods';

export function FechamentoModal({
  isOpen,
  total,
  hasPending,
  hasCieloConfig,
  cieloPagamentos,
  items,
  pagoPorItem,
  onConfirm,
  onCieloComplete,
  onCieloPayment,
  onCancel,
}: Props) {
  const [screen, setScreen] = useState<Screen>('main');
  const [inputAmount, setInputAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  // Seleção de itens para a cobrança atual (mobileId → quantidade marcada).
  const [selecao, setSelecao] = useState<Record<string, number>>({});

  // Valor já recebido na maquineta é derivado da lista controlada pelo pai
  // (carregada do servidor + pagamentos feitos nesta sessão). Assim, fechar o
  // modal ou reabrir a comanda não "esquece" o que já foi pago.
  const paidSoFar = cieloPagamentos.reduce((sum, p) => sum + p.valorPago, 0);
  const remaining = Math.max(total - paidSoFar, 0);
  // Conta totalmente recebida na maquineta: nenhuma nova cobrança pode ser acionada.
  const fullyPaid = paidSoFar > 0 && paidSoFar >= total - 0.009;
  const cieloDisabled = hasPending || fullyPaid;

  // Reseta apenas o estado de navegação ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setScreen('main');
      setInputAmount(remaining.toFixed(2));
      setProcessing(false);
      setSelectedMethod(null);
      setSelecao({});
    }
  }, [isOpen]);

  function handleClose() {
    setScreen('main');
    onCancel();
  }

  function handleGoToAmount() {
    setSelecao({});
    setInputAmount(remaining.toFixed(2));
    setScreen('amount');
  }

  // ── Seleção de itens ────────────────────────────────────────────────────────
  const disponivelDe = (item: ItemModel) =>
    Math.max(item.quantidade - (pagoPorItem[itemKey(item)]?.qtde ?? 0), 0);

  const selecaoLista: SelecaoItem[] = items
    .filter(i => (selecao[itemKey(i)] ?? 0) > 0)
    .map(i => ({
      codigo: itemKey(i),
      codConjuga: i.combinado ? Number(i.codCombinado) || 0 : 0,
      qtde: selecao[itemKey(i)],
      valor: calcParcial(i, selecao[itemKey(i)], pagoPorItem[itemKey(i)]),
    }));
  const selecaoTotal = round2(selecaoLista.reduce((s, x) => s + x.valor, 0));
  const selecaoCount = selecaoLista.length;

  // Ao entrar na tela de valor pelo caminho livre, sugere o restante.
  // Com itens selecionados, o valor já vem da seleção (handleUsarSelecao).
  useEffect(() => {
    if (screen === 'amount' && selecaoCount === 0) {
      setInputAmount(remaining.toFixed(2));
    }
  }, [screen]);


  function setQtdeSel(item: ItemModel, qtde: number) {
    const max = disponivelDe(item);
    const q = Math.min(Math.max(qtde, 0), max);
    setSelecao(prev => {
      const next = { ...prev };
      if (q <= 0) delete next[itemKey(item)]; else next[itemKey(item)] = q;
      return next;
    });
  }

  function toggleItem(item: ItemModel) {
    const max = disponivelDe(item);
    if (max <= 0) return;
    setQtdeSel(item, (selecao[itemKey(item)] ?? 0) > 0 ? 0 : max);
  }

  function selecionarTudo() {
    const next: Record<string, number> = {};
    items.forEach(i => { const d = disponivelDe(i); if (d > 0) next[itemKey(i)] = d; });
    setSelecao(next);
  }

  function handleGoToSelect() {
    setScreen('select');
  }

  function handleUsarSelecao() {
    if (selecaoTotal <= 0) return;
    setInputAmount(Math.min(selecaoTotal, remaining).toFixed(2));
    setScreen('amount');
  }

  function handleConfirmAmount() {
    const val = parseFloat(inputAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;
    if (val > remaining + 0.009) {
      // valor não pode exceder o restante
      setInputAmount(remaining.toFixed(2));
      return;
    }
    setScreen('methods');
  }

  async function handleMethodSelect(method: PaymentMethodOption) {
    if (fullyPaid) return; // defesa extra: total já recebido, não cobra de novo
    const val = parseFloat(inputAmount.replace(',', '.'));
    const amountCents = Math.round(val * 100);
    if (!amountCents || val > remaining + 0.009) return;

    setSelectedMethod(method.key);
    setProcessing(true);

    // Só vincula os itens à cobrança se o operador não alterou o valor sugerido.
    const selecaoEfetiva =
      selecaoCount > 0 && Math.abs(selecaoTotal - val) < 0.005 ? selecaoLista : [];

    const result = await onCieloPayment(method, amountCents, selecaoEfetiva);

    setProcessing(false);
    setSelectedMethod(null);

    if (!result) {
      // Falha — volta para a tela de valor para tentar novamente
      setScreen('amount');
      return;
    }

    // O pai já adicionou o pagamento em cieloPagamentos; calculamos aqui com o
    // valor local para não depender do re-render.
    const newPaid = paidSoFar + val;
    const veioDaSelecao = selecaoEfetiva.length > 0;
    setSelecao({});

    if (newPaid >= total - 0.009) {
      // Total atingido — fecha a conta uma única vez e envia a solicitação de
      // impressão ao caixa (sinal para receber e emitir a NFC-e)
      onCieloComplete();
    } else if (veioDaSelecao) {
      // Ainda há saldo — volta direto para a seleção do próximo cliente
      // (itens já pagos aparecem riscados; seleção limpa).
      setScreen('select');
    } else {
      // Ainda há saldo — volta para tela de valor
      setInputAmount((total - newPaid).toFixed(2));
      setScreen('amount');
    }
  }

  // ── Tela principal ──────────────────────────────────────────────────────────
  function renderMain() {
    return (
      <>
        <Text style={styles.title}>Fechar conta</Text>
        <Text style={styles.subtitle}>Total da comanda</Text>
        <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>

        {fullyPaid ? (
          <View style={styles.paidInfo}>
            <Feather name="check-circle" size={14} color={COLORS.SUCCESS} />
            <Text style={styles.paidInfoText}>
              Conta totalmente recebida na maquineta (R$ {paidSoFar.toFixed(2)}).
              Envie o fechamento ao caixa para concluir.
            </Text>
          </View>
        ) : paidSoFar > 0 ? (
          <View style={styles.paidInfo}>
            <Feather name="check-circle" size={14} color={COLORS.SUCCESS} />
            <Text style={styles.paidInfoText}>
              Já recebido na maquineta: R$ {paidSoFar.toFixed(2)} — restante R$ {remaining.toFixed(2)}
            </Text>
          </View>
        ) : null}

        {hasPending && (
          <View style={styles.warning}>
            <Feather name="alert-triangle" size={14} color={COLORS.GOLD_500} />
            <Text style={styles.warningText}>
              Há itens não enviados. Envie o pedido antes de fechar.
            </Text>
          </View>
        )}

        {hasCieloConfig && (
          <TouchableOpacity
            style={[styles.btn, styles.btnCielo, cieloDisabled && styles.btnDisabled]}
            onPress={() => {
              if (cieloDisabled) return;
              handleGoToAmount();
            }}
            disabled={cieloDisabled}
          >
            <Feather name="credit-card" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>Pagar na maquineta</Text>
          </TouchableOpacity>
        )}

        {hasCieloConfig && items.length > 0 && (
          <TouchableOpacity
            style={[styles.btn, styles.btnSelect, cieloDisabled && styles.btnDisabled]}
            onPress={() => {
              if (cieloDisabled) return;
              handleGoToSelect();
            }}
            disabled={cieloDisabled}
          >
            <Feather name="check-square" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>Selecionar itens para cobrar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.btnClose, hasPending && styles.btnDisabled]}
          onPress={() => !hasPending && onConfirm('F')}
          disabled={hasPending}
        >
          <Feather name="x-circle" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>
            {fullyPaid ? 'Fechar conta e enviar ao caixa' : 'Fechar conta (sem maquineta)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrint]}
          onPress={() => onConfirm('C')}
        >
          <Feather name="printer" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>Solicitar impressão</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </>
    );
  }

  // ── Tela de seleção de itens ────────────────────────────────────────────────
  function renderSelect() {
    return (
      <>
        <TouchableOpacity style={styles.backRow} onPress={() => setScreen('main')}>
          <Feather name="arrow-left" size={16} color={COLORS.CYAN_300} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Selecionar itens</Text>
        <Text style={styles.subtitle}>Marque o que este cliente vai pagar</Text>

        {paidSoFar > 0 && (
          <View style={styles.paidInfo}>
            <Feather name="check-circle" size={14} color={COLORS.SUCCESS} />
            <Text style={styles.paidInfoText}>
              Já recebido na maquineta: R$ {paidSoFar.toFixed(2)} — restante R$ {remaining.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.selectToolbar}>
          <TouchableOpacity onPress={selecionarTudo}>
            <Text style={styles.selectToolbarBtn}>Selecionar tudo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelecao({})}>
            <Text style={styles.selectToolbarBtn}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectList}>
          {items.map((item, index) => {
            const disponivel = disponivelDe(item);
            const pago = pagoPorItem[itemKey(item)];
            const sel = selecao[itemKey(item)] ?? 0;
            const esgotado = disponivel <= EPS;
            const indivisivel = isIndivisible(item);
            const valorSel = calcParcial(item, sel, pago);
            const unit = item.quantidade > 0
              ? round2((item.total + (item.servico ?? 0)) / item.quantidade)
              : 0;
            return (
              <View key={item.mobileId}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={[styles.selectRow, esgotado && styles.selectRowPaid]}
                  onPress={() => toggleItem(item)}
                  disabled={esgotado}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={esgotado ? 'check-circle' : sel > 0 ? 'check-square' : 'square'}
                    size={20}
                    color={esgotado ? COLORS.GRAY_400 : sel > 0 ? COLORS.CYAN_500 : COLORS.GRAY_400}
                  />
                  <View style={styles.selectInfo}>
                    <Text style={[styles.selectName, esgotado && styles.selectTextPaid]} numberOfLines={2}>
                      {item.descricao}
                    </Text>
                    <Text style={styles.selectDetails}>
                      {esgotado
                        ? `Pago (${fmtQtde(item.quantidade)}x)`
                        : indivisivel
                          ? `${fmtQtde(item.quantidade)} ${item.unidade?.trim() || 'un'} • R$ ${round2(item.total + (item.servico ?? 0)).toFixed(2)}`
                          : `${fmtQtde(disponivel)} de ${fmtQtde(item.quantidade)} disponível • R$ ${unit.toFixed(2)} cada`}
                      {pago && !esgotado ? ` • já pago R$ ${pago.valor.toFixed(2)}` : ''}
                    </Text>
                    {sel > 0 && (
                      <Text style={styles.selectValue}>
                        {fmtQtde(sel)}x = R$ {valorSel.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  {!esgotado && !indivisivel && disponivel > 1 && (
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQtdeSel(item, sel - 1)}
                        disabled={sel <= 0}
                      >
                        <Text style={[styles.stepperText, sel <= 0 && styles.btnDisabled]}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{sel}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQtdeSel(item, sel + 1)}
                        disabled={sel >= disponivel}
                      >
                        <Text style={[styles.stepperText, sel >= disponivel && styles.btnDisabled]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Itens selecionados</Text>
            <Text style={styles.summaryValue}>{selecaoCount}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
            <Text style={[styles.summaryLabel, { color: COLORS.WHITE }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: COLORS.GOLD_500, fontSize: FONT_SIZE.MD }]}>
              R$ {selecaoTotal.toFixed(2)}
            </Text>
          </View>
          {selecaoTotal > remaining + 0.009 && (
            <Text style={styles.selectHint}>
              Seleção acima do restante (R$ {remaining.toFixed(2)}); será limitada ao restante.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnCielo, selecaoTotal <= 0 && styles.btnDisabled]}
          onPress={handleUsarSelecao}
          disabled={selecaoTotal <= 0}
        >
          <Feather name="arrow-right" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>
            Cobrar R$ {Math.min(selecaoTotal, remaining).toFixed(2)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </>
    );
  }

  // ── Tela de valor ───────────────────────────────────────────────────────────
  function renderAmount() {
    const val = parseFloat(inputAmount.replace(',', '.'));
    const valid = !isNaN(val) && val > 0 && val <= remaining + 0.009;

    return (
      <>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => setScreen(selecaoCount > 0 ? 'select' : 'main')}
        >
          <Feather name="arrow-left" size={16} color={COLORS.CYAN_300} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Valor do pagamento</Text>
        {selecaoCount > 0 && (
          <Text style={styles.subtitle}>
            {selecaoCount} {selecaoCount === 1 ? 'item selecionado' : 'itens selecionados'} — R$ {selecaoTotal.toFixed(2)}
          </Text>
        )}

        {/* Resumo */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total da conta</Text>
            <Text style={styles.summaryValue}>R$ {total.toFixed(2)}</Text>
          </View>
          {paidSoFar > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Já pago</Text>
              <Text style={[styles.summaryValue, { color: COLORS.SUCCESS }]}>
                R$ {paidSoFar.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
            <Text style={[styles.summaryLabel, { color: COLORS.WHITE }]}>Restante</Text>
            <Text style={[styles.summaryValue, { color: COLORS.GOLD_500 }]}>
              R$ {remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Histórico de pagamentos anteriores */}
        {cieloPagamentos.length > 0 && (
          <View style={styles.historyBox}>
            {cieloPagamentos.map((p, i) => (
              <View key={p.id ?? i} style={styles.historyRow}>
                <Feather name="check-circle" size={13} color={COLORS.SUCCESS} />
                <Text style={styles.historyText}>
                  R$ {p.valorPago.toFixed(2)} — {methodLabel(p.meioPagamento)}
                </Text>
                <Text style={styles.historyAuth}>
                  Auth: {p.authCode}{p.pendenteSync ? ' (a sincronizar)' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Input de valor */}
        <Text style={styles.inputLabel}>Valor a receber agora</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currencyPrefix}>R$</Text>
          <TextInput
            style={styles.amountInput}
            value={inputAmount}
            onChangeText={setInputAmount}
            keyboardType="decimal-pad"
            selectTextOnFocus
            placeholderTextColor={COLORS.GRAY_400}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnCielo, !valid && styles.btnDisabled]}
          onPress={handleConfirmAmount}
          disabled={!valid}
        >
          <Feather name="arrow-right" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>Escolher forma de pagamento</Text>
        </TouchableOpacity>

        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.btn, styles.btnSelect]}
            onPress={() => { setSelecao({}); setScreen('select'); }}
          >
            <Feather name="check-square" size={18} color={COLORS.WHITE} />
            <Text style={styles.btnText}>
              {selecaoCount > 0 ? 'Alterar itens selecionados' : 'Selecionar itens para cobrar'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </>
    );
  }

  // ── Tela de meios de pagamento ──────────────────────────────────────────────
  function renderMethods() {
    const val = parseFloat(inputAmount.replace(',', '.'));

    return (
      <>
        <TouchableOpacity style={styles.backRow} onPress={() => setScreen('amount')}>
          <Feather name="arrow-left" size={16} color={COLORS.CYAN_300} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Meio de pagamento</Text>
        <Text style={styles.subtitle}>
          Valor: <Text style={{ color: COLORS.GOLD_500, fontFamily: FONT_FAMILY.BOLD }}>
            R$ {isNaN(val) ? '0,00' : val.toFixed(2)}
          </Text>
        </Text>

        <View style={styles.methodList}>
          {PAYMENT_METHODS.map((item, index) => {
            const isLoading = processing && selectedMethod === item.key;
            return (
              <View key={item.key}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={[styles.methodItem, processing && styles.btnDisabled]}
                  onPress={() => !processing && handleMethodSelect(item)}
                  disabled={processing}
                >
                  <Feather
                    name={isLoading ? 'loader' : 'credit-card'}
                    size={16}
                    color={COLORS.CYAN_500}
                  />
                  <Text style={styles.methodLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.GRAY_400} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.cancelBtn, processing && styles.btnDisabled]}
          onPress={handleClose}
          disabled={processing}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {screen === 'main'    && renderMain()}
          {screen === 'select'  && renderSelect()}
          {screen === 'amount'  && renderAmount()}
          {screen === 'methods' && renderMethods()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: '#00000088',
    justifyContent: 'center', padding: 24,
  },
  container: {
    backgroundColor: COLORS.SURFACE_800,
    borderRadius: 12, padding: 24, alignItems: 'center',
  },

  // Cabeçalho
  title: {
    color: COLORS.WHITE, fontSize: FONT_SIZE.LG,
    fontFamily: FONT_FAMILY.BOLD, marginBottom: 4, textAlign: 'center',
  },
  subtitle: {
    color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, marginTop: 4, textAlign: 'center',
  },
  totalValue: {
    color: COLORS.GOLD_500, fontSize: 36,
    fontFamily: FONT_FAMILY.BOLD, marginVertical: 16,
  },

  // Aviso itens pendentes
  warning: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: `${COLORS.GOLD_500}22`, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.GOLD_700,
    padding: 10, marginBottom: 16, width: '100%',
  },
  warningText: {
    color: COLORS.GOLD_300, fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.REGULAR, flex: 1,
  },

  // Parciais já recebidos (tela principal)
  paidInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: `${COLORS.SUCCESS}11`, borderRadius: 8,
    borderWidth: 1, borderColor: `${COLORS.SUCCESS}33`,
    padding: 10, marginBottom: 16, width: '100%',
  },
  paidInfoText: {
    color: COLORS.SUCCESS, fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.REGULAR, flex: 1,
  },

  // Botões
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%', height: 52, borderRadius: 8, marginBottom: 10,
  },
  btnCielo:    { backgroundColor: COLORS.CYAN_700 },
  btnSelect:   { backgroundColor: COLORS.SURFACE_600, borderWidth: 1, borderColor: COLORS.CYAN_700 },
  btnClose:    { backgroundColor: COLORS.DANGER },
  btnPrint:    { backgroundColor: COLORS.SURFACE_600 },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD,
  },
  cancelBtn:  { marginTop: 4, padding: 10 },
  cancelText: {
    color: COLORS.GRAY_400, fontSize: FONT_SIZE.MD,
    fontFamily: FONT_FAMILY.REGULAR,
  },

  // Navegação
  backRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  backText: { color: COLORS.CYAN_300, fontSize: FONT_SIZE.SM },

  // Resumo financeiro
  summaryBox: {
    width: '100%', backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8, padding: 12, marginBottom: 16, gap: 8,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  summaryRowHighlight: {
    marginTop: 4, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: COLORS.SURFACE_600,
  },
  summaryLabel: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM },
  summaryValue: {
    color: COLORS.WHITE, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD,
  },

  // Histórico
  historyBox: {
    width: '100%', backgroundColor: `${COLORS.SUCCESS}11`,
    borderRadius: 8, borderWidth: 1, borderColor: `${COLORS.SUCCESS}33`,
    padding: 10, marginBottom: 12, gap: 6,
  },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  historyText: { color: COLORS.SUCCESS, fontSize: FONT_SIZE.SM, flex: 1 },
  historyAuth: { color: COLORS.GRAY_400, fontSize: 12 },

  // Input de valor
  inputLabel: {
    color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.BOLD, alignSelf: 'flex-start', marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.SURFACE_600, borderRadius: 8,
    paddingHorizontal: 12, width: '100%', marginBottom: 16,
  },
  currencyPrefix: {
    color: COLORS.GRAY_400, fontSize: FONT_SIZE.MD, marginRight: 6,
  },
  amountInput: {
    flex: 1, color: COLORS.WHITE,
    fontSize: 24, fontFamily: FONT_FAMILY.BOLD,
    paddingVertical: 12,
  },

  // Meios de pagamento
  methodList: { width: '100%' },
  methodItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 4,
  },
  methodLabel: {
    flex: 1, color: COLORS.WHITE,
    fontSize: FONT_SIZE.MD, fontFamily: FONT_FAMILY.REGULAR,
  },
  separator: { height: 1, backgroundColor: COLORS.SURFACE_600 },

  // Seleção de itens
  selectToolbar: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginTop: 12, marginBottom: 6, paddingHorizontal: 4,
  },
  selectToolbarBtn: {
    color: COLORS.CYAN_300, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD, padding: 4,
  },
  selectList: {
    width: '100%', backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8, paddingHorizontal: 8, marginBottom: 12,
  },
  selectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
  },
  selectRowPaid: { opacity: 0.45 },
  selectInfo: { flex: 1 },
  selectName: {
    color: COLORS.WHITE, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD,
  },
  selectTextPaid: { textDecorationLine: 'line-through', color: COLORS.GRAY_200 },
  selectDetails: { color: COLORS.GRAY_200, fontSize: 12, marginTop: 2 },
  selectValue: {
    color: COLORS.GOLD_500, fontSize: 12, fontFamily: FONT_FAMILY.BOLD, marginTop: 2,
  },
  selectHint: { color: COLORS.GOLD_300, fontSize: 12, marginTop: 6 },
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.CYAN_700, borderRadius: 8, overflow: 'hidden',
  },
  stepperBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.SURFACE_600,
  },
  stepperText: { color: COLORS.CYAN_500, fontSize: 20, fontFamily: FONT_FAMILY.BOLD },
  stepperValue: {
    minWidth: 32, textAlign: 'center', color: COLORS.WHITE,
    fontSize: FONT_SIZE.MD, fontFamily: FONT_FAMILY.BOLD,
  },
});
