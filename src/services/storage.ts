// File: src/services/storage.ts
// SIMULATION ONLY – no real APIs
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OrdersState, PortfolioState, SessionState, SettingsState, SimulationStateSnapshot } from '@/types/trading';

const STORAGE_KEYS = {
  session: '@sim/session',
  settings: '@sim/settings',
  portfolio: '@sim/portfolio',
  orders: '@sim/orders',
  snapshot: '@sim/snapshot',
};

type Nullable<T> = T | null;

async function saveJson<T>(key: string, value: Nullable<T>) {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Failed to write key ${key}`, error);
  }
}

async function loadJson<T>(key: string): Promise<Nullable<T>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to read key ${key}`, error);
    return null;
  }
}

export const simulationStorage = {
  async saveSession(session: SessionState | null) {
    await saveJson(STORAGE_KEYS.session, session);
  },
  async loadSession() {
    return loadJson<SessionState>(STORAGE_KEYS.session);
  },
  async saveSettings(settings: SettingsState | null) {
    await saveJson(STORAGE_KEYS.settings, settings);
  },
  async loadSettings() {
    return loadJson<SettingsState>(STORAGE_KEYS.settings);
  },
  async savePortfolio(portfolio: PortfolioState | null) {
    await saveJson(STORAGE_KEYS.portfolio, portfolio);
  },
  async loadPortfolio() {
    return loadJson<PortfolioState>(STORAGE_KEYS.portfolio);
  },
  async saveOrders(orders: OrdersState | null) {
    await saveJson(STORAGE_KEYS.orders, orders);
  },
  async loadOrders() {
    return loadJson<OrdersState>(STORAGE_KEYS.orders);
  },
  async saveSnapshot(snapshot: SimulationStateSnapshot | null) {
    await saveJson(STORAGE_KEYS.snapshot, snapshot);
  },
  async loadSnapshot() {
    return loadJson<SimulationStateSnapshot>(STORAGE_KEYS.snapshot);
  },
  async clearAll() {
    await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key)),
    );
  },
};

export type SimulationStorage = typeof simulationStorage;
