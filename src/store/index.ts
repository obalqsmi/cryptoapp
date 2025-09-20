// File: src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';

import { cloneSimulationSeed, createSimulationSeed, type SimulationSeedPayload } from '@/services/seed';

import marketReducer from './slices/marketSlice';
import ordersReducer from './slices/ordersSlice';
import portfolioReducer from './slices/portfolioSlice';
import sessionReducer from './slices/sessionSlice';
import settingsReducer from './slices/settingsSlice';

export const buildPreloadedState = (seed?: SimulationSeedPayload) => {
  const snapshot = seed ? cloneSimulationSeed(seed) : createSimulationSeed();
  return {
    session: snapshot.session,
    settings: snapshot.settings,
    market: snapshot.market,
    portfolio: snapshot.portfolio,
    orders: snapshot.orders,
  };
};

const preloadedState = buildPreloadedState();

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    settings: settingsReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    orders: ordersReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
