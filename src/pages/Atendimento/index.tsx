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
import { FechamentoModal, PagoPorItem, SelecaoItem } from './FechamentoModal';
import { PagamentoRecord, ItemPagoRecord } from '../../models/CobrancaModel';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';
import { usePaymentProvider, PaymentMethodOption, PaymentResult } from '../../payment';
import { iniciarPendente, concluirPendente } from '../../payment/pending';
import { foiGravadoPeloInbox, montarPagamentoBody, subscribeInbox } from '../../payment/deepLinkInbox';
import {
  drainNow, enqueuePagamento, getErroPagamento, getPagamentosNaFila, subscribe as subscribeOutbox,
} from '../../sync/outbox';
import { ItemFila, mesclarPagamentos, somarItens } from './pagamentosLocais';

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
  // Pagamentos já aprovados na maquineta para esta comanda (fonte: servidor + os feitos nesta sessão).
  // É a base para bloquear novas cobranças quando o total já foi recebido.
  const [cieloPagamentos, setCieloPagamentos] = useState<PagamentoRecord[]>([]);
  // Quanto de cada item já foi cobrado na maquineta (item.codigo → {qtde, valor}).
  // Fonte: servidor (GET /pagamentos → itensPagos) + pagamentos feitos nesta sessão.
  const [pagoPorItem, setPagoPorItem] = useState<PagoPorItem>({});

  // Provedor de pagamento deste aparelho (Cielo hoje; Stone na Etapa B) — interface única.
  const provider = usePaymentProvider();
  const cieloWaiting = provider.isWaiting;

  // Ref para itens pendentes — evita closure stale entre setPendingItems e sendItems
  const pendingRef = useRef<ItemModel[]>([]);

  // Ref sempre atualizado para evitar closure stale no loadItems
  const itemListRef = useRef(itemList);
  useEffect(() => { itemListRef.current = itemList; }, [itemList]);

  const isClosed = comandaEdit.status?.trim() === 'F';

  // Pagamentos aprovados na maquineta que o servidor RECUSOU (4xx) nesta sessão: o
  // operador anota o código e segue; continuam contando localmente para o modal.
  const rejeitadosRef = useRef<{ records: PagamentoRecord[]; itens: Array<ItemFila['body']['itens']> }>({ records: [], itens: [] });

  useEffect(() => {
    loadItems();
    loadCieloPagamentos();
    // A fila de saída mudou (pagamento enviado/recusado) ou o inbox gravou um pagamento
    // desta comanda sem passar pela tela (resposta chegou após recriação do app):
    // recarrega "já pago" do servidor + fila.
    const codVenda = Number(comandaEdit.codigo);
    const unsubOutbox = subscribeOutbox(() => { void loadCieloPagamentos(); });
    const unsubInbox = subscribeInbox(ev => {
      if (ev.gravado && ev.pendente?.codVenda === codVenda) void loadCieloPagamentos();
    });
    return () => { unsubOutbox(); unsubInbox(); };
  }, []);

  /**
   * Carrega "já pago" da comanda: servidor (fonte de verdade) + pagamentos aprovados
   * que ainda estão na fila de saída (POST /pagamentos pendente) + recusados na sessão.
   * Garante que, ao reabrir uma comanda já recebida (total ou parcialmente),
   * o app saiba o quanto já foi pago e não permita cobrar de novo.
   */
  async function loadCieloPagamentos() {
    if (!comandaEdit.codigo || !companyEdit.ip) return;
    const codVenda = Number(comandaEdit.codigo);
    let servidor: PagamentoRecord[] | null = null;
    let itensServidor: ItemPagoRecord[] | null = null;
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const { data } = await api.get<{ pagamentos: PagamentoRecord[]; itensPagos?: ItemPagoRecord[] }>(
        `/pagamentos/M/${codVenda}`
      );
      servidor = data.pagamentos ?? [];
      // Servidor desatualizado → itensPagos ausente → mantém a marcação local.
      itensServidor = Array.isArray(data.itensPagos) ? data.itensPagos : null;
    } catch {}
    // Lida DEPOIS do servidor: o que saiu da fila nesse meio tempo já está no servidor.
    const fila = await getPagamentosNaFila(codVenda);
    const rej = rejeitadosRef.current;

    if (servidor) {
      setCieloPagamentos(mesclarPagamentos(servidor, fila, rej.records));
    } else {
      // Sem servidor agora: mantém o que já tinha e acrescenta o que está na fila.
      setCieloPagamentos(prev => mesclarPagamentos(prev.filter(p => !p.pendenteSync), fila, rej.records));
    }
    if (itensServidor) {
      const base: PagoPorItem = {};
      itensServidor.forEach(ip => {
        base[String(ip.codItem)] = { qtde: Number(ip.qtde) || 0, valor: Number(ip.valor) || 0 };
      });
      setPagoPorItem(somarItens(base, [...fila.map(f => f.body.itens), ...rej.itens]));
    }
  }

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
      // Recarrega para obter o CODIGO (MESAS_ITENS) dos itens recém-enviados —
      // é a chave usada na seleção de itens para cobrança. O ref é atualizado
      // antes para que loadItems não trate os recém-enviados como pendentes.
      const sentIds = new Set(items.map(i => i.mobileId));
      itemListRef.current = itemListRef.current.map(i =>
        sentIds.has(i.mobileId) ? { ...i, enviado: 'S' } : i
      );
      await loadItems();
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
   * Fechamento da comanda ao final do fluxo de maquineta (total pago atingido).
   * Chamado UMA única vez, com impressão: a solicitação em impressoes_caixa
   * avisa o caixa de que a conta já foi recebida e ele pode proceder o
   * recebimento e a emissão da NFC-e.
   */
  async function handleFechamentoCielo() {
    setShowFechamento(false);
    // Os pagamentos vão pela fila de saída: envia o que estiver pendente ANTES de
    // fechar a conta, para o caixa ver os pagamentos junto com a impressão.
    await drainNow();
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      await api.post('/mesas/fechaConta', { codigo: comandaEdit.codigo, destino: 'F' });
      dispatch(clearItemList());
      dispatch(clearComandaEdit());
      navigation.navigate('comandas');
    } catch {
      Alert.alert(
        'Pagamento recebido',
        'Os pagamentos foram registrados, mas não foi possível enviar o fechamento ao caixa. Verifique a conexão e use "Fechar conta" para tentar novamente.',
      );
    }
  }

  /**
   * Fluxo de maquineta: grava o pendente → provider.pay (Deep Link) → aguarda
   * resposta (entregue pelo inbox global, que já enfileira o POST /pagamentos na
   * fila de saída) → tenta sincronizar e avisa o operador se o servidor recusou
   * ou está fora. Retorna { authCode } em caso de sucesso ou null em falha.
   * Quem decide fechar a conta é o FechamentoModal (quando o total pago for atingido),
   * chamando onCieloComplete → handleFechamentoCielo.
   */
  async function handleCieloPayment(
    method: PaymentMethodOption,
    amountCents: number,
    selecao: SelecaoItem[] = [],
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

    const codVenda = Number(comandaEdit.codigo);
    const paidBeforeCents = Math.round(cieloPagamentos.reduce((s, p) => s + p.valorPago, 0) * 100);

    // Registro persistido ANTES do Deep Link: se o Android matar o app enquanto o
    // cliente lê o QR Code do Pix, a resposta chega como intent de lançamento e o
    // inbox a casa com este registro pela `reference` (M:<codVenda>:<idLocal>).
    const pendente = await iniciarPendente({
      provider:        provider.name,
      origem:          'M',
      codVenda,
      amountCents,
      totalCents:      Math.round(total * 100),
      paidBeforeCents,
      transactionType: method.transactionType,
      installments:    method.installments,
      voucherKind:     method.voucherKind,
      itens:           selecao,
      descricao:       `Comanda ${comandaEdit.comanda}`,
    });

    let result: PaymentResult;
    try {
      result = await provider.pay({
        amountCents,
        transactionType: method.transactionType,
        installments:    method.installments,
        voucherKind:     method.voucherKind,
        items:           cieloItems,
        reference:       pendente.reference,
      });
    } finally {
      await concluirPendente(pendente.idLocal);
    }

    if (!result.success) {
      Alert.alert('Pagamento não concluído', result.error);
      return null;
    }

    // O inbox já enfileirou o POST /pagamentos ao entregar a resposta. Garantia
    // extra (não casou o pendente): enfileira daqui — a fila deduplica por idLocal.
    if (!foiGravadoPeloInbox(pendente.idLocal)) {
      await enqueuePagamento(pendente.idLocal, montarPagamentoBody(pendente, result));
    }

    const authCode = result.authCode || '-';
    const recusado = await informarSincronizacao(pendente.idLocal, codVenda, authCode);
    if (recusado) {
      // Servidor recusou (4xx): segue contando localmente, como antes ("prosseguir assim mesmo").
      rejeitadosRef.current.records.push({
        id:              -Date.now(),
        provider:        provider.name,
        transactionType: result.transactionType,
        meioPagamento:   String(result.providerData.paymentCode ?? result.transactionType),
        bandeira:        result.brand,
        valorPago:       amountCents / 100,
        authCode,
        nsu:             result.nsu,
      });
      if (selecao.length) {
        rejeitadosRef.current.itens.push(
          selecao.map(s => ({ codItem: Number(s.codigo), codConjuga: s.codConjuga, qtde: s.qtde, valor: s.valor })),
        );
      }
    }
    // Recarrega "já pago" (servidor + fila + recusados): é o que o modal usa para
    // bloquear nova cobrança e riscar os itens pagos.
    await loadCieloPagamentos();
    return { authCode };
  }

  /**
   * Tenta enviar a fila agora e avisa o operador do resultado do registro:
   * servidor recusou (4xx → `erros`) ou sem conexão (continua na fila; reenvio
   * automático). Devolve true quando o servidor recusou.
   */
  async function informarSincronizacao(idLocal: string, codVenda: number, authCode: string): Promise<boolean> {
    await drainNow();
    const erro = await getErroPagamento(idLocal);
    if (erro) {
      const status = erro.httpStatus;
      const detalhe = status === 401 ? ' (chave da API inválida — confira em Configurações > Maquineta)'
        : status === 404 ? ' (servidor desatualizado: rota /pagamentos ausente)'
        : status === 422 ? ` (dados recusados: ${JSON.stringify(erro.resposta ?? '').slice(0, 120)})`
        : ` (HTTP ${status})`;
      Alert.alert(
        'Pagamento aprovado',
        `Autorização: ${authCode}\n\nAtenção: o servidor recusou o registro${detalhe}. Anote o código e registre manualmente.`,
      );
      return true;
    }
    const fila = await getPagamentosNaFila(codVenda);
    if (fila.some(i => i.cobrancaId === idLocal)) {
      Alert.alert(
        'Pagamento aprovado',
        `Autorização: ${authCode}\n\nSem conexão com o servidor: o registro será enviado automaticamente quando a conexão voltar.`,
      );
    }
    return false;
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
  const hasCieloConfig = provider.isConfigured();

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

      {/* Indicador: aguardando retorno da maquineta */}
      {cieloWaiting && (
        <View style={styles.cieloBanner}>
          <ActivityIndicator size="small" color={COLORS.CYAN_300} />
          <Text style={styles.cieloBannerText}>Aguardando retorno da maquineta...</Text>
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
        cieloPagamentos={cieloPagamentos}
        items={itemList.filter(i => i.enviado?.trim() === 'S' && Number(i.codigo) > 0)}
        pagoPorItem={pagoPorItem}
        onConfirm={handleFechamento}
        onCieloComplete={handleFechamentoCielo}
        onCieloPayment={(method, amountCents, selecao) => handleCieloPayment(method, amountCents, selecao)}
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
