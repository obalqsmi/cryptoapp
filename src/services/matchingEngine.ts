// File: src/services/matchingEngine.ts
// SIMULATION ONLY – no real APIs
import { MarketPair, Order, OrderSide, OrderType, PortfolioBalance, Trade } from '../types';

const FEE_RATE = 0.001;

const adjustBalance = (
  balances: PortfolioBalance[],
  symbol: string,
  delta: number,
): PortfolioBalance[] => {
  const clone = balances.map((balance) => ({ ...balance }));
  const target = clone.find((item) => item.symbol === symbol);
  if (target) {
    target.amount = Number((target.amount + delta).toFixed(8));
    target.available = Number((target.available + delta).toFixed(8));
  } else {
    clone.push({ symbol, amount: delta, available: delta });
  }
  return clone;
};

export type MatchResult = {
  updatedBalances: PortfolioBalance[];
  updatedOrder: Order;
  trade: Trade | null;
};

export const executeOrder = (
  order: Order,
  pair: MarketPair,
  balances: PortfolioBalance[],
): MatchResult => {
  const baseSymbol = pair.base.symbol;
  const quoteSymbol = pair.quote.symbol;
  const filledQuantity = order.type === 'market' ? order.quantity : order.quantity;
  const price = order.type === 'market' ? pair.lastPrice : order.price;
  const cost = filledQuantity * price;
  const fee = cost * FEE_RATE;
  let updatedBalances = balances;

  if (order.side === 'buy') {
    updatedBalances = adjustBalance(updatedBalances, quoteSymbol, -cost - fee);
    updatedBalances = adjustBalance(updatedBalances, baseSymbol, filledQuantity);
  } else {
    updatedBalances = adjustBalance(updatedBalances, baseSymbol, -filledQuantity);
    updatedBalances = adjustBalance(updatedBalances, quoteSymbol, cost - fee);
  }

  const updatedOrder: Order = {
    ...order,
    filledQuantity,
    status: 'filled',
  };

  const trade: Trade = {
    id: `${order.id}-trade`,
    orderId: order.id,
    pairId: pair.id,
    side: order.side,
    price,
    quantity: filledQuantity,
    fee,
    timestamp: Date.now(),
  };

  return {
    updatedBalances,
    updatedOrder,
    trade,
  };
};

export const cancelOrder = (order: Order): Order => ({
  ...order,
  status: 'cancelled',
});

export const createOrder = (
  pairId: string,
  side: OrderSide,
  type: OrderType,
  price: number,
  quantity: number,
): Order => ({
  id: `${pairId}-${Date.now()}`,
  pairId,
  side,
  type,
  price,
  quantity,
  filledQuantity: 0,
  status: 'open',
  createdAt: Date.now(),
});
