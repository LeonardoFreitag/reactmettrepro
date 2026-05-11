import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import uuid from 'react-native-uuid';
import { RootState } from '../../../../store/combineReducers';
import { createItemList } from '../../../../store/ducks/itemList/actions';
import { ItemModel } from '../../../../models/ItemModel';
import { ObservacoesModel } from '../../../../models/ObservacoesModel';
import { AppStackParamList } from '../../../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'observacoesPorGrupo'>;
type Route = RouteProp<AppStackParamList, 'observacoesPorGrupo'>;

export function ObservacoesPorGrupo() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useDispatch();
  const { amount } = route.params;

  const produtoEdit = useSelector((state: RootState) => state.produtoEdit.data);
  const grupoEdit   = useSelector((state: RootState) => state.grupoEdit.data);
  const observacoesList = useSelector((state: RootState) => state.observacoesList.data);
  const comandaEdit = useSelector((state: RootState) => state.comandaEdit.data);
  const atendenteEdit = useSelector((state: RootState) => state.atendenteEdit.data);

  const [obsText, setObsText] = useState('');

  const filteredObs = observacoesList.filter(o =>
    o.grupo === produtoEdit.grupo ||
    o.grupo === grupoEdit.codigo ||
    o.grupo === grupoEdit.nome
  );

  function handleToggleObs(obs: ObservacoesModel) {
    setObsText(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return obs.observacao;
      return `${trimmed}, ${obs.observacao}`;
    });
  }

  function handleConfirm() {
    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) return Alert.alert('Erro', 'Quantidade inválida.');

    const item: ItemModel = {
      mobileId: uuid.v4() as string,
      codigo: '',
      comandaCodigo: comandaEdit.codigo,
      funcionarioCodigo: atendenteEdit.codigo,
      produtoCodigo: produtoEdit.codigo,
      descricao: produtoEdit.nome,
      unidade: produtoEdit.unidade,
      quantidade: qty,
      unitario: produtoEdit.preco,
      total: qty * produtoEdit.preco,
      hora: Date.now(),
      grupo: produtoEdit.grupo,
      subgrupo: produtoEdit.subgrupo,
      impresso: '',
      obs: obsText.trim(),
      enviado: '',
      combinado: false,
      codCombinado: '',
      flavors: [],
      repeat: false,
    };

    dispatch(createItemList(item));
    // Volta para listaPorSubgrupo (2 telas acima: sai de observacoesPorGrupo e produtosPorGrupo)
    navigation.pop(2);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.title}>Observações</Text>
        </View>

        <View style={styles.productCard}>
          <Text style={styles.productName}>{produtoEdit.nome}</Text>
          <Text style={styles.productQty}>Qtd: {amount}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Observação</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite ou selecione abaixo..."
              placeholderTextColor={COLORS.GRAY_400}
              value={obsText}
              onChangeText={setObsText}
              multiline
            />
            {obsText.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setObsText('')}>
                <Feather name="x" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {filteredObs.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Toque para adicionar:</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
            >
              {filteredObs.map(item => (
                <TouchableOpacity
                  key={item.codigo}
                  style={styles.chip}
                  onPress={() => handleToggleObs(item)}
                >
                  <Feather name="plus" size={13} color={COLORS.CYAN_500} />
                  <Text style={styles.chipText}>{item.observacao}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Adicionar item</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  productCard: {
    backgroundColor: COLORS.SURFACE_800,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.GOLD_500,
  },
  productName: {
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.MD,
  },
  productQty: {
    color: COLORS.GOLD_500,
    fontSize: FONT_SIZE.SM,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: COLORS.GRAY_200,
    fontSize: FONT_SIZE.SM,
    fontFamily: FONT_FAMILY.BOLD,
    marginBottom: 8,
  },
  inputRow: {
    backgroundColor: COLORS.SURFACE_700,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.SURFACE_600,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textInput: {
    flex: 1,
    color: COLORS.WHITE,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  clearBtn: {
    padding: 12,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.SURFACE_700,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.CYAN_500,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: COLORS.CYAN_500,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.SM,
  },
  confirmBtn: {
    backgroundColor: COLORS.GOLD_500,
    borderRadius: 8,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmText: {
    color: COLORS.BACKGROUND,
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.MD,
  },
});
