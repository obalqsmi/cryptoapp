// File: src/services/seed.ts
// SIMULATION ONLY – no real APIs
import { Candle, MarketPair, PortfolioBalance, Token } from '../types';

const tokens: Token[] = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', chain: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', chain: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', chain: 'Solana' },
  { symbol: 'BNB', name: 'BNB Chain', icon: '🟡', chain: 'BNB Chain' },
  { symbol: 'ADA', name: 'Cardano', icon: 'A', chain: 'Cardano' },
  { symbol: 'XRP', name: 'Ripple', icon: '✕', chain: 'XRPL' },
  { symbol: 'USDT', name: 'Tether', icon: '$', chain: 'Ethereum' },
];

const randomWalk = (start: number, steps: number, drift = 0): number[] => {
  const values: number[] = [start];
  for (let i = 1; i < steps; i += 1) {
    const change = (Math.random() - 0.5) * 0.04 + drift;
    const next = Math.max(0.0001, values[i - 1] * (1 + change));
    values.push(Number(next.toFixed(2)));
  }
  return values;
};

const buildCandles = (values: number[], intervalMinutes: number): Candle[] => {
  const now = Date.now();
  return values.map((close, index) => {
    const open = values[Math.max(index - 1, 0)];
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    return {
      time: now - (values.length - index) * intervalMinutes * 60 * 1000,
      open,
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close,
      volume: Number((Math.random() * 1000).toFixed(2)),
    };
  });
};

export const seedPairs = (): MarketPair[] => {
  const quotes = tokens.find((token) => token.symbol === 'USDT');
  if (!quotes) throw new Error('Missing USDT token');
  return tokens
    .filter((token) => token.symbol !== 'USDT')
    .map((token) => {
      const basePrice =
        token.symbol === 'BTC'
          ? 64000
          : token.symbol === 'ETH'
          ? 3200
          : token.symbol === 'SOL'
          ? 180
          : token.symbol === 'BNB'
          ? 580
          : token.symbol === 'ADA'
          ? 0.45
          : 0.6;
      const sparkline = randomWalk(basePrice, 40);
      const lastPrice = sparkline[sparkline.length - 1];
      const first = sparkline[0];
      const change24h = ((lastPrice - first) / first) * 100;
      return {
        id: `${token.symbol}/USDT`,
        base: token,
        quote: quotes,
        lastPrice,
        change24h,
        high24h: Math.max(...sparkline),
        low24h: Math.min(...sparkline),
        volume24h: Number((Math.random() * 12000 + 2000).toFixed(2)),
        sparkline,
      };
    });
};

export const seedCandles = (pairs: MarketPair[]): Record<string, Candle[]> =>
  pairs.reduce<Record<string, Candle[]>>((acc, pair) => {
    acc[pair.id] = buildCandles(randomWalk(pair.lastPrice, 120), 5);
    return acc;
  }, {});

export const seedBalances = (): PortfolioBalance[] => [
  { symbol: 'USDT', amount: 12000, available: 12000 },
  { symbol: 'BTC', amount: 0.42, available: 0.42 },
  { symbol: 'ETH', amount: 8.4, available: 8.4 },
  { symbol: 'BNB', amount: 24, available: 24 },
];

export const seedEquityHistory = (): number[] => randomWalk(52000, 40, 0.002);

export const allTokens = tokens;
