// File: src/store/slices/sessionSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Currency, Wallet } from '../../types';
import { seedWallets } from '../../services/seed';

export interface SessionState {
  wallets: Wallet[];
  selectedWalletId: string;
  theme: 'dark' | 'system';
  currency: Currency;
}

const wallets = seedWallets();

const initialState: SessionState = {
  wallets,
  selectedWalletId: wallets[0]?.id ?? 'wallet-1',
  theme: 'dark',
  currency: 'USD',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    selectWallet(state, action: PayloadAction<string>) {
      state.selectedWalletId = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'system' : 'dark';
    },
    setCurrency(state, action: PayloadAction<Currency>) {
      state.currency = action.payload;
    },
    hydrateSession(state, action: PayloadAction<Partial<SessionState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { selectWallet, toggleTheme, setCurrency, hydrateSession } = sessionSlice.actions;
export default sessionSlice.reducer;
