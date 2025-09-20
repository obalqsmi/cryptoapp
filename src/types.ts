// File: src/types.ts
export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

export interface Pair {
  id: string;
  base: Token;
  quote: Token;
  lastPrice: number;
  change24h: number;
  history: number[];
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Tick {
  pairId: string;
  price: number;
  change24h: number;
  time: number;
}

export interface TradeTick {
  id: string;
  pairId: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: number;
}

export type TransactionType = 'buy' | 'sell' | 'swap' | 'earn' | 'stake' | 'receive' | 'send';

export interface Txn {
  id: string;
  type: TransactionType;
  timestamp: number;
  description: string;
  amountFiat: number;
  amountToken: number;
  tokenId: string;
  fee: number;
}

export interface EarnProduct {
  id: string;
  token: Token;
  chain: string;
  apy: number;
  lockPeriodDays: number;
}

export interface EarnPosition {
  id: string;
  productId: string;
  tokenId: string;
  amount: number;
  startDate: number;
  lockPeriodDays: number;
  apy: number;
  accruedReward: number;
}

export interface Wallet {
  id: string;
  name: string;
  balanceFiat: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  side: 'bid' | 'ask';
}

export interface OrderBookSnapshot {
  pairId: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}
