// File: src/store/slices/sessionSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { simulationStorage } from '@/services/storage';
import type { SessionState } from '@/types/trading';

const initialState: SessionState = {
  status: 'idle',
  email: null,
  token: null,
  createdAt: null,
};

export const hydrateSessionFromStorage = createAsyncThunk('session/hydrate', async () => {
  const stored = await simulationStorage.loadSession();
  return stored ?? initialState;
});

export const persistSessionToStorage = createAsyncThunk('session/persist', async (session: SessionState | null) => {
  await simulationStorage.saveSession(session);
  return session;
});

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<{ email: string; token: string; createdAt: number }>) {
      state.status = 'authenticated';
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.createdAt = action.payload.createdAt;
    },
    signOut() {
      return { ...initialState };
    },
    setSessionState(_, action: PayloadAction<SessionState>) {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSessionFromStorage.fulfilled, (_, action) => action.payload);
  },
});

export const { signIn, signOut, setSessionState } = sessionSlice.actions;

export default sessionSlice.reducer;
