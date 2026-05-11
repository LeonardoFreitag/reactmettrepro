import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/combineReducers';
import { createProdutoEdit } from '../../../store/ducks/produtoEdit/actions';
import { ProdutoModel } from '../../../models/ProdutoModel';
import { NumberSpinner } from '../../../components/NumberSpinner';
import { AppStackParamList } from '../../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'produtosPorGrupo'>;

export function ProdutosPorGrupo() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const grupoEdit = useSelector((state: RootState) => state.grupoEdit.data);
  const subgrupoEdit = useSelector((state: RootState) => state.subgrupoEdit.data);
  const produtoList = useSelector((state: RootState) => state.produtoList.data);

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProdutoModel | null>(null);
  const [amount, setAmount] = useState(1);

  const matchesGrupo = (p: ProdutoModel) =>
    p.grupo === grupoEdit.codigo || p.grupo === grupoEdit.nome;

  const products = produtoList.filter(p =>
    matchesGrupo(p) &&
    (subgrupoEdit.nome ? p.subgrupo === subgrupoEdit.nome : true) &&
    (search ? p.nome.toLowerCase().includes(search.toLowerCase()) : true)
  );

  function handleSelect(item: ProdutoModel) {
    setSelectedProduct(item);
    dispatch(createProdutoEdit(item));
  }

  function handleConfirm() {
    if (!selectedProduct) return;
    navigation.navigate('observacoesPorGrupo', { amount: amount.toString() });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>{grupoEdit.nome}</Text>
      </View>
      <TextInput style={styles.searchInput} placeholder="Buscar produto..." placeholderTextColor={COLORS.GRAY_400} value={search} onChangeText={setSearch} />
      <FlatList
        data={products}
        keyExtractor={item => item.codigo}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, selectedProduct?.codigo === item.codigo && styles.cardSelected]} onPress={() => handleSelect(item)}>
            <Text style={[styles.cardName, selectedProduct?.codigo === item.codigo && styles.cardNameSelected]}>{item.nome}</Text>
            <Text style={styles.cardPrice}>R$ {item.preco.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado</Text>}
      />
      {selectedProduct && (
        <View style={styles.footer}>
          <NumberSpinner label="Quantidade" amount={amount} handlePressMinus={() => setAmount(p => Math.max(1, p - 1))} handlePressPlus={() => setAmount(p => p + 1)} />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Avançar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 40, marginBottom: 16 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  searchInput: { height: 48, backgroundColor: COLORS.SURFACE_700, borderRadius: 8, paddingHorizontal: 12, color: COLORS.WHITE, fontSize: FONT_SIZE.MD, marginBottom: 12 },
  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1, backgroundColor: COLORS.SURFACE_800, borderRadius: 8, padding: 12, borderWidth: 1.5, borderColor: COLORS.SURFACE_600 },
  cardSelected: { borderColor: COLORS.GOLD_500, backgroundColor: `${COLORS.GOLD_500}11` },
  cardName: { color: COLORS.GRAY_100, fontFamily: FONT_FAMILY.REGULAR, fontSize: FONT_SIZE.SM },
  cardNameSelected: { color: COLORS.GOLD_500, fontFamily: FONT_FAMILY.BOLD },
  cardPrice: { color: COLORS.GOLD_300, fontSize: FONT_SIZE.SM, marginTop: 4 },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 32 },
  footer: { backgroundColor: COLORS.SURFACE_800, borderRadius: 12, padding: 16, gap: 12, marginTop: 8 },
  confirmBtn: { backgroundColor: COLORS.GOLD_500, borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: COLORS.BACKGROUND, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
});
