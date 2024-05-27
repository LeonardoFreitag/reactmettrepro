import AsyncStorage from '@react-native-async-storage/async-storage';
import { COMPANY_COLLECTON } from '../companyConfig';
import { CompanyModel } from '../../models/CompanyModel';

export async function companyGetAll(): Promise<CompanyModel[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(COMPANY_COLLECTON);

    console.log('leitura inicial', jsonValue);

    if (!jsonValue) {
      return [];
    }

    const companyList: CompanyModel[] = JSON.parse(jsonValue);

    return companyList;
  } catch (e) {
    throw new Error('Error getting company');
  }
}
