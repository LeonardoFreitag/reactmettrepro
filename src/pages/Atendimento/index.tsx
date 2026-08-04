import React, { useEffect, useRef, useState } from 'react';
import uuid from 'react-native-uuid';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { loadItemList, updateItemList, deleteItemList, clearItemList, createItemList } from '../../store/ducks/itemList/actions';
import { createItemEdit, clearItemEdit } from '../../store/ducks/itemEdit/actions';
import { clearProdutoEdit } from '../../store/ducks/produtoEdit/actions';
import { clearComandaEdit } from '../../store/ducks/comandaEdit/actions';
import { setUrl } from '../../services/api';
import { ItemModel } from '../../models/ItemModel';
import { FlavorList } from '../../components/FlavorList';
import { AlertDialogModal } from '../../components/AlertDialogModal';
import { MesaDestinoModal } from './MesaDestinoModal';
import { FechamentoModal } from './FechamentoModal';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { useCieloDeepLink } from '../../hooks/useCieloDeepLink';

type Nav = NativeStackNavigationProp<AppStackParamList, 'atendimento'>;

export function Atendimento() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const companyEdit   = useSelector((state: RootState) => state.companyEdit.data);
  const configEdit    = useSelector((state: RootState) => state.configEdit.data);
  const comandaEdit   = useSelector((state: RootState) => state.comandaEdit.data);
  const atendenteEdit = useSelector((state: RootState) => state.atendenteEdit.data);
  const itemList      = useSelector((state: RootState) => state.itemList.data);

  const [deleteTarget, setDeleteTarget] = useState<ItemModel | null>(null);
  const [showDestino, setShowDestino]   = useState(false);
  const [showFechamento, setShowFechamento] = useState(false);
  const [sending, setSending] = useState(false);

  const { sendPayment, isWaiting: cieloWaiting } = useCieloDeepLink();

  // Ref para itens pendentes — evita closure stale entre setPendingItems e sendItems
  const pendingRef = useRef<ItemModel[]>([]);

  // Ref sempre atualizado para evitar closure stale no loadItems
  const itemListRef = useRef(itemList);
  useEffect(() => { itemListRef.current = itemList; }, [itemList]);

  const isClosed = comandaEdit.status?.trim() === 'F';

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    if (!comandaEdit.codigo || !companyEdit.ip) return;
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const { data } = await api.get<ItemModel[]>(`/itens/${comandaEdit.codigo}`);
      const serverItems = data.map(i => ({
        ...i,
        enviado: 'S',
        mobileId: i.mobileId || (uuid.v4() as string),
        flavors: (i.flavors ?? []).map(f => ({
          ...f,
          mobileId: f.mobileId || (uuid.v4() as string),
        })),
      }));
      const serverIds = new Set(serverItems.map(i => i.mobileId));
      const localPending = itemListRef.current.filter(
        i => i.enviado !== 'S' && !serverIds.has(i.mobileId)
      );
      dispatch(loadItemList([...serverItems, ...localPending]));
    } catch {}
  }

  function buildPayload(items: ItemModel[], destino: string): object[] {
    const codMesa = Number(comandaEdit.codigo);
    return items.map(item => {
      if (item.combinado) {
        return {
          combinado: true,
          flavors: item.flavors.map(f => ({
            codMesa,
            codProduto:   f.produtoCodigo,
            qtde:         f.quantidade,
            obs:          f.obs ?? '',
            codAtendente: atendenteEdit.codigo,
            destino,
            mobileId:     f.mobileId,
          })),
        };
      }
      return {
        codMesa,
        codProduto:   item.produtoCodigo,
        qtde:         item.quantidade,
        obs:          item.obs ?? '',
        codAtendente: atendenteEdit.codigo,
        destino,
        mobileId:     item.mobileId,
        combinado:    false,
      };
    });
  }

  async function sendItems(items: ItemModel[], destino: string) {
    setSending(true);
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const payload = buildPayload(items, destino);
      await api.put('/itens', payload);
      items.forEach(item => dispatch(updateItemList({ ...item, enviado: 'S' })));
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar os itens.');
    } finally {
      setSending(false);
    }
  }

  function handleEnviarPedido() {
    const toSend = itemList.filter(i => i.enviado !== 'S');
    if (!toSend.length) return Alert.alert('Aviso', 'Não há itens para enviar.');
    pendingRef.current = toSend;
    if (configEdit.destino) {
      setShowDestino(true);
    } else {
      sendItems(toSend, '');
    }
  }

  async function handleFechamento(destino: string) {
    setShowFechamento(false);
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const { data } = await api.post<{ fechouConta: boolean }>(
        '/mesas/fechaConta',
        { codigo: comandaEdit.codigo, destino }
      );
      if (data.fechouConta) {
        dispatch(clearItemList());
        dispatch(clearComandaEdit());
        navigation.navigate('comandas');
      } else {
        Alert.alert('Impressão solicitada', 'A comanda foi enviada para impressão no caixa.');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 500) {
        Alert.alert(
          'Atenção',
          'Ocorreu um erro no servidor. Verifique se a conta foi fechada antes de tentar novamente.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a operação. Verifique a conexão.');
      }
    }
  }

  /**
   * Fecha a comanda no servidor assim que o usuário opta por pagar com Cielo,
   * antes de seguir com o fluxo de pagamento. Falha silenciosa: não bloqueia o fluxo.
   */
  function handleCieloStart() {
    const api = setUrl(companyEdit.ip, companyEdit.porta);
    api.post('/mesas/fechaConta', { codigo: comandaEdit.codigo, destino: 'F' }).catch(() => {});
  }

  /**
   * Fluxo Cielo: dispara deep link → aguarda resposta → salva no banco.
   * Retorna { authCode } em caso de sucesso ou null em falha.
   * Quem decide fechar a conta é o FechamentoModal (quando o total pago for atingido).
   */
  async function handleCieloPayment(
    paymentCode: string,
    amountCents: number,
  ): Promise<{ authCode: string } | null> {
    const cieloItems = itemList.map(item => {
      const qty = Math.round(item.quantidade);
      const isInteger = qty === item.quantidade;
      return {
        name:      item.descricao,
        // Cielo exige quantity inteiro; se for fracionado, envia 1 e coloca o total no unitPrice
        quantity:  isInteger ? qty : 1,
        sku:       item.produtoCodigo,
        unitPrice: isInteger
          ? Math.round(item.unitario * 100)
          : Math.round(item.total * 100),
      };
    });

    const result = await sendPayment({
      accessToken: configEdit.cieloAccessToken,
      clientID:    configEdit.cieloClientId,
      totalCents:  amountCents,
      items:       cieloItems,
      paymentCode,
      reference:   `Comanda ${comandaEdit.comanda}`,
    });

    if (!result.success) {
      Alert.alert('Pagamento não concluído', result.error);
      return null;
    }

    return salvarPagamentoCielo(paymentCode, result.data);
  }

  /**
   * Persiste os dados do pagamento Cielo na API (Firebird).
   * Falha não-bloqueante: pagamento já aprovado na Cielo.
   * Retorna authCode em caso de sucesso ou após o operador escolher prosseguir.
   */
  async function salvarPagamentoCielo(
    paymentCode: string,
    cieloResponse: any,
  ): Promise<{ authCode: string } | null> {
    const authCode = cieloResponse.payments?.[0]?.authCode ?? '-';

    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      await api.post('/cielo/pagamento', {
        codMesa:       Number(comandaEdit.codigo),
        paymentCode,
        cieloResponse,
      });
      return { authCode };
    } catch {
      return new Promise(resolve => {
        Alert.alert(
          'Pagamento aprovado',
          `Autorização: ${authCode}\n\nAtenção: não foi possível registrar no servidor. Anote o código e registre manualmente.`,
          [
            {
              text: 'Tentar novamente',
              onPress: async () => resolve(await salvarPagamentoCielo(paymentCode, cieloResponse)),
            },
            {
              text: 'Prosseguir assim mesmo',
              style: 'destructive',
              onPress: () => resolve({ authCode }),
            },
          ],
        );
      });
    }
  }

  function handleDelete() {
    if (deleteTarget) dispatch(deleteItemList(deleteTarget.mobileId));
    setDeleteTarget(null);
  }

  function handleEdit(item: ItemModel) {
    dispatch(createItemEdit(item));
    navigation.navigate('lancaPorCodigo');
  }

  function handleRepeat(item: ItemModel) {
    if (isClosed) return;
    const repeated: ItemModel = {
      ...item,
      mobileId: Date.now().toString(),
      enviado: '',
      repeat: true,
    };
    dispatch(createItemList(repeated));
  }

  const totalProdutos = itemList.reduce((sum, i) => sum + i.total, 0);
  const totalServico  = itemList.reduce((sum, i) => sum + (i.servico ?? 0), 0);
  const total         = totalProdutos + totalServico;
  const impresso    = itemList.filter(i => i.impresso?.trim() === 'S');
  const naoImpresso = itemList.filter(i => i.impresso?.trim() !== 'S');
  const hasCieloConfig = !!(configEdit.cieloClientId && configEdit.cieloAccessToken);

  function renderItem({ item }: { item: ItemModel }) {
    const sent = item.enviado?.trim() === 'S';
    const disabledColor = COLORS.GRAY_400;
    return (
      <View style={[styles.itemCard, !sent && styles.itemPending]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.descricao}</Text>
          <Text style={styles.itemDetails}>
            {item.quantidade % 1 === 0 ? item.quantidade : item.quantidade.toFixed(2)}x
            {' • '}R$ {item.total.toFixed(2)}
            {(item.servico ?? 0) > 0
              ? ` + R$ ${item.servico!.toFixed(2)} serv. = R$ ${(item.total + item.servico!).toFixed(2)}`
              : ''}
          </Text>
          {!!item.obs && <Text style={styles.itemObs}>{item.obs}</Text>}
          {item.combinado && item.flavors.length > 0 && <FlavorList flavors={item.flavors} />}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionBtn, sent && styles.actionDisabled]}
            onPress={() => !sent && handleEdit(item)}
            disabled={sent}
          >
            <Feather name="edit-2" size={15} color={sent ? disabledColor : COLORS.CYAN_500} />
            <Text style={[styles.actionLabel, { color: sent ? disabledColor : COLORS.CYAN_500 }]}>
              Editar
            </Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity
            style={[styles.actionBtn, isClosed && styles.actionDisabled]}
            onPress={() => handleRepeat(item)}
            disabled={isClosed}
          >
            <Feather name="copy" size={15} color={isClosed ? disabledColor : COLORS.GRAY_200} />
            <Text style={[styles.actionLabel, { color: isClosed ? disabledColor : COLORS.GRAY_200 }]}>
              Repetir
            </Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity
            style={[styles.actionBtn, sent && styles.actionDisabled]}
            onPress={() => !sent && setDeleteTarget(item)}
            disabled={sent}
          >
            <Feather name="trash-2" size={15} color={sent ? disabledColor : COLORS.DANGER} />
            <Text style={[styles.actionLabel, { color: sent ? disabledColor : COLORS.DANGER }]}>
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 16 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('comandas')}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comanda {comandaEdit.comanda}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          {totalServico > 0 && (
            <Text style={styles.headerSubtotal}>
              R$ {totalProdutos.toFixed(2)} + R$ {totalServico.toFixed(2)} serv.
            </Text>
          )}
          <Text style={styles.headerTotal}>R$ {total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Indicador Cielo aguardando retorno */}
      {cieloWaiting && (
        <View style={styles.cieloBanner}>
          <ActivityIndicator size="small" color={COLORS.CYAN_300} />
          <Text style={styles.cieloBannerText}>Aguardando retorno da Cielo...</Text>
        </View>
      )}

      {/* Aviso de comanda fechada */}
      {isClosed && (
        <View style={styles.closedBanner}>
          <Feather name="lock" size={14} color={COLORS.DANGER} />
          <Text style={styles.closedBannerText}>
            Comanda fechada — apenas fechamento e impressão disponíveis
          </Text>
        </View>
      )}

      <FlatList
        data={[...naoImpresso, ...impresso]}
        keyExtractor={item => item.mobileId}
        renderItem={renderItem}
        extraData={itemList}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum item na comanda</Text>}
        contentContainerStyle={{ paddingBottom: 160 + insets.bottom }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.footerBtn, isClosed && styles.footerBtnDisabled]}
            onPress={() => {
              if (isClosed) return;
              dispatch(clearItemEdit());
              dispatch(clearProdutoEdit());
              navigation.navigate('lancaPorCodigo');
            }}
            disabled={isClosed}
          >
            <Feather name="hash" size={16} color={COLORS.WHITE} />
            <Text style={styles.footerBtnText}>Código</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, isClosed && styles.footerBtnDisabled]}
            onPress={() => !isClosed && navigation.navigate('listaPorSubgrupo')}
            disabled={isClosed}
          >
            <Feather name="list" size={16} color={COLORS.WHITE} />
            <Text style={styles.footerBtnText}>Lista</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, isClosed && styles.footerBtnDisabled]}
            onPress={() => !isClosed && navigation.navigate('gruposDeCombinados')}
            disabled={isClosed}
          >
            <Feather name="layers" size={16} color={COLORS.WHITE} />
            <Text style={styles.footerBtnText}>Combinados</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.btnSend, (sending || isClosed) && { opacity: 0.7 }]}
            onPress={handleEnviarPedido}
            disabled={sending || isClosed}
          >
            {sending
              ? <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
              : <Feather name="send" size={16} color={COLORS.BACKGROUND} />
            }
            <Text style={[styles.footerBtnText, { color: COLORS.BACKGROUND }]}>
              {sending ? 'Enviando...' : 'Enviar pedido'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, styles.btnClose]}
            onPress={() => setShowFechamento(true)}
          >
            <Feather name="x-circle" size={16} color={COLORS.WHITE} />
            <Text style={styles.footerBtnText}>Fechar conta</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AlertDialogModal
        title="Excluir item"
        bodyText={`Excluir "${deleteTarget?.descricao}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isOpen={!!deleteTarget}
        handleConfirm={handleDelete}
        handleCancel={() => setDeleteTarget(null)}
      />
      <MesaDestinoModal
        isOpen={showDestino}
        onConfirm={(d) => { setShowDestino(false); sendItems(pendingRef.current, d); }}
        onCancel={() => setShowDestino(false)}
      />
      <FechamentoModal
        isOpen={showFechamento}
        total={total}
        hasPending={naoImpresso.some(i => i.enviado !== 'S')}
        hasCieloConfig={hasCieloConfig}
        onConfirm={handleFechamento}
        onCieloStart={handleCieloStart}
        onCieloPayment={(paymentCode, amountCents) => handleCieloPayment(paymentCode, amountCents)}
        onCancel={() => setShowFechamento(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: COLORS.SURFACE_800,
  },
  headerTitle:    { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  headerSubtotal: { color: COLORS.GRAY_400, fontSize: 11 },
  headerTotal:    { color: COLORS.GOLD_500, fontSize: FONT_SIZE.MD, fontFamily: FONT_FAMILY.BOLD },

  cieloBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: `${COLORS.CYAN_700}33`,
    borderBottomWidth: 1, borderBottomColor: COLORS.CYAN_700,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  cieloBannerText: { color: COLORS.CYAN_300, fontSize: FONT_SIZE.SM },

  closedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: `${COLORS.DANGER}22`,
    borderBottomWidth: 1, borderBottomColor: COLORS.DANGER,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  closedBannerText: { color: COLORS.DANGER, fontSize: FONT_SIZE.SM, flex: 1 },

  itemCard:    { backgroundColor: COLORS.SURFACE_800, margin: 8, marginBottom: 0, borderRadius: 8 },
  itemPending: { borderLeftWidth: 3, borderLeftColor: COLORS.GOLD_500 },
  itemInfo:    { padding: 12 },
  itemName:    { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  itemDetails: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, marginTop: 2 },
  itemObs:     { color: COLORS.GRAY_400, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  itemActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.SURFACE_600 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 10,
  },
  actionDisabled: { opacity: 0.35 },
  actionLabel:    { fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD },
  actionDivider:  { width: 1, backgroundColor: COLORS.SURFACE_600, marginVertical: 6 },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 32 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.SURFACE_800, padding: 12, paddingBottom: 28, gap: 8,
  },
  footerRow: { flexDirection: 'row', gap: 8 },
  footerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.SURFACE_600, borderRadius: 8, padding: 10, gap: 6,
  },
  footerBtnText: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.SM },
  footerBtnDisabled: { opacity: 0.35 },
  btnSend:  { backgroundColor: COLORS.GOLD_500 },
  btnClose: { backgroundColor: COLORS.DANGER },
});
