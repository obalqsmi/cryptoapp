// File: src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slices/sessionSlice';
import marketReducer from './slices/marketSlice';
import portfolioReducer from './slices/portfolioSlice';
import swapReducer from './slices/swapSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    swap: swapReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
