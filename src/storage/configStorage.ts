import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigModel, normalizeConfig } from '../models/ConfigModel';
import { UserIsloggedModel } from '../models/UserIsloggedModel';
import { configureApiKey } from '../services/api';

const CONFIG_KEY = '@mettre_config';
const USER_KEY = '@mettre_userlogged';

export async function configSave(config: ConfigModel): Promise<void> {
  const normalized = normalizeConfig(config);
  configureApiKey(normalized.apiKey);
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(normalized));
}

export async function configGet(): Promise<ConfigModel | null> {
  const data = await AsyncStorage.getItem(CONFIG_KEY);
  if (!data) return null;
  const normalized = normalizeConfig(JSON.parse(data));
  configureApiKey(normalized.apiKey);
  return normalized;
}

export async function userLoggedSave(user: UserIsloggedModel): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function userLoggedGet(): Promise<UserIsloggedModel | null> {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function userLoggedClear(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
