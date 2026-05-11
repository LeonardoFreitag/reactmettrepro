import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompanyModel } from '../models/CompanyModel';

const COMPANY_KEY = '@mettre_company';

export async function companyCreate(company: CompanyModel): Promise<void> {
  const stored = await companyGetAll();
  const updated = [...stored, company];
  await AsyncStorage.setItem(COMPANY_KEY, JSON.stringify(updated));
}

export async function companyGetAll(): Promise<CompanyModel[]> {
  const data = await AsyncStorage.getItem(COMPANY_KEY);
  return data ? JSON.parse(data) : [];
}

export async function companyUpdate(company: CompanyModel): Promise<void> {
  const stored = await companyGetAll();
  const updated = stored.map(c => ({ ...c, isSelected: c.id === company.id }));
  await AsyncStorage.setItem(COMPANY_KEY, JSON.stringify(updated));
}

export async function companyDelete(company: CompanyModel): Promise<void> {
  const stored = await companyGetAll();
  const updated = stored.filter(c => c.id !== company.id);
  await AsyncStorage.setItem(COMPANY_KEY, JSON.stringify(updated));
}
