// File: src/store/slices/marketSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  Candle,
  CandleInterval,
  MarketPair,
  MarketState,
  MarketTicker,
  OrderBookSnapshot,
  TradeFill,
} from '@/types/trading';

const MAX_TRADES_PER_SYMBOL = 200;
const MAX_CANDLES_PER_INTERVAL = 600;

const initialState: MarketState = {
  pairs: {},
  tickers: {},
  candles: {},
  orderBooks: {},
  trades: {},
  priceMap: {},
  searchTerm: '',
  ready: false,
  lastUpdated: null,
};

const ensureArray = (value: Candle[] | undefined): Candle[] => (value ? [...value] : []);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    hydrateMarketState(_, action: PayloadAction<MarketState>) {
      return action.payload;
    },
    resetMarketState() {
      return { ...initialState };
    },
    registerPairs(state, action: PayloadAction<MarketPair[]>) {
      for (const pair of action.payload) {
        state.pairs[pair.symbol] = pair;
      }
    },
    upsertTicker(state, action: PayloadAction<MarketTicker>) {
      const ticker = action.payload;
      state.tickers[ticker.symbol] = ticker;
      state.priceMap[ticker.symbol] = ticker.lastPrice;
      state.priceMap[state.pairs[ticker.symbol]?.baseAsset ?? ticker.symbol] = ticker.lastPrice;
      state.lastUpdated = ticker.timestamp;
    },
    setPriceMap(state, action: PayloadAction<Record<string, number>>) {
      state.priceMap = {
        ...state.priceMap,
        ...action.payload,
      };
    },
    upsertPricePoint(state, action: PayloadAction<{ symbol: string; price: number }>) {
      state.priceMap[action.payload.symbol] = action.payload.price;
    },
    updateCandles(state, action: PayloadAction<{ symbol: string; interval: CandleInterval; candle: Candle }>) {
      const { symbol, interval, candle } = action.payload;
      const series = ensureArray(state.candles[symbol]?.[interval]);
      const last = series[series.length - 1];
      if (!last || last.timestamp !== candle.timestamp) {
        series.push(candle);
        if (series.length > MAX_CANDLES_PER_INTERVAL) {
          series.shift();
        }
      } else {
        series[series.length - 1] = candle;
      }
      state.candles[symbol] = {
        ...(state.candles[symbol] ?? {}),
        [interval]: series,
      };
      state.lastUpdated = candle.timestamp;
    },
    replaceCandles(
      state,
      action: PayloadAction<{ symbol: string; interval: CandleInterval; candles: Candle[] }>,
    ) {
      const { symbol, interval, candles } = action.payload;
      state.candles[symbol] = {
        ...(state.candles[symbol] ?? {}),
        [interval]: candles.slice(-MAX_CANDLES_PER_INTERVAL),
      };
    },
    upsertOrderBook(state, action: PayloadAction<OrderBookSnapshot>) {
      state.orderBooks[action.payload.symbol] = action.payload;
      state.lastUpdated = action.payload.timestamp;
    },
    pushTrade(state, action: PayloadAction<TradeFill>) {
      const trade = action.payload;
      const list = state.trades[trade.symbol] ?? [];
      list.unshift(trade);
      state.trades[trade.symbol] = list.slice(0, MAX_TRADES_PER_SYMBOL);
      state.lastUpdated = trade.timestamp;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setMarketReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
  },
});

export const {
  hydrateMarketState,
  resetMarketState,
  registerPairs,
  upsertTicker,
  setPriceMap,
  upsertPricePoint,
  updateCandles,
  replaceCandles,
  upsertOrderBook,
  pushTrade,
  setSearchTerm,
  setMarketReady,
} = marketSlice.actions;

export default marketSlice.reducer;
