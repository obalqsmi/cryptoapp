// File: src/store/slices/ordersSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Order, OrdersState, SimulationSpeed, Trade } from '../../types';

const initialState: OrdersState = {
  openOrders: [],
  tradeHistory: [],
  simulationSpeed: 1,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    hydrateOrders: (state, action: PayloadAction<Partial<OrdersState>>) => ({
      ...state,
      ...action.payload,
    }),
    placeOrder(state, action: PayloadAction<Order>) {
      state.openOrders.unshift(action.payload);
    },
    updateOrder(state, action: PayloadAction<Order>) {
      state.openOrders = state.openOrders.map((order) =>
        order.id === action.payload.id ? action.payload : order,
      );
    },
    removeOrder(state, action: PayloadAction<string>) {
      state.openOrders = state.openOrders.filter((order) => order.id !== action.payload);
    },
    addTrade(state, action: PayloadAction<Trade>) {
      state.tradeHistory.unshift(action.payload);
    },
    setSimulationSpeed(state, action: PayloadAction<SimulationSpeed>) {
      state.simulationSpeed = action.payload;
    },
    clearOrders() {
      return initialState;
    },
  },
});

export const { hydrateOrders, placeOrder, updateOrder, removeOrder, addTrade, setSimulationSpeed, clearOrders } =
  ordersSlice.actions;

export default ordersSlice.reducer;
