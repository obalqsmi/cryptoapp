// File: src/types/trading.ts

export type CandleInterval = '1m' | '5m' | '1h' | '1d';

export const SUPPORTED_INTERVALS: CandleInterval[] = ['1m', '5m', '1h', '1d'];

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  tickSize: number;
  stepSize: number;
  minNotional: number;
}

export interface MarketTicker {
  symbol: string;
  lastPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  previousClose: number;
  timestamp: number;
  sparkline: number[];
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  cumulative: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type TimeInForce = 'GTC' | 'IOC';
export type OrderStatus = 'new' | 'partially_filled' | 'filled' | 'cancelled' | 'expired' | 'rejected';

export interface OrderDraft {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  clientOrderId?: string;
  timeInForce?: TimeInForce;
  reduceOnly?: boolean;
  postOnly?: boolean;
}

export interface Order extends OrderDraft {
  id: string;
  filledQuantity: number;
  avgPrice: number | null;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  feesPaid: number;
}

export interface TradeFill {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: number;
  fee: number;
  timestamp: number;
  liquidity: 'maker' | 'taker';
}

export interface PositionPnl {
  symbol: string;
  absolute: number;
  percent: number;
}

export interface PortfolioAsset {
  symbol: string;
  free: number;
  locked: number;
}

export interface EquityPoint {
  timestamp: number;
  value: number;
}

export interface PortfolioState {
  assets: Record<string, PortfolioAsset>;
  totalValue: number;
  baseCurrency: string;
  equityHistory: EquityPoint[];
  pnl24h: PositionPnl[];
  updatedAt: number | null;
}

export interface SessionState {
  status: 'idle' | 'authenticated';
  email: string | null;
  token: string | null;
  createdAt: number | null;
}

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  baseCurrency: string;
  simulationSpeed: 1 | 5 | 20;
  hapticsEnabled: boolean;
}

export interface MarketState {
  pairs: Record<string, MarketPair>;
  tickers: Record<string, MarketTicker>;
  candles: Record<string, Partial<Record<CandleInterval, Candle[]>>>;
  orderBooks: Record<string, OrderBookSnapshot>;
  trades: Record<string, TradeFill[]>;
  priceMap: Record<string, number>;
  searchTerm: string;
  ready: boolean;
  lastUpdated: number | null;
}

export interface OrdersState {
  openOrders: Order[];
  orderHistory: Order[];
  tradeHistory: TradeFill[];
}

export interface SimulationStateSnapshot {
  session: SessionState;
  settings: SettingsState;
  market: MarketState;
  portfolio: PortfolioState;
  orders: OrdersState;
}

export type PayloadActionWithPayload<T> = { payload: T };
