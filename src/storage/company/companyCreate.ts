import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompanyModel } from '../../models/CompanyModel';
import { COMPANY_COLLECTON } from '../companyConfig';
import { companyGetAll } from './companyGetAll';

export async function companyCreate(company: CompanyModel): Promise<void> {
  try {
    const storageCompany: CompanyModel[] = await companyGetAll();

    const listWithNewCompany = [...storageCompany, company];

    const newStorageCompany = JSON.stringify(listWithNewCompany);

    await AsyncStorage.setItem(COMPANY_COLLECTON, newStorageCompany);
  } catch (e) {
    throw new Error('Error saving company');
  }
}
