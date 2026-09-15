import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, TextInput, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';
import { CIELO_PAYMENT_METHODS, CieloPaymentMethod } from '../../../models/CieloModel';

/** Pagamento Cielo aprovado, no formato devolvido por GET /cielo/pagamentos/:codMesa */
export type CieloPagamentoRecord = {
  id: number;
  meioPagamento: string;  // ex: "CREDITO_AVISTA"
  bandeira: string;
  valorPago: number;      // em R$
  authCode: string;
  nsu: string;
};

function methodLabel(code: string): string {
  return CIELO_PAYMENT_METHODS.find(m => m.code === code)?.label ?? code;
}

type Props = {
  isOpen: boolean;
  total: number;
  hasPending: boolean;
  hasCieloConfig: boolean;
  /** Pagamentos Cielo já aprovados para a comanda (controlado pelo pai; vem do servidor). */
  cieloPagamentos: CieloPagamentoRecord[];
  onConfirm: (destino: string) => void;
  /** Chamado uma única vez quando o total pago via Cielo atinge o total da conta. */
  onCieloComplete: () => void;
  onCieloPayment: (paymentCode: string, amountCents: number) => Promise<{ authCode: string } | null>;
  onCancel: () => void;
};

type Screen = 'main' | 'amount' | 'methods';

export function FechamentoModal({
  isOpen,
  total,
  hasPending,
  hasCieloConfig,
  cieloPagamentos,
  onConfirm,
  onCieloComplete,
  onCieloPayment,
  onCancel,
}: Props) {
  const [screen, setScreen] = useState<Screen>('main');
  const [inputAmount, setInputAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Valor já recebido via Cielo é derivado da lista controlada pelo pai
  // (carregada do servidor + pagamentos feitos nesta sessão). Assim, fechar o
  // modal ou reabrir a comanda não "esquece" o que já foi pago.
  const paidSoFar = cieloPagamentos.reduce((sum, p) => sum + p.valorPago, 0);
  const remaining = Math.max(total - paidSoFar, 0);
  // Conta totalmente recebida via Cielo: nenhuma nova cobrança pode ser acionada.
  const fullyPaid = paidSoFar > 0 && paidSoFar >= total - 0.009;
  const cieloDisabled = hasPending || fullyPaid;

  // Reseta apenas o estado de navegação ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setScreen('main');
      setInputAmount(remaining.toFixed(2));
      setProcessing(false);
      setSelectedMethod(null);
    }
  }, [isOpen]);

  // Atualiza inputAmount ao mudar o restante
  useEffect(() => {
    if (screen === 'amount') {
      setInputAmount(remaining.toFixed(2));
    }
  }, [screen]);

  function handleClose() {
    setScreen('main');
    onCancel();
  }

  function handleGoToAmount() {
    setInputAmount(remaining.toFixed(2));
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

  async function handleMethodSelect(method: CieloPaymentMethod) {
    if (fullyPaid) return; // defesa extra: total já recebido, não cobra de novo
    const val = parseFloat(inputAmount.replace(',', '.'));
    const amountCents = Math.round(val * 100);
    if (!amountCents || val > remaining + 0.009) return;

    setSelectedMethod(method.code);
    setProcessing(true);

    const result = await onCieloPayment(method.code, amountCents);

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

    if (newPaid >= total - 0.009) {
      // Total atingido — fecha a conta uma única vez e envia a solicitação de
      // impressão ao caixa (sinal para receber e emitir a NFC-e)
      onCieloComplete();
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
              Conta totalmente recebida via Cielo (R$ {paidSoFar.toFixed(2)}).
              Envie o fechamento ao caixa para concluir.
            </Text>
          </View>
        ) : paidSoFar > 0 ? (
          <View style={styles.paidInfo}>
            <Feather name="check-circle" size={14} color={COLORS.SUCCESS} />
            <Text style={styles.paidInfoText}>
              Já recebido via Cielo: R$ {paidSoFar.toFixed(2)} — restante R$ {remaining.toFixed(2)}
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
            <Text style={styles.btnText}>Pagar com Cielo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.btnClose, hasPending && styles.btnDisabled]}
          onPress={() => !hasPending && onConfirm('F')}
          disabled={hasPending}
        >
          <Feather name="x-circle" size={18} color={COLORS.WHITE} />
          <Text style={styles.btnText}>
            {fullyPaid ? 'Fechar conta e enviar ao caixa' : 'Fechar conta (sem Cielo)'}
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

  // ── Tela de valor ───────────────────────────────────────────────────────────
  function renderAmount() {
    const val = parseFloat(inputAmount.replace(',', '.'));
    const valid = !isNaN(val) && val > 0 && val <= remaining + 0.009;

    return (
      <>
        <TouchableOpacity style={styles.backRow} onPress={() => setScreen('main')}>
          <Feather name="arrow-left" size={16} color={COLORS.CYAN_300} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Valor do pagamento</Text>

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
                <Text style={styles.historyAuth}>Auth: {p.authCode}</Text>
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
          {CIELO_PAYMENT_METHODS.map((item, index) => {
            const isLoading = processing && selectedMethod === item.code;
            return (
              <View key={item.code}>
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
});
