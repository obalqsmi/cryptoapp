// File: src/store/slices/portfolioSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { EarnPosition, EarnProduct, Txn } from '../../types';
import { seedBalances, seedEarnProducts, seedTransactions } from '../../services/seed';

export interface PortfolioState {
  balances: Record<string, number>;
  transactions: Txn[];
  earnPositions: EarnPosition[];
  earnProducts: EarnProduct[];
  simulationSpeed: 1 | 5 | 20;
}

const initialState: PortfolioState = {
  balances: seedBalances(),
  transactions: seedTransactions(),
  earnPositions: [],
  earnProducts: seedEarnProducts(),
  simulationSpeed: 1,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    hydratePortfolio(state, action: PayloadAction<Partial<PortfolioState>>) {
      return { ...state, ...action.payload };
    },
    setBalances(state, action: PayloadAction<Record<string, number>>) {
      state.balances = action.payload;
    },
    recordTransaction(state, action: PayloadAction<Txn>) {
      state.transactions = [action.payload, ...state.transactions].slice(0, 100);
    },
    addEarnPosition(state, action: PayloadAction<EarnPosition>) {
      state.earnPositions = [action.payload, ...state.earnPositions];
    },
    updateEarnPositions(state, action: PayloadAction<EarnPosition[]>) {
      state.earnPositions = action.payload;
    },
    setSimulationSpeed(state, action: PayloadAction<1 | 5 | 20>) {
      state.simulationSpeed = action.payload;
    },
    resetPortfolio(state) {
      state.balances = seedBalances();
      state.transactions = seedTransactions();
      state.earnPositions = [];
    },
  },
});

export const {
  hydratePortfolio,
  setBalances,
  recordTransaction,
  addEarnPosition,
  updateEarnPositions,
  setSimulationSpeed,
  resetPortfolio,
} = portfolioSlice.actions;
export default portfolioSlice.reducer;
