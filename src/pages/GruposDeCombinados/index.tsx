import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { createGrupoEdit } from '../../store/ducks/grupoEdit/actions';
import { loadFlavorList } from '../../store/ducks/flavorList/actions';
import { clearFlavorsSelected } from '../../store/ducks/flavorsSelected/actions';
import { GrupoModel } from '../../models/GrupoModel';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'gruposDeCombinados'>;

export function GruposDeCombinados() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const grupoList   = useSelector((state: RootState) => state.grupoList.data);
  const produtoList = useSelector((state: RootState) => state.produtoList.data);

  const combinados = grupoList.filter(g => g.combinado === 'S');

  function handleSelect(grupo: GrupoModel) {
    dispatch(createGrupoEdit(grupo));
    dispatch(clearFlavorsSelected());

    // Filtra produtos do grupo selecionado a partir do produtoList já carregado
    // Duplo check: a API pode retornar o grupo como código ou como nome
    const flavors = produtoList
      .filter(p => p.grupo === grupo.codigo || p.grupo === grupo.nome)
      .map(p => ({ ...p, selected: false, obs: '' }));

    dispatch(loadFlavorList(flavors));
    navigation.navigate('produtosGrupoCombinado');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Grupos de combinados</Text>
      </View>
      <FlatList
        data={combinados}
        keyExtractor={item => item.codigo}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
            <Feather name="layers" size={24} color={COLORS.CYAN_500} />
            <Text style={styles.cardName}>{item.nome}</Text>
            <Text style={styles.cardSabores}>{item.sabores} sabores</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum grupo de combinados</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 40, marginBottom: 16 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  row: { gap: 8, marginBottom: 8 },
  card: { flex: 1, backgroundColor: COLORS.SURFACE_800, borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.CYAN_700, gap: 6 },
  cardName: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.MD, textAlign: 'center' },
  cardSabores: { color: COLORS.CYAN_500, fontSize: FONT_SIZE.SM },
  empty: { color: COLORS.GRAY_400, textAlign: 'center', marginTop: 32 },
});
