// File: src/services/storage.ts
// SIMULATION ONLY – NO REAL MONEY OR APIS
import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageKey =
  | 'session'
  | 'portfolio'
  | 'earnPositions'
  | 'transactions'
  | 'settings'
  | 'swap';

export const storage = {
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.warn('storage get error', error);
      return null;
    }
  },
  async set<T>(key: StorageKey, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('storage set error', error);
    }
  },
  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('storage remove error', error);
    }
  },
};
