// File: src/store/slices/marketSlice.ts
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Candle, OrderBookSnapshot, Pair, Token, TradeTick } from '../../types';
import { seedCandles, seedPairs, seedTokens } from '../../services/seed';

export interface MarketState {
  tokens: Token[];
  pairs: Pair[];
  candlesByPair: Record<string, Candle[]>;
  orderBooks: Record<string, OrderBookSnapshot>;
  recentTrades: Record<string, TradeTick[]>;
  selectedSegment: 'Hot' | 'Top' | 'New' | 'Gainers' | 'Losers';
  searchTerm: string;
}

const tokens = seedTokens();
const pairs = seedPairs(tokens);
const candlesByPair = pairs.reduce<Record<string, Candle[]>>((acc, pair) => {
  acc[pair.id] = seedCandles(pair);
  return acc;
}, {});

const initialState: MarketState = {
  tokens,
  pairs,
  candlesByPair,
  orderBooks: {},
  recentTrades: {},
  selectedSegment: 'Hot',
  searchTerm: '',
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setSegment(state, action: PayloadAction<MarketState['selectedSegment']>) {
      state.selectedSegment = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    hydrateMarket(state, action: PayloadAction<Partial<MarketState>>) {
      return { ...state, ...action.payload };
    },
    updateTick(state, action: PayloadAction<{ pairId: string; price: number; change24h: number }>) {
      const { pairId, price, change24h } = action.payload;
      const pair = state.pairs.find((item) => item.id === pairId);
      if (pair) {
        pair.lastPrice = price;
        pair.change24h = change24h;
        pair.history = [...pair.history.slice(-119), price];
      }
    },
    updateCandle(state, action: PayloadAction<{ pairId: string; candle: Candle }>) {
      const { pairId, candle } = action.payload;
      const list = state.candlesByPair[pairId] ?? [];
      state.candlesByPair[pairId] = [...list.slice(0, -1), candle];
    },
    updateDepth(state, action: PayloadAction<OrderBookSnapshot>) {
      const snapshot = action.payload;
      state.orderBooks[snapshot.pairId] = snapshot;
    },
    addTrade(state, action: PayloadAction<TradeTick>) {
      const trade = action.payload;
      const list = state.recentTrades[trade.pairId] ?? [];
      state.recentTrades[trade.pairId] = [trade, ...list].slice(0, 30);
    },
  },
});

export const {
  setSegment,
  setSearchTerm,
  hydrateMarket,
  updateTick,
  updateCandle,
  updateDepth,
  addTrade,
} = marketSlice.actions;
export default marketSlice.reducer;
