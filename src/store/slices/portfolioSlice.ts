// File: src/store/slices/portfolioSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Allocation, PortfolioBalance, PortfolioState } from '../../types';

const initialState: PortfolioState = {
  balances: [],
  allocations: [],
  equityHistory: [],
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    hydratePortfolio: (state, action: PayloadAction<Partial<PortfolioState>>) => ({
      ...state,
      ...action.payload,
    }),
    setBalances(state, action: PayloadAction<PortfolioBalance[]>) {
      state.balances = action.payload;
    },
    setAllocations(state, action: PayloadAction<Allocation[]>) {
      state.allocations = action.payload;
    },
    setEquityHistory(state, action: PayloadAction<number[]>) {
      state.equityHistory = action.payload;
    },
  },
});

export const { hydratePortfolio, setBalances, setAllocations, setEquityHistory } = portfolioSlice.actions;

export default portfolioSlice.reducer;
