import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/combineReducers';
import { createProdutoEdit } from '../../../store/ducks/produtoEdit/actions';
import { ProdutoModel } from '../../../models/ProdutoModel';
import { AppStackParamList } from '../../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'searchProduct'>;

export function SearchProduct() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const [search, setSearch] = useState('');

  const filtered = search
    ? produtoList.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))
    : produtoList;

  function handleSelect(item: ProdutoModel) {
    dispatch(createProdutoEdit(item));
    navigation.navigate('lancaPorCodigo');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar produto</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nome do produto..."
        placeholderTextColor={COLORS.GRAY_400}
        value={search}
        onChangeText={setSearch}
        autoFocus
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.codigo}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 40, marginBottom: 16 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  input: { height: 48, backgroundColor: COLORS.SURFACE_700, borderRadius: 8, paddingHorizontal: 12, color: COLORS.WHITE, fontSize: FONT_SIZE.MD, marginBottom: 12 },
  item: { backgroundColor: COLORS.SURFACE_800, padding: 14, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.REGULAR, fontSize: FONT_SIZE.MD, flex: 1 },
  itemPrice: { color: COLORS.GOLD_500, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 32 },
});
