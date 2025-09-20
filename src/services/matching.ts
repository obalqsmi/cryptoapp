// File: src/services/matching.ts
// SIMULATION ONLY – NO REAL MONEY OR APIS
import { Pair, Txn } from '../types';
import { randomInRange } from '../utils/math';

export interface TradeResult {
  balances: Record<string, number>;
  transaction: Txn;
  priceExecuted: number;
  slippage: number;
}

const FEE_RATE = 0.001;

interface MarketOrderParams {
  pair: Pair;
  side: 'buy' | 'sell';
  amountFiat: number;
  balances: Record<string, number>;
}

interface SwapParams {
  fromTokenId: string;
  toTokenId: string;
  pair: Pair;
  amountFrom: number;
  balances: Record<string, number>;
}

const ensureBalance = (balances: Record<string, number>, tokenId: string): number => {
  return balances[tokenId] ?? 0;
};

export const matchingEngine = {
  marketOrder({ pair, side, amountFiat, balances }: MarketOrderParams): TradeResult {
    const slippage = randomInRange(0.0002, 0.0015);
    const executedPrice =
      side === 'buy' ? pair.lastPrice * (1 + slippage) : pair.lastPrice * (1 - slippage);
    const amountToken = amountFiat / executedPrice;
    const fee = amountFiat * FEE_RATE;
    const updatedBalances = { ...balances };

    const quoteId = pair.quote.id;
    const baseId = pair.base.id;

    if (side === 'buy') {
      const availableQuote = ensureBalance(updatedBalances, quoteId);
      updatedBalances[quoteId] = Math.max(0, availableQuote - amountFiat - fee);
      const currentBase = ensureBalance(updatedBalances, baseId);
      updatedBalances[baseId] = currentBase + amountToken;
    } else {
      const availableBase = ensureBalance(updatedBalances, baseId);
      updatedBalances[baseId] = Math.max(0, availableBase - amountToken);
      const currentQuote = ensureBalance(updatedBalances, quoteId);
      updatedBalances[quoteId] = currentQuote + amountFiat - fee;
    }

    const transaction: Txn = {
      id: `txn-${Date.now()}`,
      type: side === 'buy' ? 'buy' : 'sell',
      timestamp: Date.now(),
      description: `${side === 'buy' ? 'Bought' : 'Sold'} ${pair.base.symbol}`,
      amountFiat: side === 'buy' ? -amountFiat - fee : amountFiat - fee,
      amountToken: side === 'buy' ? amountToken : -amountToken,
      tokenId: pair.base.id,
      fee,
    };

    return {
      balances: updatedBalances,
      transaction,
      priceExecuted: executedPrice,
      slippage,
    };
  },

  swap({ fromTokenId, toTokenId, amountFrom, balances, pair }: SwapParams): TradeResult {
    const slippage = randomInRange(0.0002, 0.0015);
    const executedPrice = pair.lastPrice * (1 + slippage);
    const updatedBalances = { ...balances };

    const availableFrom = ensureBalance(updatedBalances, fromTokenId);
    updatedBalances[fromTokenId] = Math.max(0, availableFrom - amountFrom);

    const isQuoteToBase = fromTokenId === pair.quote.id && toTokenId === pair.base.id;
    const isBaseToQuote = fromTokenId === pair.base.id && toTokenId === pair.quote.id;

    let received = 0;
    if (isQuoteToBase) {
      received = amountFrom / executedPrice;
    } else if (isBaseToQuote) {
      received = amountFrom * executedPrice;
    } else {
      // fallback assume quote -> base
      received = amountFrom / executedPrice;
    }

    const fee = amountFrom * FEE_RATE;
    const currentTo = ensureBalance(updatedBalances, toTokenId);
    updatedBalances[toTokenId] = currentTo + Math.max(0, received - fee);

    const transaction: Txn = {
      id: `txn-${Date.now()}`,
      type: 'swap',
      timestamp: Date.now(),
      description: `Swapped ${fromTokenId.toUpperCase()} → ${toTokenId.toUpperCase()}`,
      amountFiat: -amountFrom,
      amountToken: received,
      tokenId: toTokenId,
      fee,
    };

    return {
      balances: updatedBalances,
      transaction,
      priceExecuted: executedPrice,
      slippage,
    };
  },
};
