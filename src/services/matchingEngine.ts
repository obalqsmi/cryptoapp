// File: src/services/matchingEngine.ts
// SIMULATION ONLY – no real APIs
import { nanoid } from '@reduxjs/toolkit';

import type {
  MarketPair,
  MarketTicker,
  Order,
  OrderBookLevel,
  OrderBookSnapshot,
  OrderDraft,
  OrderStatus,
  OrderType,
  PortfolioState,
  TradeFill,
} from '@/types/trading';

export interface MatchingEngineOptions {
  feeRate?: number;
  equityHistoryLimit?: number;
}

export interface MatchingRequest extends OrderDraft {
  id?: string;
  timestamp?: number;
}

export interface MatchingContext {
  pair: MarketPair;
  ticker: MarketTicker;
  orderBook: OrderBookSnapshot;
  portfolio: PortfolioState;
  priceMap: Record<string, number>;
  baseCurrency: string;
}

export interface MatchingResult {
  order: Order;
  fills: TradeFill[];
  remainingQuantity: number;
  updatedPortfolio: PortfolioState;
}

const BALANCE_PRECISION = 8;
const EQUITY_HISTORY_LIMIT_DEFAULT = 720;

const round = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const roundDown = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.floor(value * factor) / factor;
};

const clonePortfolio = (portfolio: PortfolioState): PortfolioState => ({
  assets: Object.fromEntries(
    Object.entries(portfolio.assets).map(([symbol, asset]) => [symbol, { ...asset }]),
  ),
  totalValue: portfolio.totalValue,
  baseCurrency: portfolio.baseCurrency,
  equityHistory: portfolio.equityHistory.map((point) => ({ ...point })),
  pnl24h: portfolio.pnl24h.map((pnl) => ({ ...pnl })),
  updatedAt: portfolio.updatedAt,
});

const createTradeFill = (
  orderId: string,
  symbol: string,
  side: Order['side'],
  price: number,
  quantity: number,
  feeRate: number,
): TradeFill => {
  const fee = round(price * quantity * feeRate, BALANCE_PRECISION);
  return {
    id: `${orderId}-${nanoid(6)}`,
    orderId,
    symbol,
    side,
    price,
    quantity,
    fee,
    timestamp: Date.now(),
    liquidity: 'taker',
  };
};

export class MatchingEngine {
  private readonly feeRate: number;
  private readonly equityHistoryLimit: number;

  constructor(options: MatchingEngineOptions = {}) {
    this.feeRate = options.feeRate ?? 0.001;
    this.equityHistoryLimit = options.equityHistoryLimit ?? EQUITY_HISTORY_LIMIT_DEFAULT;
  }

  execute(request: MatchingRequest, context: MatchingContext): MatchingResult {
    const now = request.timestamp ?? Date.now();
    const orderId = request.id ?? nanoid(10);
    const { pair, orderBook, ticker, portfolio: currentPortfolio, priceMap, baseCurrency } = context;

    if (request.quantity <= 0) {
      return this.rejectOrder(request, orderId, now, currentPortfolio);
    }

    const referencePrice = this.getReferencePrice(request, orderBook, ticker);
    if (!this.hasSufficientBalance(request, referencePrice, currentPortfolio, pair)) {
      return this.rejectOrder(request, orderId, now, currentPortfolio);
    }

    const clonedPortfolio = clonePortfolio(currentPortfolio);

    const levels = request.side === 'buy' ? orderBook.asks : orderBook.bids;
    let remaining = round(request.quantity, pair.quantityPrecision);
    const fills: TradeFill[] = [];

    for (const level of levels) {
      if (remaining <= 0) {
        break;
      }
      if (!this.levelWithinLimit(request, level)) {
        break;
      }
      const fillQuantity = roundDown(Math.min(level.quantity, remaining), pair.quantityPrecision);
      if (fillQuantity <= 0) {
        continue;
      }
      const trade = createTradeFill(orderId, request.symbol, request.side, level.price, fillQuantity, this.feeRate);
      fills.push(trade);
      remaining = round(Math.max(remaining - fillQuantity, 0), pair.quantityPrecision);
    }

    if (fills.length === 0 && request.type === 'market' && levels.length) {
      const bestLevel = levels[0];
      const quantity = roundDown(Math.min(bestLevel.quantity, remaining), pair.quantityPrecision);
      if (quantity > 0) {
        fills.push(
          createTradeFill(orderId, request.symbol, request.side, bestLevel.price, quantity, this.feeRate),
        );
        remaining = round(Math.max(remaining - quantity, 0), pair.quantityPrecision);
      }
    }

    const filledQuantity = round(request.quantity - remaining, pair.quantityPrecision);
    const totalNotional = fills.reduce((acc, fill) => acc + fill.price * fill.quantity, 0);
    const feesPaid = fills.reduce((acc, fill) => acc + fill.fee, 0);
    const avgPrice = filledQuantity > 0 ? round(totalNotional / filledQuantity, pair.pricePrecision) : null;

    const status: OrderStatus = this.determineStatus(request.type, filledQuantity, remaining, fills.length);

    if (filledQuantity > 0) {
      this.applyPortfolioAdjustments(clonedPortfolio, fills, request.side, pair, feesPaid, baseCurrency);
      this.recalculatePortfolioValue(clonedPortfolio, {
        ...priceMap,
        [pair.baseAsset]: ticker.lastPrice,
        [pair.symbol]: ticker.lastPrice,
      });
    }

    const order: Order = {
      ...request,
      id: orderId,
      createdAt: now,
      updatedAt: now,
      filledQuantity,
      avgPrice,
      status,
      feesPaid: round(feesPaid, BALANCE_PRECISION),
    };

    return {
      order,
      fills,
      remainingQuantity: remaining,
      updatedPortfolio: clonedPortfolio,
    };
  }

  private rejectOrder(request: MatchingRequest, orderId: string, timestamp: number, portfolio: PortfolioState): MatchingResult {
    const rejected: Order = {
      ...request,
      id: orderId,
      createdAt: timestamp,
      updatedAt: timestamp,
      filledQuantity: 0,
      avgPrice: null,
      status: 'rejected',
      feesPaid: 0,
    };

    return {
      order: rejected,
      fills: [],
      remainingQuantity: request.quantity,
      updatedPortfolio: clonePortfolio(portfolio),
    };
  }

  private getReferencePrice(request: MatchingRequest, orderBook: OrderBookSnapshot, ticker: MarketTicker) {
    const levels = request.side === 'buy' ? orderBook.asks : orderBook.bids;
    if (request.type === 'limit' && request.price) {
      return request.price;
    }
    return levels[0]?.price ?? ticker.lastPrice;
  }

  private hasSufficientBalance(request: MatchingRequest, referencePrice: number, portfolio: PortfolioState, pair: MarketPair) {
    const baseHolding = portfolio.assets[pair.baseAsset]?.free ?? 0;
    const quoteHolding = portfolio.assets[pair.quoteAsset]?.free ?? 0;
    if (request.side === 'sell') {
      return baseHolding >= request.quantity;
    }
    const required = referencePrice * request.quantity * (1 + this.feeRate);
    return quoteHolding >= required;
  }

  private levelWithinLimit(request: MatchingRequest, level: OrderBookLevel) {
    if (request.type !== 'limit' || request.price === undefined) {
      return true;
    }
    if (request.side === 'buy') {
      return level.price <= request.price;
    }
    return level.price >= request.price;
  }

  private determineStatus(type: OrderType, filled: number, remaining: number, fillsCount: number): OrderStatus {
    if (filled <= 0) {
      return type === 'limit' && fillsCount === 0 ? 'new' : 'rejected';
    }
    if (remaining > 0) {
      return 'partially_filled';
    }
    return 'filled';
  }

  private applyPortfolioAdjustments(
    portfolio: PortfolioState,
    fills: TradeFill[],
    side: MatchingRequest['side'],
    pair: MarketPair,
    feesPaid: number,
    baseCurrency: string,
  ) {
    const baseAsset = pair.baseAsset;
    const quoteAsset = pair.quoteAsset;
    const base = portfolio.assets[baseAsset] ?? { symbol: baseAsset, free: 0, locked: 0 };
    const quote = portfolio.assets[quoteAsset] ?? { symbol: quoteAsset, free: 0, locked: 0 };

    const quantityFilled = fills.reduce((acc, fill) => acc + fill.quantity, 0);
    const notional = fills.reduce((acc, fill) => acc + fill.price * fill.quantity, 0);

    if (!portfolio.assets[baseAsset]) {
      portfolio.assets[baseAsset] = base;
    }
    if (!portfolio.assets[quoteAsset]) {
      portfolio.assets[quoteAsset] = quote;
    }

    if (side === 'buy') {
      quote.free = round(Math.max(quote.free - (notional + feesPaid), 0), BALANCE_PRECISION);
      base.free = round(base.free + quantityFilled, BALANCE_PRECISION);
    } else {
      base.free = round(Math.max(base.free - quantityFilled, 0), BALANCE_PRECISION);
      quote.free = round(quote.free + Math.max(notional - feesPaid, 0), BALANCE_PRECISION);
    }

    portfolio.baseCurrency = baseCurrency;
  }

  private recalculatePortfolioValue(portfolio: PortfolioState, priceMap: Record<string, number>) {
    const total = Object.values(portfolio.assets).reduce((acc, asset) => {
      const conversion = asset.symbol === portfolio.baseCurrency ? 1 : priceMap[asset.symbol] ?? 0;
      return acc + (asset.free + asset.locked) * conversion;
    }, 0);
    portfolio.totalValue = round(total, 2);
    portfolio.updatedAt = Date.now();
    const history = [...portfolio.equityHistory, { timestamp: portfolio.updatedAt, value: portfolio.totalValue }];
    portfolio.equityHistory = this.equityHistoryLimit > 0
      ? history.slice(-this.equityHistoryLimit)
      : history;
  }
}
