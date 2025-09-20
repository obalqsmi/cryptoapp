// File: src/store/slices/ordersSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { simulationStorage } from '@/services/storage';
import type { Order, OrdersState, TradeFill } from '@/types/trading';

const MAX_HISTORY = 200;

const createInitialState = (): OrdersState => ({
  openOrders: [],
  orderHistory: [],
  tradeHistory: [],
});

const initialState = createInitialState();

export const hydrateOrdersFromStorage = createAsyncThunk('orders/hydrate', async () => {
  const stored = await simulationStorage.loadOrders();
  return stored ?? initialState;
});

export const persistOrdersToStorage = createAsyncThunk('orders/persist', async (orders: OrdersState | null) => {
  await simulationStorage.saveOrders(orders);
  return orders;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrdersState(_, action: PayloadAction<OrdersState>) {
      return action.payload;
    },
    resetOrdersState() {
      return createInitialState();
    },
    addOpenOrder(state, action: PayloadAction<Order>) {
      state.openOrders.unshift(action.payload);
      state.openOrders = state.openOrders.slice(0, MAX_HISTORY);
    },
    updateOpenOrder(state, action: PayloadAction<{ id: string; changes: Partial<Order> }>) {
      const target = state.openOrders.find((order) => order.id === action.payload.id);
      if (target) {
        Object.assign(target, action.payload.changes, { updatedAt: Date.now() });
      }
    },
    removeOpenOrder(state, action: PayloadAction<string>) {
      state.openOrders = state.openOrders.filter((order) => order.id !== action.payload);
    },
    completeOrder(state, action: PayloadAction<Order>) {
      state.openOrders = state.openOrders.filter((order) => order.id !== action.payload.id);
      state.orderHistory.unshift(action.payload);
      state.orderHistory = state.orderHistory.slice(0, MAX_HISTORY);
    },
    cancelOrder(state, action: PayloadAction<{ id: string; timestamp: number }>) {
      const target = state.openOrders.find((order) => order.id === action.payload.id);
      if (!target) {
        return;
      }
      target.status = 'cancelled';
      target.updatedAt = action.payload.timestamp;
      state.openOrders = state.openOrders.filter((order) => order.id !== action.payload.id);
      state.orderHistory.unshift({ ...target });
      state.orderHistory = state.orderHistory.slice(0, MAX_HISTORY);
    },
    recordTrade(state, action: PayloadAction<TradeFill>) {
      state.tradeHistory.unshift(action.payload);
      state.tradeHistory = state.tradeHistory.slice(0, MAX_HISTORY * 2);
    },
    setTradeHistory(state, action: PayloadAction<TradeFill[]>) {
      state.tradeHistory = action.payload.slice(0, MAX_HISTORY * 2);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateOrdersFromStorage.fulfilled, (_, action) => action.payload);
  },
});

export const {
  setOrdersState,
  resetOrdersState,
  addOpenOrder,
  updateOpenOrder,
  removeOpenOrder,
  completeOrder,
  cancelOrder,
  recordTrade,
  setTradeHistory,
} = ordersSlice.actions;

export default ordersSlice.reducer;
