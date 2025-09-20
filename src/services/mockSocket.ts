// File: src/services/mockSocket.ts
// SIMULATION ONLY – NO REAL MONEY OR APIS
import { Candle, OrderBookSnapshot, Pair, Tick } from '../types';
import { randomInRange } from '../utils/math';

type EventMap = {
  tick: Tick;
  candle: { pairId: string; candle: Candle };
  depth: OrderBookSnapshot;
  trade: { pairId: string; price: number; amount: number; side: 'buy' | 'sell'; time: number };
};

type Listener<K extends keyof EventMap> = (payload: EventMap[K]) => void;

class MockSocket {
  private listeners: { [K in keyof EventMap]: Set<Listener<K>> } = {
    tick: new Set(),
    candle: new Set(),
    depth: new Set(),
    trade: new Set(),
  };

  private timers: ReturnType<typeof setInterval>[] = [];
  private pairs: Pair[] = [];
  private candles: Record<string, Candle[]> = {};

  start(pairs: Pair[], initialCandles: Record<string, Candle[]>): void {
    this.stop();
    this.pairs = pairs.map((pair) => ({ ...pair, history: [...pair.history] }));
    this.candles = Object.keys(initialCandles).reduce<Record<string, Candle[]>>((acc, key) => {
      acc[key] = initialCandles[key].map((candle) => ({ ...candle }));
      return acc;
    }, {});

    this.pairs.forEach((pair) => {
      const loop = () => {
        const change = randomInRange(-0.015, 0.018);
        const price = Math.max(0.0001, pair.lastPrice * (1 + change));
        pair.lastPrice = price;
        pair.change24h = randomInRange(-0.12, 0.12);
        pair.history.push(price);
        if (pair.history.length > 120) {
          pair.history.shift();
        }
        const tick: Tick = {
          pairId: pair.id,
          price,
          change24h: pair.change24h,
          time: Date.now(),
        };
        this.emit('tick', tick);

        const candles = this.candles[pair.id] ?? [];
        const latest = candles[candles.length - 1];
        if (latest) {
          latest.close = price;
          latest.high = Math.max(latest.high, price);
          latest.low = Math.min(latest.low, price);
          latest.volume += randomInRange(5, 20);
          this.emit('candle', { pairId: pair.id, candle: { ...latest } });
        }

        const depth = this.generateDepth(pair.id, price);
        this.emit('depth', depth);

        this.emit('trade', {
          pairId: pair.id,
          price,
          amount: randomInRange(0.01, 0.5),
          side: change >= 0 ? 'buy' : 'sell',
          time: Date.now(),
        });
      };
      loop();
      const timer = setInterval(loop, 4000 + Math.random() * 3000);
      this.timers.push(timer);
    });
  }

  stop(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers = [];
  }

  on<K extends keyof EventMap>(event: K, listener: Listener<K>): () => void {
    this.listeners[event].add(listener as never);
    return () => {
      this.listeners[event].delete(listener as never);
    };
  }

  private emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners[event].forEach((listener) => listener(payload as never));
  }

  private generateDepth(pairId: string, price: number): OrderBookSnapshot {
    const bids = Array.from({ length: 10 }).map((_, index) => {
      const levelPrice = price * (1 - index * 0.0015);
      return {
        price: Number(levelPrice.toFixed(2)),
        amount: randomInRange(0.1, 2.4),
        side: 'bid' as const,
      };
    });
    const asks = Array.from({ length: 10 }).map((_, index) => {
      const levelPrice = price * (1 + index * 0.0015);
      return {
        price: Number(levelPrice.toFixed(2)),
        amount: randomInRange(0.1, 2.4),
        side: 'ask' as const,
      };
    });
    return { pairId, bids, asks };
  }
}

export const mockSocket = new MockSocket();
