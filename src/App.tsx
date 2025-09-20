// File: src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigation';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { storage } from './services/storage';
import { hydrateSession, SessionState } from './store/slices/sessionSlice';
import { hydratePortfolio, updateEarnPositions, PortfolioState } from './store/slices/portfolioSlice';
import { hydrateSwap, SwapState } from './store/slices/swapSlice';
import { updateCandle, updateDepth, updateTick, addTrade } from './store/slices/marketSlice';
import { mockSocket } from './services/mockSocket';
import { accrueYield } from './services/yield';
import { colors } from './theme';

const Bootstrap: React.FC = () => {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session);
  const portfolio = useAppSelector((state) => state.portfolio);
  const swap = useAppSelector((state) => state.swap);

  React.useEffect(() => {
    const loadState = async () => {
      const [sessionData, portfolioData, swapData] = await Promise.all([
        storage.get<Partial<SessionState>>('session'),
        storage.get<Partial<PortfolioState>>('portfolio'),
        storage.get<Partial<SwapState>>('swap'),
      ]);
      if (sessionData) {
        dispatch(hydrateSession(sessionData));
      }
      if (portfolioData) {
        dispatch(hydratePortfolio(portfolioData));
      }
      if (swapData) {
        dispatch(hydrateSwap(swapData));
      }
    };
    loadState();
  }, [dispatch]);

  React.useEffect(() => {
    storage.set('session', {
      selectedWalletId: session.selectedWalletId,
      theme: session.theme,
      currency: session.currency,
      wallets: session.wallets,
    });
  }, [session.currency, session.selectedWalletId, session.theme, session.wallets]);

  React.useEffect(() => {
    storage.set('portfolio', {
      balances: portfolio.balances,
      transactions: portfolio.transactions,
      earnPositions: portfolio.earnPositions,
      simulationSpeed: portfolio.simulationSpeed,
    });
  }, [portfolio.balances, portfolio.transactions, portfolio.earnPositions, portfolio.simulationSpeed]);

  React.useEffect(() => {
    storage.set('swap', swap);
  }, [swap]);

  React.useEffect(() => {
    const state = store.getState();
    mockSocket.start(state.market.pairs, state.market.candlesByPair);
    const offTick = mockSocket.on('tick', ({ pairId, price, change24h }) => {
      dispatch(updateTick({ pairId, price, change24h }));
    });
    const offCandle = mockSocket.on('candle', ({ pairId, candle }) => {
      dispatch(updateCandle({ pairId, candle }));
    });
    const offDepth = mockSocket.on('depth', (snapshot) => {
      dispatch(updateDepth(snapshot));
    });
    const offTrade = mockSocket.on('trade', (trade) => {
      dispatch(
        addTrade({
          id: `trade-${trade.time}`,
          pairId: trade.pairId,
          price: trade.price,
          amount: trade.amount,
          side: trade.side,
          time: trade.time,
        }),
      );
    });
    return () => {
      offTick();
      offCandle();
      offDepth();
      offTrade();
      mockSocket.stop();
    };
  }, [dispatch]);

  const speed = portfolio.simulationSpeed;
  const earnProducts = portfolio.earnProducts;
  const positionsRef = React.useRef(portfolio.earnPositions);
  React.useEffect(() => {
    positionsRef.current = portfolio.earnPositions;
  }, [portfolio.earnPositions]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (positionsRef.current.length === 0) return;
      const updated = accrueYield(positionsRef.current, earnProducts, Date.now(), speed);
      dispatch(updateEarnPositions(updated));
    }, Math.max(4000 / speed, 1500));
    return () => clearInterval(interval);
  }, [dispatch, earnProducts, speed]);

  return <RootNavigator />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <Bootstrap />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
