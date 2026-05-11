import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import uuid from 'react-native-uuid';
import { RootState } from '../../../store/combineReducers';
import { createItemList, updateItemList } from '../../../store/ducks/itemList/actions';
import { clearFlavorEdit } from '../../../store/ducks/flavorEdit/actions';
import { FlavorModel } from '../../../models/FlavorModel';
import { ItemModel } from '../../../models/ItemModel';
import { CombinedModal } from './CombinedModal';
import { ObservacoesModal } from './ObservacoesModal';
import { AppStackParamList } from '../../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'produtosGrupoCombinado'>;

export function ProdutosGrupoCombinado() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const flavorList = useSelector((state: RootState) => state.flavorList.data);
  const flavorEdit = useSelector((state: RootState) => state.flavorEdit.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const atendenteEdit = useSelector((state: RootState) => state.atendenteEdit.data);

  const isEditing = !!flavorEdit.mobileId;
  const maxFlavors = grupoEdit.sabores;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FlavorModel[]>([]);
  const [showCombined, setShowCombined] = useState(false);
  const [showObs, setShowObs] = useState(false);
  const [pendingObs, setPendingObs] = useState('');

  const byGroup = flavorList.filter(f =>
    f.grupo === grupoEdit.codigo || f.grupo === grupoEdit.nome
  );

  const filtered = byGroup.filter(f =>
    search ? f.nome.toLowerCase().includes(search.toLowerCase()) : true
  );

  function handleToggle(item: FlavorModel) {
    setSelected(prev => {
      const exists = prev.find(f => f.codigo === item.codigo);
      if (exists) return prev.filter(f => f.codigo !== item.codigo);
      if (prev.length >= maxFlavors) return prev;
      return [...prev, item];
    });
  }

  function calcTotal(flavors: FlavorModel[]): number {
    if (!flavors.length) return 0;
    const maxPrice = Math.max(...flavors.map(f => f.preco));
    return maxPrice;
  }

  function buildCombinedItem(obsText: string): ItemModel {
    const total = calcTotal(selected);
    const codCombinado = uuid.v4() as string;
    const flavorsItems: ItemModel[] = selected.map(f => ({
      mobileId: uuid.v4() as string,
      codigo: '',
      comandaCodigo: comandaEdit.codigo,
      funcionarioCodigo: atendenteEdit.codigo,
      produtoCodigo: f.codigo,
      descricao: f.nome,
      unidade: f.unidade,
      quantidade: 1 / selected.length,
      unitario: f.preco,
      total: total / selected.length,
      hora: Date.now(),
      grupo: f.grupo,
      subgrupo: f.subgrupo,
      impresso: '',
      obs: obsText,
      enviado: '',
      combinado: true,
      codCombinado,
      flavors: [],
      repeat: false,
    }));

    return {
      mobileId: isEditing ? flavorEdit.mobileId : uuid.v4() as string,
      codigo: '',
      comandaCodigo: comandaEdit.codigo,
      funcionarioCodigo: atendenteEdit.codigo,
      produtoCodigo: selected[0]?.codigo ?? '',
      descricao: selected.map(f => f.nome).join(' / '),
      unidade: selected[0]?.unidade ?? 'UN',
      quantidade: 1,
      unitario: total,
      total,
      hora: Date.now(),
      grupo: grupoEdit.codigo,
      subgrupo: '',
      impresso: '',
      obs: obsText,
      enviado: '',
      combinado: true,
      codCombinado,
      flavors: flavorsItems,
      repeat: false,
    };
  }

  function handleObsConfirm(obs: string) {
    setShowObs(false);
    const item = buildCombinedItem(obs);
    if (isEditing) {
      dispatch(updateItemList(item));
    } else {
      dispatch(createItemList(item));
    }
    dispatch(clearFlavorEdit());
    navigation.navigate('atendimento');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('gruposDeCombinados')}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>{grupoEdit.nome}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{selected.length}/{maxFlavors}</Text>
        </View>
      </View>
      <TextInput style={styles.searchInput} placeholder="Buscar sabor..." placeholderTextColor={COLORS.GRAY_400} value={search} onChangeText={setSearch} />
      <FlatList
        data={filtered}
        keyExtractor={item => item.codigo}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = !!selected.find(f => f.codigo === item.codigo);
          return (
            <TouchableOpacity style={[styles.card, isSelected && styles.cardSelected]} onPress={() => handleToggle(item)}>
              <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>{item.nome}</Text>
              {isSelected && <Feather name="check" size={14} color={COLORS.CYAN_500} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum sabor encontrado</Text>}
      />
      {selected.length > 0 && (
        <TouchableOpacity style={styles.mountBtn} onPress={() => setShowCombined(true)}>
          <Text style={styles.mountBtnText}>Montar combinado ({selected.length} sabores)</Text>
        </TouchableOpacity>
      )}
      <CombinedModal isOpen={showCombined} flavors={selected} total={calcTotal(selected)} onConfirm={() => { setShowCombined(false); setShowObs(true); }} onCancel={() => setShowCombined(false)} />
      <ObservacoesModal isOpen={showObs} grupo={grupoEdit.codigo} onConfirm={handleObsConfirm} onCancel={() => setShowObs(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 40, marginBottom: 16 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD, flex: 1 },
  badge: { backgroundColor: COLORS.CYAN_500, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.SM },
  searchInput: { height: 48, backgroundColor: COLORS.SURFACE_700, borderRadius: 8, paddingHorizontal: 12, color: COLORS.WHITE, fontSize: FONT_SIZE.MD, marginBottom: 12 },
  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1, backgroundColor: COLORS.SURFACE_800, borderRadius: 8, padding: 12, borderWidth: 1.5, borderColor: COLORS.SURFACE_600, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSelected: { borderColor: COLORS.CYAN_500, backgroundColor: `${COLORS.CYAN_500}11` },
  cardName: { color: COLORS.GRAY_100, fontSize: FONT_SIZE.SM, flex: 1 },
  cardNameSelected: { color: COLORS.CYAN_500, fontFamily: FONT_FAMILY.BOLD },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 32 },
  mountBtn: { backgroundColor: COLORS.GOLD_500, borderRadius: 8, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  mountBtnText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
});
