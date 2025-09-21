// File: src/screens/MarketDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import CandlestickChart from '../components/CandlestickChart';
import DepthBook from '../components/DepthBook';
import Card from '../components/Card';
import MetricRow from '../components/MetricRow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { colors, radii, spacing } from '../theme';
import { formatCurrency, formatPercent, formatDateTime } from '../utils/format';
import type { RootStackParamList } from '../navigation';
import { createOrder, executeOrder } from '../services/matchingEngine';
import { placeOrder, updateOrder, addTrade, removeOrder } from '../store/slices/ordersSlice';
import { setBalances } from '../store/slices/portfolioSlice';
import { pushTrade } from '../store/slices/marketSlice';

const intervals: Array<'1m' | '5m' | '1h' | '1d'> = ['1m', '5m', '1h', '1d'];

const MarketDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'MarketDetail'>>();
  const dispatch = useAppDispatch();
  const pair = useAppSelector((state) => state.market.pairs.find((item) => item.id === route.params.pairId));
  const candles = useAppSelector((state) => state.market.candles[route.params.pairId] ?? []);
  const depth = useAppSelector((state) => state.market.orderBook[route.params.pairId] ?? { bids: [], asks: [] });
  const trades = useAppSelector((state) => state.market.trades[route.params.pairId] ?? []);
  const balances = useAppSelector((state) => state.portfolio.balances);
  const baseCurrency = useAppSelector((state) => state.session.baseCurrency);

  const [orderType, setOrderType] = React.useState<'market' | 'limit'>('market');
  const [side, setSide] = React.useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = React.useState(pair?.lastPrice.toString() ?? '0');
  const [quantity, setQuantity] = React.useState('1');

  if (!pair) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Pair not found</Text>
      </View>
    );
  }

  const baseBalance = balances.find((item) => item.symbol === pair.base.symbol)?.available ?? 0;
  const quoteBalance = balances.find((item) => item.symbol === pair.quote.symbol)?.available ?? 0;

  const handleQuickSize = (ratio: number) => {
    if (side === 'buy') {
      const available = quoteBalance;
      const priceNumber = orderType === 'market' ? pair.lastPrice : Number(price) || pair.lastPrice;
      const size = (available * ratio) / priceNumber;
      setQuantity(size.toFixed(4));
    } else {
      const size = baseBalance * ratio;
      setQuantity(size.toFixed(4));
    }
  };

  const submitOrder = () => {
    const priceNumber = orderType === 'market' ? pair.lastPrice : Number(price);
    const quantityNumber = Number(quantity);
    if (!quantityNumber || !priceNumber) return;
    const order = createOrder(pair.id, side, orderType, priceNumber, quantityNumber);
    dispatch(placeOrder(order));
    const { updatedBalances, updatedOrder, trade } = executeOrder(order, pair, balances);
    if (updatedOrder.status === 'filled') {
      dispatch(removeOrder(updatedOrder.id));
    } else {
      dispatch(updateOrder(updatedOrder));
    }
    dispatch(setBalances(updatedBalances));
    if (trade) {
      dispatch(addTrade(trade));
      dispatch(pushTrade(trade));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.heading}>{pair.id}</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        <MetricRow label="Last Price" value={`${pair.lastPrice.toFixed(2)} ${pair.quote.symbol}`} />
        <MetricRow
          label="24h Change"
          value={formatPercent(pair.change24h)}
          accent={pair.change24h >= 0 ? 'positive' : 'negative'}
        />
        <MetricRow label="24h High" value={pair.high24h.toFixed(2)} />
        <MetricRow label="24h Low" value={pair.low24h.toFixed(2)} />
      </Card>
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.intervalRow}>
          {intervals.map((interval) => (
            <TouchableOpacity key={interval} style={styles.intervalButton}>
              <Text style={styles.intervalText}>{interval}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <CandlestickChart candles={candles} />
      </Card>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Depth</Text>
        <DepthBook bids={depth.bids ?? []} asks={depth.asks ?? []} />
      </Card>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Order</Text>
        <View style={styles.toggleRow}>
          {(['buy', 'sell'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSide(value)}
              style={[styles.toggle, side === value && { backgroundColor: value === 'buy' ? colors.positive : colors.negative }]}
            >
              <Text style={styles.toggleText}>{value.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.toggleRow}>
          {(['market', 'limit'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setOrderType(value)}
              style={[styles.toggle, orderType === value && { backgroundColor: colors.accent }]}
            >
              <Text style={styles.toggleText}>{value.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {orderType === 'limit' && (
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="Price"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        )}
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          placeholder="Quantity"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <View style={styles.quickRow}>
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <TouchableOpacity key={ratio} style={styles.quickButton} onPress={() => handleQuickSize(ratio)}>
              <Text style={styles.quickText}>{`${ratio * 100}%`}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: side === 'buy' ? colors.positive : colors.negative }]}
          onPress={submitOrder}
          accessibilityLabel="Submit simulated order"
        >
          <Text style={styles.submitText}>{`${side.toUpperCase()} ${pair.base.symbol}`}</Text>
        </TouchableOpacity>
        <Text style={styles.balanceInfo}>
          {`Available: ${formatCurrency(quoteBalance, baseCurrency)} ${pair.quote.symbol} • ${baseBalance.toFixed(4)} ${pair.base.symbol}`}
        </Text>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Recent Trades</Text>
        {trades.slice(0, 12).map((trade) => (
          <View key={trade.id} style={styles.tradeRow}>
            <Text style={[styles.tradePrice, { color: trade.side === 'buy' ? colors.positive : colors.negative }]}> 
              {trade.price.toFixed(2)}
            </Text>
            <Text style={styles.tradeQuantity}>{trade.quantity.toFixed(3)}</Text>
            <Text style={styles.tradeTime}>{formatDateTime(trade.timestamp)}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  intervalButton: {
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  intervalText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  toggle: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  toggleText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  quickText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  balanceInfo: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tradePrice: {
    fontWeight: '600',
  },
  tradeQuantity: {
    color: colors.textSecondary,
  },
  tradeTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default MarketDetailScreen;
