// File: src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation';
import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { hydrateSession } from './store/slices/sessionSlice';
import { hydratePortfolio, setBalances, setAllocations, setEquityHistory } from './store/slices/portfolioSlice';
import { hydrateOrders } from './store/slices/ordersSlice';
import { seedMarket, updateTick, updateCandle, updateDepth, pushTrade } from './store/slices/marketSlice';
import { storage } from './services/storage';
import { seedBalances, seedCandles, seedEquityHistory, seedPairs, allTokens } from './services/seed';
import { mockSocket } from './services/mockSocket';
import { colors } from './theme';
import { RootPersistedState } from './types';

const Bootstrap: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    let cleanup: (() => void) | undefined;
    const bootstrap = async () => {
      const persisted = await storage.get<RootPersistedState>('persisted-state');
      const pairs = seedPairs();
      const candles = seedCandles(pairs);
      dispatch(seedMarket({ pairs, candles }));

      if (persisted) {
        dispatch(hydrateSession(persisted.session));
        dispatch(hydratePortfolio(persisted.portfolio));
        dispatch(hydrateOrders(persisted.orders));
      } else {
        const balances = seedBalances();
        const total = balances.reduce((sum, balance) => sum + balance.amount * 1000, 0);
        const allocations = balances.map((balance) => ({
          symbol: balance.symbol,
          name: allTokens.find((token) => token.symbol === balance.symbol)?.name ?? balance.symbol,
          value: balance.amount * 1000,
          weight: total ? (balance.amount * 1000) / total : 0,
        }));
        dispatch(setBalances(balances));
        dispatch(setAllocations(allocations));
        dispatch(setEquityHistory(seedEquityHistory()));
      }

      mockSocket.start(pairs, candles);
      const offTick = mockSocket.on('tick', ({ pairId, price, change24h }) =>
        dispatch(updateTick({ pairId, price, change24h }))
      );
      const offCandle = mockSocket.on('candle', ({ pairId, candle }) => dispatch(updateCandle({ pairId, candle })));
      const offDepth = mockSocket.on('depth', ({ pairId, bids, asks }) => dispatch(updateDepth({ pairId, bids, asks })));
      const offTrade = mockSocket.on('trade', (trade) => dispatch(pushTrade(trade)));

      cleanup = () => {
        offTick();
        offCandle();
        offDepth();
        offTrade();
        mockSocket.stop();
      };
    };

    bootstrap();
    return () => {
      cleanup?.();
    };
  }, [dispatch]);

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const snapshot: RootPersistedState = {
        session: state.session,
        portfolio: state.portfolio,
        orders: state.orders,
      };
      storage.set('persisted-state', snapshot).catch(() => undefined);
    });
    return unsubscribe;
  }, []);

  return <RootNavigator />;
};

const App: React.FC = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Bootstrap />
    </SafeAreaProvider>
  </Provider>
);

export default App;
