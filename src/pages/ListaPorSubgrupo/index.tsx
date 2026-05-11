import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { createGrupoEdit } from '../../store/ducks/grupoEdit/actions';
import { createSubgrupoEdit } from '../../store/ducks/subgrupoEdit/actions';
import { GrupoModel } from '../../models/GrupoModel';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'listaPorSubgrupo'>;

export function ListaPorSubgrupo() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const grupoList = useSelector((state: RootState) => state.grupoList.data);
  const produtoList = useSelector((state: RootState) => state.produtoList.data);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoModel | null>(null);

  const grupos = grupoList.filter(g => g.combinado !== 'S');

  const subgrupos = selectedGrupo
    ? [
        ...new Set(
          produtoList
            .filter(p =>
              p.grupo === selectedGrupo.codigo ||
              p.grupo === selectedGrupo.nome
            )
            .map(p => p.subgrupo)
        ),
      ].filter(Boolean)
    : [];

  function handleSelectGrupo(grupo: GrupoModel) {
    setSelectedGrupo(grupo);
    dispatch(createGrupoEdit(grupo));
  }

  function handleSelectSubgrupo(subgrupo: string) {
    dispatch(createSubgrupoEdit({ nome: subgrupo }));
    navigation.navigate('produtosPorGrupo');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>Lista por grupo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Grupos</Text>

        {grupos.length === 0 ? (
          <Text style={styles.empty}>Nenhum grupo disponível</Text>
        ) : (
          <View style={styles.grid}>
            {grupos.map(item => (
              <TouchableOpacity
                key={item.codigo}
                style={[
                  styles.card,
                  selectedGrupo?.codigo === item.codigo && styles.cardSelected,
                ]}
                onPress={() => handleSelectGrupo(item)}
              >
                <Text
                  style={[
                    styles.cardText,
                    selectedGrupo?.codigo === item.codigo && styles.cardTextSelected,
                  ]}
                >
                  {item.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedGrupo && (
          <>
            <Text style={styles.sectionLabel}>
              Subgrupos de {selectedGrupo.nome}
            </Text>

            {subgrupos.length === 0 ? (
              <TouchableOpacity
                style={styles.subCardSingle}
                onPress={() => {
                  dispatch(createSubgrupoEdit({ nome: '' }));
                  navigation.navigate('produtosPorGrupo');
                }}
              >
                <Text style={styles.subCardText}>Ver todos os produtos</Text>
                <Feather name="chevron-right" size={16} color={COLORS.CYAN_500} />
              </TouchableOpacity>
            ) : (
              <View style={styles.grid}>
                {subgrupos.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.subCard}
                    onPress={() => handleSelectSubgrupo(item)}
                  >
                    <Text style={styles.subCardText}>{item}</Text>
                    <Feather name="chevron-right" size={16} color={COLORS.CYAN_500} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
    marginBottom: 16,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.LG,
    fontFamily: FONT_FAMILY.BOLD,
  },
  sectionLabel: {
    color: COLORS.GRAY_200,
    fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.BOLD,
    marginBottom: 8,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    backgroundColor: COLORS.SURFACE_800,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.SURFACE_600,
    marginBottom: 8,
  },
  cardSelected: {
    borderColor: COLORS.GOLD_500,
    backgroundColor: `${COLORS.GOLD_500}22`,
  },
  cardText: {
    color: COLORS.GRAY_100,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.SM,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: COLORS.GOLD_500,
    fontFamily: FONT_FAMILY.BOLD,
  },
  subCard: {
    width: '48.5%',
    backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.CYAN_500,
    marginBottom: 8,
  },
  subCardSingle: {
    backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.CYAN_500,
    marginBottom: 8,
  },
  subCardText: {
    color: COLORS.CYAN_500,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.SM,
    flex: 1,
  },
  empty: {
    color: COLORS.GRAY_400,
    textAlign: 'center',
    marginTop: 32,
  },
});
