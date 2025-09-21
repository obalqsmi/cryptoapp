// File: src/services/mockSocket.ts
// SIMULATION ONLY – no real APIs
import { Candle, DepthLevel, MarketPair, Trade } from '../types';

export type SocketEventMap = {
  tick: { pairId: string; price: number; change24h: number };
  candle: { pairId: string; candle: Candle };
  depth: { pairId: string; bids: DepthLevel[]; asks: DepthLevel[] };
  trade: Trade;
};

type Listener<K extends keyof SocketEventMap> = (payload: SocketEventMap[K]) => void;

class MockSocket {
  private timers: ReturnType<typeof setInterval>[] = [];

  private listeners: { [K in keyof SocketEventMap]: Set<Listener<K>> } = {
    tick: new Set(),
    candle: new Set(),
    depth: new Set(),
    trade: new Set(),
  };

  start(pairs: MarketPair[], candles: Record<string, Candle[]>): void {
    this.stop();
    pairs.forEach((pair) => {
      const timer = setInterval(() => {
        const drift = (Math.random() - 0.5) * 0.04;
        const newPrice = Math.max(0.0001, pair.lastPrice * (1 + drift));
        pair.lastPrice = Number(newPrice.toFixed(2));
        pair.change24h = pair.change24h + drift * 6;
        this.emit('tick', {
          pairId: pair.id,
          price: pair.lastPrice,
          change24h: pair.change24h,
        });

        const history = candles[pair.id] ?? [];
        const latest = history[history.length - 1];
        if (latest) {
          latest.close = pair.lastPrice;
          latest.high = Math.max(latest.high, pair.lastPrice);
          latest.low = Math.min(latest.low, pair.lastPrice);
          latest.volume += Math.random() * 500;
          this.emit('candle', { pairId: pair.id, candle: { ...latest } });
        }

        const bids = Array.from({ length: 8 }).map((_, index) => ({
          price: Number((pair.lastPrice * (1 - index * 0.0015)).toFixed(2)),
          amount: Number((Math.random() * 5 + 0.5).toFixed(2)),
        }));
        const asks = Array.from({ length: 8 }).map((_, index) => ({
          price: Number((pair.lastPrice * (1 + index * 0.0015)).toFixed(2)),
          amount: Number((Math.random() * 5 + 0.5).toFixed(2)),
        }));
        this.emit('depth', {
          pairId: pair.id,
          bids,
          asks,
        });

        this.emit('trade', {
          id: `${pair.id}-${Date.now()}`,
          orderId: 'stream',
          pairId: pair.id,
          side: drift >= 0 ? 'buy' : 'sell',
          price: pair.lastPrice,
          quantity: Number((Math.random() * 2).toFixed(3)),
          fee: 0,
          timestamp: Date.now(),
        });
      }, 4000 + Math.random() * 2000);
      this.timers.push(timer);
    });
  }

  stop(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers = [];
    (Object.keys(this.listeners) as (keyof SocketEventMap)[]).forEach((key) => {
      this.listeners[key].clear();
    });
  }

  on<K extends keyof SocketEventMap>(event: K, listener: Listener<K>): () => void {
    this.listeners[event].add(listener as never);
    return () => this.listeners[event].delete(listener as never);
  }

  private emit<K extends keyof SocketEventMap>(event: K, payload: SocketEventMap[K]): void {
    this.listeners[event].forEach((listener) => listener(payload));
  }
}

export const mockSocket = new MockSocket();
