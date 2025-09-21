// File: src/types.ts
export type Token = {
  symbol: string;
  name: string;
  icon: string;
  chain: string;
};

export type MarketPair = {
  id: string;
  base: Token;
  quote: Token;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  sparkline: number[];
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DepthLevel = {
  price: number;
  amount: number;
};

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export type Order = {
  id: string;
  pairId: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  quantity: number;
  filledQuantity: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  createdAt: number;
};

export type Trade = {
  id: string;
  orderId: string;
  pairId: string;
  side: OrderSide;
  price: number;
  quantity: number;
  fee: number;
  timestamp: number;
};

export type PortfolioBalance = {
  symbol: string;
  amount: number;
  available: number;
};

export type Allocation = {
  symbol: string;
  name: string;
  value: number;
  weight: number;
};

export type SimulationSpeed = 1 | 5 | 20;

export type SessionState = {
  authenticated: boolean;
  email: string | null;
  theme: 'dark' | 'light';
  baseCurrency: 'USD' | 'EUR';
};

export type MarketState = {
  pairs: MarketPair[];
  candles: Record<string, Candle[]>;
  orderBook: Record<string, { bids: DepthLevel[]; asks: DepthLevel[] }>;
  trades: Record<string, Trade[]>;
  selectedInterval: '1m' | '5m' | '1h' | '1d';
};

export type PortfolioState = {
  balances: PortfolioBalance[];
  allocations: Allocation[];
  equityHistory: number[];
};

export type OrdersState = {
  openOrders: Order[];
  tradeHistory: Trade[];
  simulationSpeed: SimulationSpeed;
};

export type RootPersistedState = {
  session: SessionState;
  portfolio: PortfolioState;
  orders: OrdersState;
};
