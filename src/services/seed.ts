// File: src/services/seed.ts
// SIMULATION ONLY – no real APIs
import { SUPPORTED_INTERVALS, type Candle, type CandleInterval, type MarketPair, type MarketState, type MarketTicker, type OrderBookLevel, type OrderBookSnapshot, type OrdersState, type PortfolioAsset, type PortfolioState, type SessionState, type SettingsState, type SimulationStateSnapshot, type TradeFill } from '@/types/trading';

interface RandomWalkOptions {
  volatility: number;
  minPrice: number;
}

interface OrderBookOptions {
  depth: number;
  spreadBps: number;
}

export interface SimulationSeedPayload extends SimulationStateSnapshot {
  priceMap: Record<string, number>;
  markets: MarketPair[];
}

const INTERVAL_MS: Record<CandleInterval, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SPARKLINE_POINTS = 60;
const EQUITY_HISTORY_POINTS = 180;
const MAX_CANDLES_PER_INTERVAL = 500;

const DEFAULT_MARKETS: MarketPair[] = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 6, tickSize: 0.01, stepSize: 0.000001, minNotional: 10 },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 5, tickSize: 0.01, stepSize: 0.00001, minNotional: 10 },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', pricePrecision: 2, quantityPrecision: 3, tickSize: 0.01, stepSize: 0.001, minNotional: 10 },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 3, tickSize: 0.001, stepSize: 0.001, minNotional: 5 },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1, tickSize: 0.0001, stepSize: 0.1, minNotional: 5 },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1, tickSize: 0.0001, stepSize: 0.1, minNotional: 5 },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', pricePrecision: 5, quantityPrecision: 0, tickSize: 0.00001, stepSize: 1, minNotional: 5 },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 3, tickSize: 0.001, stepSize: 0.001, minNotional: 5 },
  { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', pricePrecision: 4, quantityPrecision: 1, tickSize: 0.0001, stepSize: 0.1, minNotional: 5 },
  { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 2, tickSize: 0.001, stepSize: 0.01, minNotional: 5 },
  { symbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 2, tickSize: 0.001, stepSize: 0.01, minNotional: 5 },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', pricePrecision: 3, quantityPrecision: 2, tickSize: 0.001, stepSize: 0.01, minNotional: 5 },
];

const INITIAL_ASSETS: PortfolioAsset[] = [
  { symbol: 'USDT', free: 25000, locked: 0 },
  { symbol: 'BTC', free: 1.5, locked: 0 },
  { symbol: 'ETH', free: 12, locked: 0 },
  { symbol: 'BNB', free: 30, locked: 0 },
  { symbol: 'SOL', free: 250, locked: 0 },
  { symbol: 'USDC', free: 5000, locked: 0 },
];

const BASE_PRICE_MAP: Record<string, number> = {
  BTCUSDT: 68000,
  ETHUSDT: 3600,
  BNBUSDT: 520,
  SOLUSDT: 145,
  XRPUSDT: 0.55,
  ADAUSDT: 0.48,
  DOGEUSDT: 0.18,
  AVAXUSDT: 34,
  MATICUSDT: 0.72,
  DOTUSDT: 7.1,
  ATOMUSDT: 9.8,
  LINKUSDT: 17.4,
};

function roundToPrecision(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function randomWalk(length: number, start: number, options: RandomWalkOptions): number[] {
  const series: number[] = [start];
  for (let i = 1; i < length; i += 1) {
    const drift = (Math.random() * 2 - 1) * options.volatility;
    const next = Math.max(series[i - 1] * (1 + drift), options.minPrice);
    series.push(next);
  }
  return series;
}

function generateCandlesFromSeries(series: number[], interval: CandleInterval, startTimestamp: number, precision: number): Candle[] {
  const candles: Candle[] = [];
  const step = interval === '1m' ? 1 : interval === '5m' ? 5 : interval === '1h' ? 60 : 60 * 24;
  const intervalMs = INTERVAL_MS[interval];
  for (let index = 0; index < series.length; index += step) {
    const slice = series.slice(index, index + step);
    if (!slice.length) {
      continue;
    }
    const open = roundToPrecision(slice[0], precision);
    const close = roundToPrecision(slice[slice.length - 1], precision);
    const high = roundToPrecision(Math.max(...slice), precision);
    const low = roundToPrecision(Math.min(...slice), precision);
    const volumeBase = Math.max(open, close);
    const timestamp = startTimestamp + Math.floor(index / step) * intervalMs;
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: roundToPrecision(volumeBase * (0.8 + Math.random() * 0.4), 2),
    });
    if (candles.length >= MAX_CANDLES_PER_INTERVAL) {
      break;
    }
  }
  return candles;
}

function buildOrderBook(price: number, pair: MarketPair, options: OrderBookOptions): OrderBookSnapshot {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  const baseQuantity = 5 / pair.tickSize;
  for (let i = 1; i <= options.depth; i += 1) {
    const priceStep = price * (options.spreadBps / 10000) * i;
    const bidPrice = roundToPrecision(price - priceStep, pair.pricePrecision);
    const askPrice = roundToPrecision(price + priceStep, pair.pricePrecision);
    const quantityVariance = Math.random() * 0.5 + 0.75;
    const bidQuantity = roundToPrecision(baseQuantity * quantityVariance * pair.stepSize, pair.quantityPrecision);
    const askQuantity = roundToPrecision(baseQuantity * quantityVariance * pair.stepSize, pair.quantityPrecision);
    bids.push({
      price: bidPrice,
      quantity: Math.max(bidQuantity, pair.stepSize),
      cumulative: 0,
    });
    asks.push({
      price: askPrice,
      quantity: Math.max(askQuantity, pair.stepSize),
      cumulative: 0,
    });
  }

  let cumulativeBid = 0;
  let cumulativeAsk = 0;
  for (const level of bids) {
    cumulativeBid += level.quantity;
    level.cumulative = roundToPrecision(cumulativeBid, pair.quantityPrecision);
  }
  for (const level of asks) {
    cumulativeAsk += level.quantity;
    level.cumulative = roundToPrecision(cumulativeAsk, pair.quantityPrecision);
  }

  return {
    symbol: pair.symbol,
    bids,
    asks,
    timestamp: Date.now(),
  };
}

function computePortfolioValue(assets: PortfolioAsset[], priceMap: Record<string, number>, baseCurrency: string): number {
  return assets.reduce((total, asset) => {
    const conversion = asset.symbol === baseCurrency ? 1 : priceMap[asset.symbol] ?? 0;
    return total + (asset.free + asset.locked) * conversion;
  }, 0);
}

function buildPortfolio(priceMap: Record<string, number>, baseCurrency: string, timestamp: number): PortfolioState {
  const assetsRecord: Record<string, PortfolioAsset> = {};
  for (const asset of INITIAL_ASSETS) {
    assetsRecord[asset.symbol] = { ...asset };
  }
  const totalValue = roundToPrecision(computePortfolioValue(INITIAL_ASSETS, priceMap, baseCurrency), 2);
  const equityBase = totalValue * 0.97;
  const history: { timestamp: number; value: number }[] = [];
  for (let i = EQUITY_HISTORY_POINTS - 1; i >= 0; i -= 1) {
    const timePoint = timestamp - i * (ONE_DAY_MS / EQUITY_HISTORY_POINTS);
    const drift = 1 + (Math.random() * 0.015 - 0.0075);
    const prev = history.length ? history[history.length - 1].value : equityBase;
    history.push({
      timestamp: timePoint,
      value: roundToPrecision(Math.max(prev * drift, equityBase * 0.85), 2),
    });
  }

  return {
    assets: assetsRecord,
    totalValue,
    baseCurrency,
    equityHistory: history,
    pnl24h: [],
    updatedAt: timestamp,
  };
}

function buildTicker(symbol: string, prices: number[], pricePrecision: number): MarketTicker {
  const lastPrice = roundToPrecision(prices[prices.length - 1], pricePrecision);
  const openPrice = roundToPrecision(prices[Math.max(0, prices.length - 1440)], pricePrecision);
  const highPrice = roundToPrecision(Math.max(...prices), pricePrecision);
  const lowPrice = roundToPrecision(Math.min(...prices), pricePrecision);
  const priceChangePercent = openPrice === 0 ? 0 : roundToPrecision(((lastPrice - openPrice) / openPrice) * 100, 2);
  const volume = roundToPrecision(lastPrice * (50 + Math.random() * 25), 2);
  const quoteVolume = roundToPrecision(volume * lastPrice, 2);
  return {
    symbol,
    lastPrice,
    openPrice,
    highPrice,
    lowPrice,
    priceChangePercent,
    volume,
    quoteVolume,
    previousClose: openPrice,
    timestamp: Date.now(),
    sparkline: prices.slice(-SPARKLINE_POINTS).map((value) => roundToPrecision(value, pricePrecision)),
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function createSimulationSeed(baseCurrency: string = 'USDT', timestamp: number = Date.now()): SimulationSeedPayload {
  const pairs: Record<string, MarketPair> = {};
  const tickers: Record<string, MarketTicker> = {};
  const candles: Record<string, Partial<Record<CandleInterval, Candle[]>>> = {};
  const orderBooks: Record<string, OrderBookSnapshot> = {};
  const trades: Record<string, TradeFill[]> = {};
  const priceMap: Record<string, number> = { [baseCurrency]: 1 };

  for (const pair of DEFAULT_MARKETS) {
    const startPrice = BASE_PRICE_MAP[pair.symbol] ?? 100;
    const walk = randomWalk(ONE_DAY_MS / (60 * 1000), startPrice, { volatility: 0.015, minPrice: pair.tickSize });
    const ticker = buildTicker(pair.symbol, walk, pair.pricePrecision);
    tickers[pair.symbol] = ticker;
    priceMap[pair.symbol] = ticker.lastPrice;
    priceMap[pair.baseAsset] = ticker.lastPrice;
    if (!(pair.quoteAsset in priceMap)) {
      priceMap[pair.quoteAsset] = pair.quoteAsset === baseCurrency ? 1 : priceMap[pair.quoteAsset] ?? 1;
    }
    const candleRecord: Partial<Record<CandleInterval, Candle[]>> = {};
    for (const interval of SUPPORTED_INTERVALS) {
      candleRecord[interval] = generateCandlesFromSeries(walk, interval, timestamp - ONE_DAY_MS, pair.pricePrecision);
    }
    candles[pair.symbol] = candleRecord;
    orderBooks[pair.symbol] = buildOrderBook(ticker.lastPrice, pair, { depth: 18, spreadBps: 4 });
    trades[pair.symbol] = [];
    pairs[pair.symbol] = pair;
  }

  priceMap.USDC = priceMap.USDC ?? 1;

  const portfolio = buildPortfolio(priceMap, baseCurrency, timestamp);

  const marketState: MarketState = {
    pairs,
    tickers,
    candles,
    orderBooks,
    trades,
    priceMap,
    searchTerm: '',
    ready: true,
    lastUpdated: timestamp,
  };

  const ordersState: OrdersState = {
    openOrders: [],
    orderHistory: [],
    tradeHistory: [],
  };

  const sessionState: SessionState = {
    status: 'idle',
    email: null,
    token: null,
    createdAt: null,
  };

  const settingsState: SettingsState = {
    theme: 'system',
    baseCurrency,
    simulationSpeed: 1,
    hapticsEnabled: true,
  };

  const snapshot: SimulationSeedPayload = {
    session: sessionState,
    settings: settingsState,
    market: marketState,
    portfolio,
    orders: ordersState,
    priceMap,
    markets: clone(DEFAULT_MARKETS),
  };

  return snapshot;
}

export function cloneSimulationSeed(seed: SimulationSeedPayload): SimulationSeedPayload {
  return clone(seed);
}

export const DEFAULT_SIMULATION_SEED: SimulationSeedPayload = createSimulationSeed();

export const DEFAULT_MARKET_PAIRS = DEFAULT_MARKETS;
