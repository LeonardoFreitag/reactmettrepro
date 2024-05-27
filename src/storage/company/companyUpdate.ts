import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompanyModel } from '../../models/CompanyModel';
import { COMPANY_COLLECTON } from '../companyConfig';
import { companyGetAll } from './companyGetAll';

export async function companyUpdate(company: CompanyModel): Promise<void> {
  try {
    const storageCompany: CompanyModel[] = await companyGetAll();

    const updatedCompany = storageCompany.map(item => {
      return item.id === company.id
        ? { ...company, isSelected: true }
        : { ...item, isSelected: false };
    });

    const newStorageCompany = JSON.stringify(updatedCompany);

    await AsyncStorage.setItem(COMPANY_COLLECTON, newStorageCompany);
  } catch (e) {
    throw new Error('Error saving company');
  }
}
