// File: src/store/slices/sessionSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { SessionState } from '../../types';

const initialState: SessionState = {
  authenticated: false,
  email: null,
  theme: 'dark',
  baseCurrency: 'USD',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    hydrateSession: (state, action: PayloadAction<Partial<SessionState>>) => ({
      ...state,
      ...action.payload,
    }),
    signIn(state, action: PayloadAction<{ email: string }>) {
      state.authenticated = true;
      state.email = action.payload.email;
    },
    signOut() {
      return initialState;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setBaseCurrency(state, action: PayloadAction<'USD' | 'EUR'>) {
      state.baseCurrency = action.payload;
    },
  },
});

export const { hydrateSession, signIn, signOut, toggleTheme, setBaseCurrency } = sessionSlice.actions;

export default sessionSlice.reducer;
