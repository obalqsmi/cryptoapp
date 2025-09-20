// File: src/services/seed.ts
// SIMULATION ONLY – NO REAL MONEY OR APIS
import { Candle, EarnProduct, Pair, Token, Wallet } from '../types';
import { randomInRange } from '../utils/math';

const baseTokens: Token[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', icon: '🟠', decimals: 8 },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', icon: '🟣', decimals: 8 },
  { id: 'sol', symbol: 'SOL', name: 'Solana', icon: '🟪', decimals: 8 },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', icon: '🟡', decimals: 8 },
  { id: 'cro', symbol: 'CRO', name: 'Cronos', icon: '🔵', decimals: 8 },
  { id: 'xrp', symbol: 'XRP', name: 'Ripple', icon: '⚫️', decimals: 8 },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', icon: '🟩', decimals: 6 },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', icon: '🟦', decimals: 6 },
];

const generateHistory = (length: number, start: number): number[] => {
  const history: number[] = [];
  let last = start;
  for (let i = 0; i < length; i += 1) {
    const delta = randomInRange(-0.015, 0.02);
    last = Math.max(start * 0.4, last * (1 + delta));
    history.push(Number(last.toFixed(2)));
  }
  return history;
};

export const seedTokens = (): Token[] => baseTokens;

export const seedPairs = (tokens: Token[] = baseTokens): Pair[] => {
  const usdStable = tokens.find((token) => token.id === 'usdc') ?? tokens[0];
  return tokens
    .filter((token) => token.id !== usdStable.id)
    .map((token) => {
      const basePrice =
        token.id === 'btc'
          ? 62000
          : token.id === 'eth'
            ? 3000
            : token.id === 'sol'
              ? 150
              : token.id === 'doge'
                ? 0.12
                : token.id === 'cro'
                  ? 0.18
                  : token.id === 'xrp'
                    ? 0.55
                    : 1;
      const change24h = randomInRange(-0.08, 0.12);
      return {
        id: `${token.id}-${usdStable.id}`,
        base: token,
        quote: usdStable,
        lastPrice: basePrice,
        change24h,
        history: generateHistory(60, basePrice),
      } satisfies Pair;
    });
};

export const seedCandles = (pair: Pair, buckets: number = 90): Candle[] => {
  const candles: Candle[] = [];
  let price = pair.lastPrice;
  for (let i = buckets - 1; i >= 0; i -= 1) {
    const open = price;
    const change = randomInRange(-0.03, 0.03);
    const close = Math.max(price * 0.4, open * (1 + change));
    const high = Math.max(open, close) * (1 + Math.abs(randomInRange(0, 0.01)));
    const low = Math.min(open, close) * (1 - Math.abs(randomInRange(0, 0.01)));
    const volume = randomInRange(50, 250);
    candles.push({
      timestamp: Date.now() - i * 60 * 60 * 1000,
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }
  return candles;
};

export const seedWallets = (): Wallet[] => [
  { id: 'wallet-1', name: 'Wallet 1', balanceFiat: 16208.32 },
  { id: 'wallet-2', name: 'Wallet 2', balanceFiat: 4800.11 },
];

export const seedEarnProducts = (tokens: Token[] = baseTokens): EarnProduct[] => [
  {
    id: 'earn-btc-flex',
    token: tokens.find((token) => token.id === 'btc') ?? baseTokens[0],
    chain: 'Bitcoin',
    apy: 0.045,
    lockPeriodDays: 0,
  },
  {
    id: 'earn-cro-180',
    token: tokens.find((token) => token.id === 'cro') ?? baseTokens[4],
    chain: 'Cronos',
    apy: 0.085,
    lockPeriodDays: 180,
  },
  {
    id: 'earn-usdc-90',
    token: tokens.find((token) => token.id === 'usdc') ?? baseTokens[7],
    chain: 'Ethereum',
    apy: 0.065,
    lockPeriodDays: 90,
  },
  {
    id: 'earn-sol-30',
    token: tokens.find((token) => token.id === 'sol') ?? baseTokens[2],
    chain: 'Solana',
    apy: 0.1,
    lockPeriodDays: 30,
  },
];

export const seedBalances = () => ({
  btc: 0.225,
  eth: 2.15,
  sol: 120,
  doge: 12000,
  cro: 2500,
  xrp: 3000,
  usdt: 2500,
  usdc: 5200,
  usd: 1000,
});

export const seedTransactions = () => [];
