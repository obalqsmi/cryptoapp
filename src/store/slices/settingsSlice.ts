// File: src/store/slices/settingsSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { simulationStorage } from '@/services/storage';
import type { SettingsState } from '@/types/trading';

const initialState: SettingsState = {
  theme: 'system',
  baseCurrency: 'USDT',
  simulationSpeed: 1,
  hapticsEnabled: true,
};

export const hydrateSettingsFromStorage = createAsyncThunk('settings/hydrate', async () => {
  const stored = await simulationStorage.loadSettings();
  return stored ?? initialState;
});

export const persistSettingsToStorage = createAsyncThunk('settings/persist', async (settings: SettingsState | null) => {
  await simulationStorage.saveSettings(settings);
  return settings;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<SettingsState['theme']>) {
      state.theme = action.payload;
    },
    setBaseCurrency(state, action: PayloadAction<string>) {
      state.baseCurrency = action.payload;
    },
    setSimulationSpeed(state, action: PayloadAction<SettingsState['simulationSpeed']>) {
      state.simulationSpeed = action.payload;
    },
    toggleHaptics(state, action: PayloadAction<boolean | undefined>) {
      state.hapticsEnabled = action.payload ?? !state.hapticsEnabled;
    },
    resetSettings() {
      return { ...initialState };
    },
    hydrateSettings(_, action: PayloadAction<SettingsState>) {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSettingsFromStorage.fulfilled, (_, action) => action.payload);
  },
});

export const {
  setTheme,
  setBaseCurrency,
  setSimulationSpeed,
  toggleHaptics,
  resetSettings,
  hydrateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
