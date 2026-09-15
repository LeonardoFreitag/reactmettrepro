import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigModel } from '../models/ConfigModel';
import { UserIsloggedModel } from '../models/UserIsloggedModel';

const CONFIG_KEY = '@mettre_config';
const USER_KEY = '@mettre_userlogged';

export async function configSave(config: ConfigModel): Promise<void> {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export async function configGet(): Promise<ConfigModel | null> {
  const data = await AsyncStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : null;
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
