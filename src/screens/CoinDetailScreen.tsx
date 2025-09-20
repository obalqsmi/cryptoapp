// File: src/screens/CoinDetailScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { colors, radii, spacing } from '../theme';
import { RootStackParamList } from '../navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import CandleChart from '../components/CandleChart';
import DepthBook from '../components/DepthBook';
import StatRow from '../components/StatRow';
import Sheet from '../components/Sheet';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';
import { matchingEngine } from '../services/matching';
import { recordTransaction, setBalances } from '../store/slices/portfolioSlice';
import { selectionAsync } from '../utils/haptics';

const TABS = ['Overview', 'Orderbook', 'Activity'] as const;
type TabOption = (typeof TABS)[number];

const CoinDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CoinDetail'>>();
  const { pairId } = route.params;
  const dispatch = useAppDispatch();
  const { pairs, candlesByPair, orderBooks, recentTrades } = useAppSelector((state) => state.market);
  const { balances } = useAppSelector((state) => state.portfolio);
  const pair = pairs.find((item) => item.id === pairId) ?? pairs[0];
  const candles = candlesByPair[pairId] ?? [];
  const orderbook = orderBooks[pairId];
  const trades = recentTrades[pairId] ?? [];
  const [tab, setTab] = React.useState<TabOption>('Overview');
  const [watched, setWatched] = React.useState(false);
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const [side, setSide] = React.useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = React.useState('100');

  const width = Dimensions.get('window').width - spacing.lg * 2;

  const handleQuickTrade = () => {
    const amountFiat = Number.parseFloat(amount) || 0;
    const result = matchingEngine.marketOrder({
      pair,
      side,
      amountFiat,
      balances,
    });
    dispatch(setBalances(result.balances));
    dispatch(recordTransaction(result.transaction));
    setSheetVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{pair.base.symbol}</Text>
            <Text style={styles.subtitle}>{pair.base.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.watchButton, watched && styles.watchButtonActive]}
            onPress={() => setWatched((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Toggle watch"
          >
            <Text style={[styles.watchLabel, watched && styles.watchLabelActive]}>{watched ? 'Watching' : 'Watch'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>{formatCurrency(pair.lastPrice)}</Text>
        <Text style={[styles.change, { color: pair.change24h >= 0 ? colors.success : colors.danger }]}>
          {formatPercent(pair.change24h)} 24h
        </Text>

        <CandleChart candles={candles} currency="USD" width={width} />

        <View style={styles.tabRow}>
          {TABS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.tabButton, option === tab && styles.tabButtonActive]}
              onPress={() => {
                selectionAsync();
                setTab(option);
              }}
              accessibilityRole="button"
              accessibilityLabel={option}
            >
              <Text style={[styles.tabLabel, option === tab && styles.tabLabelActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'Overview' ? (
          <View style={styles.card}>
            <StatRow label="Market Cap" value={formatCurrency(pair.lastPrice * 1000000)} />
            <StatRow label="Circulating" value={`${formatNumber(21000000, 0)} ${pair.base.symbol}`} />
            <StatRow label="Volume" value={formatCurrency(pair.lastPrice * 25000)} />
          </View>
        ) : null}

        {tab === 'Orderbook' && orderbook ? (
          <DepthBook
            bids={orderbook.bids}
            asks={orderbook.asks}
            onSelect={(level) => {
              setAmount(level.price.toString());
              setSheetVisible(true);
            }}
          />
        ) : null}

        {tab === 'Activity' ? (
          <View style={styles.card}>
            {trades.map((trade) => (
              <View key={trade.id} style={styles.tradeRow}>
                <Text style={[styles.tradePrice, { color: trade.side === 'buy' ? colors.success : colors.danger }]}>
                  {formatCurrency(trade.price)}
                </Text>
                <Text style={styles.tradeAmount}>{formatNumber(trade.amount, 4)} {pair.base.symbol}</Text>
                <Text style={styles.tradeTime}>{new Date(trade.time).toLocaleTimeString()}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.tradeButton, styles.buyButton]}
            onPress={() => {
              setSide('buy');
              setSheetVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Quick buy"
          >
            <Text style={styles.tradeLabel}>Quick Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tradeButton, styles.sellButton]}
            onPress={() => {
              setSide('sell');
              setSheetVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Quick sell"
          >
            <Text style={styles.tradeLabel}>Quick Sell</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Sheet
        visible={sheetVisible}
        title={`${side === 'buy' ? 'Buy' : 'Sell'} ${pair.base.symbol}`}
        onClose={() => setSheetVisible(false)}
        confirmLabel="Confirm"
        onConfirm={handleQuickTrade}
      >
        <Text style={styles.sheetLabel}>Amount (USD)</Text>
        <TextInput
          style={styles.sheetInput}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          accessibilityLabel="Trade amount"
        />
      </Sheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  watchButton: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  watchButtonActive: {
    backgroundColor: colors.accent,
  },
  watchLabel: {
    color: colors.textPrimary,
  },
  watchLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  change: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tabButton: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.card,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tradePrice: {
    fontWeight: '600',
  },
  tradeAmount: {
    color: colors.textPrimary,
  },
  tradeTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  tradeButton: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  buyButton: {
    backgroundColor: colors.accent,
  },
  sellButton: {
    backgroundColor: colors.card,
  },
  tradeLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sheetLabel: {
    color: colors.textSecondary,
  },
  sheetInput: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.textPrimary,
  },
});

export default CoinDetailScreen;
