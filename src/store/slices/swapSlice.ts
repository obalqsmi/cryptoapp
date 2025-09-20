// File: src/store/slices/swapSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface SwapDraft {
  fromTokenId: string;
  toTokenId: string;
  chain: string;
  network: string;
  amount: number;
}

export interface SwapState {
  draft: SwapDraft;
  lastSwap?: {
    fromTokenId: string;
    toTokenId: string;
    amount: number;
    priceExecuted: number;
    slippage: number;
  };
}

const initialState: SwapState = {
  draft: {
    fromTokenId: 'usdc',
    toTokenId: 'cro',
    chain: 'Ethereum',
    network: 'Cronos',
    amount: 100,
  },
  lastSwap: undefined,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    updateDraft(state, action: PayloadAction<Partial<SwapDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    setLastSwap(
      state,
      action: PayloadAction<{ fromTokenId: string; toTokenId: string; amount: number; priceExecuted: number; slippage: number }>,
    ) {
      state.lastSwap = action.payload;
    },
    hydrateSwap(state, action: PayloadAction<Partial<SwapState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateDraft, setLastSwap, hydrateSwap } = swapSlice.actions;
export default swapSlice.reducer;
