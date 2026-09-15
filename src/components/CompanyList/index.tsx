import React from 'react';
import { FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/combineReducers';
import { createCompanyEdit } from '../../store/ducks/companyEdit/actions';
import { updateCompanyList } from '../../store/ducks/companyList/actions';
import { companyUpdate } from '../../storage/companyStorage';
import { CompanyModel } from '../../models/CompanyModel';
import {
  ItemContainer,
  ItemText,
  ListContainer,
} from './styles';

export function CompanyList() {
  const dispatch = useDispatch();
  const companies = useSelector((state: RootState) => state.companyList.data);
  const selected = useSelector((state: RootState) => state.companyEdit.data);

  async function handleSelect(company: CompanyModel) {
    await companyUpdate(company);
    const updated = companies.map(c => ({ ...c, isSelected: c.id === company.id }));
    dispatch(updateCompanyList(updated));
    dispatch(createCompanyEdit({ ...company, isSelected: true }));
  }

  return (
    <ListContainer>
      <FlatList
        data={companies}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <ItemContainer
            isSelected={item.id === selected.id}
            onPress={() => handleSelect(item)}
          >
            <ItemText isSelected={item.id === selected.id}>
              {item.nome}
            </ItemText>
          </ItemContainer>
        )}
      />
    </ListContainer>
  );
}
