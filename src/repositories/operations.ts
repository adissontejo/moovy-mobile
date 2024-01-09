import AsyncStorage from '@react-native-community/async-storage';

import { Operation } from '~/types/storage';

export const getOperations = async (): Promise<Operation[]> => {
  const json = await AsyncStorage.getItem('@operations');

  return json ? JSON.parse(json) : [];
};

export const saveOperations = async (operations: Operation[]) => {
  const json = JSON.stringify(operations);

  await AsyncStorage.setItem('@operations', json);
};
