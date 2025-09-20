// File: src/store/slices/portfolioSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { simulationStorage } from '@/services/storage';
import type { EquityPoint, PortfolioAsset, PortfolioState, PositionPnl } from '@/types/trading';

const MAX_EQUITY_POINTS = 720;

const createInitialState = (): PortfolioState => ({
  assets: {},
  totalValue: 0,
  baseCurrency: 'USDT',
  equityHistory: [],
  pnl24h: [],
  updatedAt: null,
});

const initialState = createInitialState();

export const hydratePortfolioFromStorage = createAsyncThunk('portfolio/hydrate', async () => {
  const stored = await simulationStorage.loadPortfolio();
  return stored ?? initialState;
});

export const persistPortfolioToStorage = createAsyncThunk('portfolio/persist', async (portfolio: PortfolioState | null) => {
  await simulationStorage.savePortfolio(portfolio);
  return portfolio;
});

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioState(_, action: PayloadAction<PortfolioState>) {
      return action.payload;
    },
    resetPortfolioState() {
      return createInitialState();
    },
    setBaseCurrency(state, action: PayloadAction<string>) {
      state.baseCurrency = action.payload;
    },
    updateAssetBalance(state, action: PayloadAction<{ symbol: string; free?: number; locked?: number }>) {
      const { symbol, free, locked } = action.payload;
      const asset: PortfolioAsset = state.assets[symbol] ?? { symbol, free: 0, locked: 0 };
      if (typeof free === 'number') {
        asset.free = free;
      }
      if (typeof locked === 'number') {
        asset.locked = locked;
      }
      state.assets[symbol] = asset;
    },
    setTotalValue(state, action: PayloadAction<number>) {
      state.totalValue = action.payload;
    },
    setUpdatedAt(state, action: PayloadAction<number | null>) {
      state.updatedAt = action.payload;
    },
    recordEquityPoint(state, action: PayloadAction<EquityPoint>) {
      state.equityHistory = [...state.equityHistory, action.payload].slice(-MAX_EQUITY_POINTS);
    },
    setPnl24h(state, action: PayloadAction<PositionPnl[]>) {
      state.pnl24h = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydratePortfolioFromStorage.fulfilled, (_, action) => action.payload);
  },
});

export const {
  setPortfolioState,
  resetPortfolioState,
  setBaseCurrency,
  updateAssetBalance,
  setTotalValue,
  setUpdatedAt,
  recordEquityPoint,
  setPnl24h,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
