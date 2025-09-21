// File: src/screens/OrderHistoryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Card from '../components/Card';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { colors, spacing, radii } from '../theme';
import { formatCurrency, formatDateTime } from '../utils/format';
import { removeOrder } from '../store/slices/ordersSlice';

const OrderHistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { openOrders, tradeHistory } = useAppSelector((state) => state.orders);
  const baseCurrency = useAppSelector((state) => state.session.baseCurrency);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.heading}>Orders</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Open Orders</Text>
        {openOrders.length === 0 && <Text style={styles.empty}>No open orders</Text>}
        {openOrders.map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <View>
              <Text style={styles.orderTitle}>{`${order.side.toUpperCase()} ${order.pairId}`}</Text>
              <Text style={styles.orderMeta}>{`${order.quantity} @ ${order.price}`}</Text>
            </View>
            <TouchableOpacity
              onPress={() => dispatch(removeOrder(order.id))}
              style={styles.cancelButton}
              accessibilityLabel="Cancel order"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Trade History</Text>
        {tradeHistory.length === 0 && <Text style={styles.empty}>No trades yet</Text>}
        {tradeHistory.map((trade) => (
          <View key={trade.id} style={styles.tradeRow}>
            <View>
              <Text style={[styles.tradeSide, { color: trade.side === 'buy' ? colors.positive : colors.negative }]}>
                {trade.side.toUpperCase()} {trade.pairId}
              </Text>
              <Text style={styles.tradeMeta}>{formatDateTime(trade.timestamp)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.tradeValue}>{`${trade.quantity.toFixed(4)} @ ${trade.price.toFixed(2)}`}</Text>
              <Text style={styles.tradeMeta}>Fee: {formatCurrency(trade.fee, baseCurrency)}</Text>
            </View>
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
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  empty: {
    color: colors.textSecondary,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  orderMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tradeSide: {
    fontWeight: '600',
  },
  tradeMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  tradeValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;
