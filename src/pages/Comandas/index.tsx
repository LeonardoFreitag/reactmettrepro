import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { createComandaEdit } from '../../store/ducks/comandaEdit/actions';
import { loadComandaList } from '../../store/ducks/comandaList/actions';
import { loadGrupoList } from '../../store/ducks/grupoList/actions';
import { loadSubgrupoList } from '../../store/ducks/subgrupoList/actions';
import { loadProdutoList } from '../../store/ducks/produtoList/actions';
import { loadObservacoesList } from '../../store/ducks/observacoesList/actions';
import { clearItemList } from '../../store/ducks/itemList/actions';
import { userLoggedClear } from '../../storage/configStorage';
import { createAtendenteEdit } from '../../store/ducks/atendenteEdit/actions';
import { setUrl } from '../../services/api';
import { ComandaModel } from '../../models/ComandaModel';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'comandas'>;

export function Comandas() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const companyEdit = useSelector((state: RootState) => state.companyEdit.data);
  const atendenteEdit = useSelector((state: RootState) => state.atendenteEdit.data);
  const comandaList = useSelector((state: RootState) => state.comandaList.data);

  const [filter, setFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  async function loadAll() {
    setRefreshing(true);
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const [mesas, grupos, subgrupos, produtos, obs] = await Promise.all([
        api.get('/mesas'),
        api.get('/grupos'),
        api.get('/subgrupos'),
        api.get('/products'),
        api.get('/obs'),
      ]);
      dispatch(loadComandaList(mesas.data));
      dispatch(loadGrupoList(grupos.data));
      dispatch(loadSubgrupoList(subgrupos.data));
      dispatch(loadProdutoList(produtos.data));
      dispatch(loadObservacoesList(obs.data));
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setRefreshing(false);
    }
  }

  function getStatusColors(item: ComandaModel) {
    if (item.status === 'F') {
      return { bg: COLORS.DANGER, text: COLORS.WHITE, subtext: 'rgba(255,255,255,0.85)' };
    }
    return { bg: COLORS.WHITE, text: COLORS.BACKGROUND, subtext: COLORS.GRAY_400 };
  }

  function getStatusLabel(item: ComandaModel) {
    return item.status === 'F' ? 'Fechada' : 'Aberta';
  }

  function handleSelect(item: ComandaModel) {
    dispatch(createComandaEdit(item));
    dispatch(clearItemList());
    navigation.navigate('atendimento');
  }

  async function handleNewComanda() {
    const num = filter.trim();
    if (!num) return;

    const existente = comandaList.find(c => c.comanda === num);
    if (existente?.status === 'F') {
      Alert.alert('Mesa fechada', `A mesa/comanda ${num} está fechada e não pode ser reaberta.`);
      return;
    }

    setCreating(true);
    try {
      const api = setUrl(companyEdit.ip, companyEdit.porta);
      const { data } = await api.put('/mesas', {
        codAtendente: atendenteEdit.codigo,
        mesa: num,
      });

      // oretorno = chave primária integer retornada pelo Firebird → codigo (codMesa)
      // num      = número digitado pelo usuário                   → comanda (exibição)
      const item = Array.isArray(data) ? data[0] : data;
      const pk = item?.oretorno ?? item?.oRetorno ?? item?.codigo ?? item?.id;
      const codigoPK: string = pk != null ? String(pk) : num;

      const nova: ComandaModel = {
        codigo:   codigoPK,
        comanda:  num,
        destino:  '',
        subtotal: 0,
        total:    item?.total ?? 0,
        status:   item?.status ?? 'N',
        criada:   true,
      };
      dispatch(createComandaEdit(nova));
      dispatch(clearItemList());
      navigation.navigate('atendimento');
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = status
        ? `Erro ${status} ao abrir a comanda.`
        : 'Não foi possível conectar ao servidor.';
      Alert.alert('Erro', msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleLogout() {
    await userLoggedClear();
    dispatch(createAtendenteEdit({ codigo: '', nome: '', senha: '' }));
    navigation.navigate('signin');
  }

  const filtered = filter ? comandaList.filter(c => c.comanda.includes(filter)) : comandaList;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Olá, {atendenteEdit.nome || 'Atendente'}</Text>
          <Text style={styles.subtitle}>Selecione ou crie uma comanda</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={24} color={COLORS.DANGER} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nº da comanda..."
          placeholderTextColor={COLORS.GRAY_400}
          value={filter}
          onChangeText={setFilter}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.newButton, creating && { opacity: 0.6 }]}
          onPress={handleNewComanda}
          disabled={creating}
        >
          <Feather name="plus" size={20} color={COLORS.BACKGROUND} />
          <Text style={styles.newButtonText}>{creating ? 'Abrindo...' : 'Nova'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.codigo}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll} tintColor={COLORS.GOLD_500} />}
        renderItem={({ item }) => {
          const { bg, text, subtext } = getStatusColors(item);
          const label = getStatusLabel(item);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: bg }]}
              onPress={() => handleSelect(item)}
            >
              <Text style={[styles.cardNumber, { color: text }]}>{item.comanda}</Text>
              <Text style={[styles.cardTotal, { color: subtext }]}>R$ {item.total.toFixed(2)}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusLabel}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma comanda encontrada</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 40, marginBottom: 16 },
  welcome: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  subtitle: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM },
  searchRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, height: 48, backgroundColor: COLORS.SURFACE_700, borderRadius: 8, paddingHorizontal: 12, color: COLORS.WHITE, fontSize: FONT_SIZE.MD },
  newButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.GOLD_500, borderRadius: 8, paddingHorizontal: 16, height: 48, gap: 4 },
  newButtonText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1, borderRadius: 8, padding: 16, alignItems: 'center' },
  cardNumber: { fontSize: FONT_SIZE.XL, fontFamily: FONT_FAMILY.BOLD },
  cardTotal: { fontSize: FONT_SIZE.SM, marginTop: 4 },
  statusBadge: { marginTop: 8, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 8, paddingVertical: 2 },
  statusLabel: { fontSize: 11, fontFamily: FONT_FAMILY.BOLD, color: COLORS.WHITE },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 32 },
});
