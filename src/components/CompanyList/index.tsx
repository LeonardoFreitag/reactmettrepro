import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/ducks/combineReducers';
import { Button, ButtonText, Container } from './styles';
import { loadCompanyList } from '../../store/ducks/companyList/actions';
import { CompanyModel } from '../../models/CompanyModel';
import { companyUpdate } from '../../storage/company/companyUpdate';
import { createCompanyEdit } from '../../store/ducks/companyEdit/actions';

export function CompanyList() {
  const dispatch = useDispatch();
  const companyList = useSelector((state: RootState) => state.companyList.data);

  function handleSelectCompany(company: CompanyModel) {
    companyUpdate(company);

    const newCompanyList = companyList.map(item => {
      return item.id === company.id
        ? { ...company, isSelected: true }
        : { ...item, isSelected: false };
    });

    dispatch(loadCompanyList(newCompanyList));
    dispatch(createCompanyEdit(company));
  }

  return (
    <Container>
      {companyList.map((company, index) => {
        return (
          <Button
            key={index.toString()}
            isSelected={company.isSelected}
            onPress={() => handleSelectCompany(company)}>
            <ButtonText isSelected={company.isSelected}>
              {company.nome}
            </ButtonText>
          </Button>
        );
      })}
    </Container>
  );
}
