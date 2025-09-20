// File: src/services/mockSocket.ts
// SIMULATION ONLY – no real APIs
import { DEFAULT_SIMULATION_SEED, createSimulationSeed } from '@/services/seed';
import { SUPPORTED_INTERVALS, type Candle, type CandleInterval, type MarketPair, type MarketState, type MarketTicker, type OrderBookLevel, type OrderBookSnapshot, type TradeFill } from '@/types/trading';

export type MockSocketEvent = 'ticker' | 'candle' | 'depth' | 'trade' | 'status';

export type MockSocketPayloadMap = {
  ticker: MarketTicker;
  candle: { symbol: string; interval: CandleInterval; candle: Candle };
  depth: OrderBookSnapshot;
  trade: TradeFill;
  status: { connected: boolean; timestamp: number };
};

export type MockSocketListener<K extends MockSocketEvent> = (payload: MockSocketPayloadMap[K]) => void;

interface PairSimulationState {
  pair: MarketPair;
  ticker: MarketTicker;
  candles: Partial<Record<CandleInterval, Candle[]>>;
  orderBook: OrderBookSnapshot;
  trades: TradeFill[];
  dayOpen: number;
}

interface MockSocketOptions {
  simulationSpeed?: 1 | 5 | 20;
  baseIntervalMs?: number;
  maxTradesPerPair?: number;
}

const INTERVAL_MS: Record<CandleInterval, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

const MAX_CANDLES_PER_INTERVAL = 600;
const DEFAULT_BASE_INTERVAL = 1500;
const DEFAULT_MAX_TRADES = 200;
const SPARKLINE_LENGTH = 120;

const round = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export class MockSocket {
  private listeners: { [K in MockSocketEvent]: Set<MockSocketListener<K>> } = {
    ticker: new Set(),
    candle: new Set(),
    depth: new Set(),
    trade: new Set(),
    status: new Set(),
  } as const;

  private timer: NodeJS.Timeout | null = null;
  private simulationSpeed: 1 | 5 | 20;
  private baseIntervalMs: number;
  private maxTradesPerPair: number;

  private pairState = new Map<string, PairSimulationState>();
  private priceMap: Record<string, number> = {};

  constructor(seed = DEFAULT_SIMULATION_SEED, options: MockSocketOptions = {}) {
    const snapshot = seed ?? createSimulationSeed();
    this.simulationSpeed = options.simulationSpeed ?? snapshot.settings.simulationSpeed ?? 1;
    this.baseIntervalMs = options.baseIntervalMs ?? DEFAULT_BASE_INTERVAL;
    this.maxTradesPerPair = options.maxTradesPerPair ?? DEFAULT_MAX_TRADES;

    for (const [symbol, pair] of Object.entries(snapshot.market.pairs)) {
      const ticker = { ...snapshot.market.tickers[symbol] };
      const candles = SUPPORTED_INTERVALS.reduce<Partial<Record<CandleInterval, Candle[]>>>(
        (acc, interval) => {
          const series = snapshot.market.candles[symbol]?.[interval] ?? [];
          acc[interval] = series.map((candle) => ({ ...candle }));
          return acc;
        },
        {},
      );
      const orderBook = snapshot.market.orderBooks[symbol]
        ? {
            symbol,
            bids: snapshot.market.orderBooks[symbol].bids.map((level) => ({ ...level })),
            asks: snapshot.market.orderBooks[symbol].asks.map((level) => ({ ...level })),
            timestamp: snapshot.market.orderBooks[symbol].timestamp,
          }
        : this.generateOrderBook(ticker.lastPrice, pair);
      this.pairState.set(symbol, {
        pair,
        ticker,
        candles,
        orderBook,
        trades: [],
        dayOpen: ticker.openPrice,
      });
    }

    this.priceMap = { ...snapshot.market.priceMap };
  }

  on<K extends MockSocketEvent>(event: K, listener: MockSocketListener<K>) {
    const listeners = this.listeners[event] as Set<MockSocketListener<K>>;
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  once<K extends MockSocketEvent>(event: K, listener: MockSocketListener<K>) {
    const wrapper: MockSocketListener<K> = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };
    this.on(event, wrapper);
    return () => this.off(event, wrapper);
  }

  off<K extends MockSocketEvent>(event: K, listener: MockSocketListener<K>) {
    const listeners = this.listeners[event] as Set<MockSocketListener<K>>;
    listeners.delete(listener);
  }

  start() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => this.tick(), this.getInterval());
    this.emit('status', { connected: true, timestamp: Date.now() });
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.emit('status', { connected: false, timestamp: Date.now() });
    }
  }

  isRunning() {
    return Boolean(this.timer);
  }

  setSimulationSpeed(speed: 1 | 5 | 20) {
    if (this.simulationSpeed === speed) {
      return;
    }
    this.simulationSpeed = speed;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this.tick(), this.getInterval());
    }
  }

  getPriceMap() {
    return { ...this.priceMap };
  }

  getMarketState(): MarketState {
    const tickers: MarketState['tickers'] = {};
    const candles: MarketState['candles'] = {};
    const orderBooks: MarketState['orderBooks'] = {};
    const trades: MarketState['trades'] = {};
    const pairs: MarketState['pairs'] = {};

    for (const [symbol, state] of this.pairState.entries()) {
      tickers[symbol] = { ...state.ticker };
      candles[symbol] = SUPPORTED_INTERVALS.reduce<Partial<Record<CandleInterval, Candle[]>>>(
        (acc, interval) => {
          acc[interval] = (state.candles[interval] ?? []).map((candle) => ({ ...candle }));
          return acc;
        },
        {},
      );
      orderBooks[symbol] = {
        symbol,
        bids: state.orderBook.bids.map((level) => ({ ...level })),
        asks: state.orderBook.asks.map((level) => ({ ...level })),
        timestamp: state.orderBook.timestamp,
      };
      trades[symbol] = state.trades.map((trade) => ({ ...trade }));
      pairs[symbol] = state.pair;
    }

    return {
      pairs,
      tickers,
      candles,
      orderBooks,
      trades,
      priceMap: { ...this.priceMap },
      searchTerm: '',
      ready: true,
      lastUpdated: Date.now(),
    };
  }

  private emit<K extends MockSocketEvent>(event: K, payload: MockSocketPayloadMap[K]) {
    for (const listener of this.listeners[event]) {
      listener(payload as never);
    }
  }

  private getInterval() {
    return Math.max(250, Math.floor(this.baseIntervalMs / this.simulationSpeed));
  }

  private tick() {
    const now = Date.now();
    for (const [symbol, state] of this.pairState.entries()) {
      this.updatePair(now, symbol, state);
    }
  }

  private updatePair(now: number, symbol: string, state: PairSimulationState) {
    const { pair, ticker } = state;
    const drift = (Math.random() * 2 - 1) * 0.004 * this.simulationSpeed;
    const rawPrice = Math.max(ticker.lastPrice * (1 + drift), pair.tickSize);
    const price = round(rawPrice, pair.pricePrecision);
    const volumeDelta = round(price * (0.2 + Math.random() * 0.2), 2);

    ticker.previousClose = ticker.lastPrice;
    ticker.lastPrice = price;
    ticker.highPrice = Math.max(ticker.highPrice, price);
    ticker.lowPrice = Math.min(ticker.lowPrice, price);
    ticker.volume = round(ticker.volume + volumeDelta, 2);
    ticker.quoteVolume = round(ticker.volume * price, 2);
    ticker.priceChangePercent = round(((price - state.dayOpen) / state.dayOpen) * 100, 2);
    ticker.timestamp = now;
    ticker.sparkline = [...ticker.sparkline.slice(-(SPARKLINE_LENGTH - 1)), price];

    this.emit('ticker', { ...ticker });

    this.updateCandles(now, state, price, volumeDelta);
    this.updateOrderBook(now, state, price);
    this.generateTrade(now, state, price, volumeDelta);

    this.priceMap[symbol] = price;
    this.priceMap[pair.baseAsset] = price;
  }

  private updateCandles(now: number, state: PairSimulationState, price: number, volumeDelta: number) {
    for (const interval of SUPPORTED_INTERVALS) {
      const series = state.candles[interval] ?? [];
      const bucket = Math.floor(now / INTERVAL_MS[interval]) * INTERVAL_MS[interval];
      let candle = series[series.length - 1];
      if (!candle || candle.timestamp !== bucket) {
        candle = {
          timestamp: bucket,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: round(volumeDelta, 2),
        };
        series.push(candle);
        if (series.length > MAX_CANDLES_PER_INTERVAL) {
          series.shift();
        }
      } else {
        candle.high = Math.max(candle.high, price);
        candle.low = Math.min(candle.low, price);
        candle.close = price;
        candle.volume = round(candle.volume + volumeDelta, 2);
      }
      state.candles[interval] = series;
      this.emit('candle', { symbol: state.pair.symbol, interval, candle: { ...candle } });
    }
  }

  private updateOrderBook(now: number, state: PairSimulationState, price: number) {
    const snapshot = this.generateOrderBook(price, state.pair);
    snapshot.timestamp = now;
    state.orderBook = snapshot;
    this.emit('depth', { ...snapshot, bids: snapshot.bids.map((level) => ({ ...level })), asks: snapshot.asks.map((level) => ({ ...level })) });
  }

  private generateTrade(now: number, state: PairSimulationState, price: number, volumeDelta: number) {
    const quantityBase = Math.max(volumeDelta / Math.max(price, 1), state.pair.stepSize);
    const quantity = round(quantityBase * (0.5 + Math.random()), state.pair.quantityPrecision);
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const fee = round(quantity * price * 0.001, 6);
    const trade: TradeFill = {
      id: `${state.pair.symbol}-${now}-${uid()}`,
      orderId: 'mock-socket',
      symbol: state.pair.symbol,
      side,
      price,
      quantity,
      fee,
      timestamp: now,
      liquidity: Math.random() > 0.6 ? 'maker' : 'taker',
    };
    state.trades.push(trade);
    if (state.trades.length > this.maxTradesPerPair) {
      state.trades.splice(0, state.trades.length - this.maxTradesPerPair);
    }
    this.emit('trade', { ...trade });
  }

  private generateOrderBook(price: number, pair: MarketPair): OrderBookSnapshot {
    const depth = 18;
    const spreadBps = 4;
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    let cumulativeBid = 0;
    let cumulativeAsk = 0;

    for (let level = 1; level <= depth; level += 1) {
      const shift = price * (spreadBps / 10000) * level;
      const bidPrice = round(Math.max(price - shift, pair.tickSize), pair.pricePrecision);
      const askPrice = round(price + shift, pair.pricePrecision);
      const quantityBase = Math.max(price / 1000, pair.stepSize * 10);
      const bidQuantity = round(quantityBase * (0.8 + Math.random() * 0.4), pair.quantityPrecision);
      const askQuantity = round(quantityBase * (0.8 + Math.random() * 0.4), pair.quantityPrecision);
      cumulativeBid += bidQuantity;
      cumulativeAsk += askQuantity;
      bids.push({ price: bidPrice, quantity: Math.max(bidQuantity, pair.stepSize), cumulative: round(cumulativeBid, pair.quantityPrecision) });
      asks.push({ price: askPrice, quantity: Math.max(askQuantity, pair.stepSize), cumulative: round(cumulativeAsk, pair.quantityPrecision) });
    }

    return {
      symbol: pair.symbol,
      bids,
      asks,
      timestamp: Date.now(),
    };
  }
}

export type MockSocketInstance = MockSocket;
