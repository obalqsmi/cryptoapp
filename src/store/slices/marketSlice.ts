// File: src/store/slices/marketSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Candle, MarketPair, MarketState, Trade } from '../../types';

const initialState: MarketState = {
  pairs: [],
  candles: {},
  orderBook: {},
  trades: {},
  selectedInterval: '5m',
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    seedMarket(state, action: PayloadAction<{ pairs: MarketPair[]; candles: Record<string, Candle[]> }>) {
      state.pairs = action.payload.pairs;
      state.candles = action.payload.candles;
      state.pairs.forEach((pair) => {
        state.orderBook[pair.id] = { bids: [], asks: [] };
        state.trades[pair.id] = [];
      });
    },
    updateTick(state, action: PayloadAction<{ pairId: string; price: number; change24h: number }>) {
      const pair = state.pairs.find((item) => item.id === action.payload.pairId);
      if (pair) {
        pair.lastPrice = action.payload.price;
        pair.change24h = action.payload.change24h;
        pair.sparkline = [...pair.sparkline.slice(1), action.payload.price];
      }
    },
    updateCandle(state, action: PayloadAction<{ pairId: string; candle: Candle }>) {
      const candles = state.candles[action.payload.pairId];
      if (candles) {
        candles[candles.length - 1] = action.payload.candle;
      }
    },
    updateDepth(state, action: PayloadAction<{ pairId: string; bids: { price: number; amount: number }[]; asks: { price: number; amount: number }[] }>) {
      state.orderBook[action.payload.pairId] = {
        bids: action.payload.bids,
        asks: action.payload.asks,
      };
    },
    pushTrade(state, action: PayloadAction<Trade>) {
      const trades = state.trades[action.payload.pairId] ?? [];
      state.trades[action.payload.pairId] = [action.payload, ...trades].slice(0, 30);
    },
    setInterval(state, action: PayloadAction<'1m' | '5m' | '1h' | '1d'>) {
      state.selectedInterval = action.payload;
    },
  },
});

export const { seedMarket, updateTick, updateCandle, updateDepth, pushTrade, setInterval } = marketSlice.actions;

export default marketSlice.reducer;
