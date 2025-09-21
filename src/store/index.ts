// File: src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import marketReducer from './slices/marketSlice';
import portfolioReducer from './slices/portfolioSlice';
import sessionReducer from './slices/sessionSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
