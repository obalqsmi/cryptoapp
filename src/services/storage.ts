// File: src/services/storage.ts
// SIMULATION ONLY – no real APIs
import AsyncStorage from '@react-native-async-storage/async-storage';

type Serializable = Record<string, unknown> | unknown[] | string | number | boolean | null;

const serialize = (value: Serializable) => JSON.stringify(value);

const deserialize = <T>(value: string | null): T | null => {
  if (value == null) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse storage item', error);
    return null;
  }
};

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    return deserialize<T>(value);
  },
  async set(key: string, value: Serializable): Promise<void> {
    await AsyncStorage.setItem(key, serialize(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  async multiSet(entries: [string, Serializable][]): Promise<void> {
    const payload = entries.map(([k, v]) => [k, serialize(v)] as [string, string]);
    await AsyncStorage.multiSet(payload);
  },
};
