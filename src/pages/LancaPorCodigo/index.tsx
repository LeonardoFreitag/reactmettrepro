import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import uuid from 'react-native-uuid';
import { RootState } from '../../store/combineReducers';
import { createItemList, updateItemList } from '../../store/ducks/itemList/actions';
import { clearItemEdit } from '../../store/ducks/itemEdit/actions';
import { clearProdutoEdit } from '../../store/ducks/produtoEdit/actions';
import { ProdutoModel } from '../../models/ProdutoModel';
import { ItemModel } from '../../models/ItemModel';
import { ObservacoesModel } from '../../models/ObservacoesModel';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { NumberSpinner } from '../../components/NumberSpinner';
import { Observacoes } from './Observacoes';
import { AppStackParamList } from '../../routes';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../../theme';

type Nav = NativeStackNavigationProp<AppStackParamList, 'lancaPorCodigo'>;

export function LancaPorCodigo() {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch();
  const produtoList    = useSelector((state: RootState) => state.produtoList.data);
  const produtoEdit    = useSelector((state: RootState) => state.produtoEdit.data);
  const observacoesList = useSelector((state: RootState) => state.observacoesList.data);
  const itemEdit       = useSelector((state: RootState) => state.itemEdit.data);
  const comandaEdit    = useSelector((state: RootState) => state.comandaEdit.data);
  const atendenteEdit  = useSelector((state: RootState) => state.atendenteEdit.data);
  const configEdit     = useSelector((state: RootState) => state.configEdit.data);

  const isEditing = !!itemEdit.mobileId;

  const [codigo, setCodigo] = useState('');
  const [amount, setAmount] = useState(1);
  const [obsText, setObsText] = useState('');
  const [foundProduct, setFoundProduct] = useState<ProdutoModel | null>(null);

  // Inicialização: apenas no modo edição
  useEffect(() => {
    if (isEditing) {
      const prod = produtoList.find(p => p.codigo === itemEdit.produtoCodigo);
      if (prod) setFoundProduct(prod);
      setAmount(itemEdit.quantidade);
      setCodigo(itemEdit.produtoCodigo);
      setObsText(itemEdit.obs ?? '');
    }
    // Limpeza ao desmontar
    return () => {
      dispatch(clearItemEdit());
      dispatch(clearProdutoEdit());
    };
  }, []);

  // Captura produto vindo do SearchProduct quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (!isEditing && produtoEdit.codigo) {
        setFoundProduct(produtoEdit);
        setCodigo(produtoEdit.codigo);
      }
    }, [produtoEdit.codigo])
  );

  function handleSearch() {
    const term = codigo.trim();
    if (!term) return Alert.alert('Aviso', 'Digite um código para buscar.');

    const found = produtoList.find(p =>
      p.codigo.trim() === term ||
      p.codigo.trim().toLowerCase() === term.toLowerCase() ||
      p.codigo.replace(/^0+/, '') === term.replace(/^0+/, '')
    );

    if (!found) return Alert.alert('Aviso', `Produto com código "${term}" não encontrado.`);
    setFoundProduct(found);
  }

  function handleToggleObs(obs: ObservacoesModel) {
    setObsText(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}, ${obs.observacao}` : obs.observacao;
    });
  }

  function handleConfirm() {
    if (!foundProduct) return Alert.alert('Aviso', 'Selecione um produto.');
    if (amount <= 0)    return Alert.alert('Aviso', 'Quantidade inválida.');

    if (isEditing) {
      dispatch(updateItemList({
        ...itemEdit,
        quantidade: amount,
        total: amount * foundProduct.preco,
        obs: obsText.trim(),
      }));
    } else {
      const item: ItemModel = {
        mobileId:          uuid.v4() as string,
        codigo:            '',
        comandaCodigo:     comandaEdit.codigo,
        funcionarioCodigo: atendenteEdit.codigo,
        produtoCodigo:     foundProduct.codigo,
        descricao:         foundProduct.nome,
        unidade:           foundProduct.unidade,
        quantidade:        amount,
        unitario:          foundProduct.preco,
        total:             amount * foundProduct.preco,
        hora:              Date.now(),
        grupo:             foundProduct.grupo,
        subgrupo:          foundProduct.subgrupo,
        impresso:          '',
        obs:               obsText.trim(),
        enviado:           '',
        combinado:         false,
        codCombinado:      '',
        flavors:           [],
        repeat:            false,
      };
      dispatch(createItemList(item));
    }
    navigation.goBack();
  }

  const step = foundProduct?.fracionado === 'S' ? 0.5 : 1;
  const filteredObs = observacoesList.filter(o =>
    foundProduct ? (o.grupo === foundProduct.grupo || o.grupo === foundProduct.subgrupo) : false
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar item' : 'Lançar por código'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.searchRow}>
          <Input
            placeholder="Código do produto"
            value={codigo}
            onChangeText={setCodigo}
            keyboardType={configEdit.keyboardHasLetters ? 'default' : 'numeric'}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={{ flex: 1 }}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Feather name="search" size={20} color={COLORS.BACKGROUND} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchByName} onPress={() => navigation.navigate('searchProduct')}>
          <Feather name="type" size={16} color={COLORS.CYAN_500} />
          <Text style={styles.searchByNameText}>Buscar por nome</Text>
        </TouchableOpacity>

        {foundProduct ? (
          <View style={styles.productCard}>
            <View style={styles.productCardHeader}>
              <Text style={styles.productName}>{foundProduct.nome}</Text>
              <TouchableOpacity onPress={() => { setFoundProduct(null); setCodigo(''); }}>
                <Feather name="x" size={18} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            </View>
            <Text style={styles.productPrice}>R$ {foundProduct.preco.toFixed(2)}</Text>
            <Text style={styles.productGroup}>{foundProduct.grupo} › {foundProduct.subgrupo}</Text>
          </View>
        ) : (
          <Text style={styles.noProduct}>Nenhum produto selecionado</Text>
        )}

        <NumberSpinner
          label="Quantidade"
          amount={amount}
          handlePressMinus={() => setAmount(prev => Math.max(step, prev - step))}
          handlePressPlus={() => setAmount(prev => prev + step)}
        />

        <View style={styles.obsContainer}>
          <Text style={styles.obsLabel}>Observação</Text>
          <View style={styles.obsInputRow}>
            <Input
              placeholder="Digite ou selecione abaixo..."
              value={obsText}
              onChangeText={setObsText}
              multiline
              style={styles.obsInput}
            />
            {obsText.length > 0 && (
              <TouchableOpacity style={styles.clearObs} onPress={() => setObsText('')}>
                <Feather name="x" size={16} color={COLORS.GRAY_400} />
              </TouchableOpacity>
            )}
          </View>
          {filteredObs.length > 0 && (
            <Observacoes observacoes={filteredObs} selected={[]} onToggle={handleToggleObs} />
          )}
        </View>

        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Button
            title={isEditing ? 'Salvar alteração' : 'Adicionar item'}
            onPress={handleConfirm}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 40, marginBottom: 20 },
  title: { color: COLORS.WHITE, fontSize: FONT_SIZE.LG, fontFamily: FONT_FAMILY.BOLD },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  searchBtn: { width: 54, height: 54, backgroundColor: COLORS.GOLD_500, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  searchByName: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  searchByNameText: { color: COLORS.CYAN_500, fontSize: FONT_SIZE.SM },
  productCard: { backgroundColor: COLORS.SURFACE_800, borderRadius: 8, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: COLORS.GOLD_500 },
  productCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { color: COLORS.WHITE, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.LG, flex: 1 },
  productPrice: { color: COLORS.GOLD_500, fontFamily: FONT_FAMILY.BOLD, fontSize: FONT_SIZE.XL, marginTop: 4 },
  productGroup: { color: COLORS.GRAY_400, fontSize: FONT_SIZE.SM, marginTop: 4 },
  noProduct: { color: COLORS.GRAY_400, textAlign: 'center', marginVertical: 24 },
  obsContainer: { marginTop: 20 },
  obsLabel: { color: COLORS.GRAY_200, fontSize: FONT_SIZE.SM, fontFamily: FONT_FAMILY.BOLD, marginBottom: 8 },
  obsInputRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  obsInput: { flex: 1, minHeight: 60, textAlignVertical: 'top' },
  clearObs: { padding: 10 },
});
