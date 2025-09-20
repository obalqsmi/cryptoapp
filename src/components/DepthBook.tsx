// File: src/components/DepthBook.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OrderBookLevel } from '../types';
import { colors, radii, spacing } from '../theme';
import { formatNumber } from '../utils/format';

interface DepthBookProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  onSelect?: (level: OrderBookLevel) => void;
}

const DepthBook: React.FC<DepthBookProps> = ({ bids, asks, onSelect }) => {
  const maxBid = Math.max(...bids.map((level) => level.amount), 1);
  const maxAsk = Math.max(...asks.map((level) => level.amount), 1);

  const renderLevel = (level: OrderBookLevel, max: number, color: string) => {
    const ratio = Math.min(level.amount / max, 1);
    const widthPercent = `${Math.round(ratio * 100)}%` as const;
    return (
      <TouchableOpacity
        key={`${level.side}-${level.price}`}
        style={styles.row}
        onPress={() => onSelect?.(level)}
        accessibilityRole="button"
        accessibilityLabel={`Price ${level.price}, amount ${level.amount}`}
      >
        <View style={[styles.depthBar, { width: widthPercent, backgroundColor: color }]} />
        <View style={styles.rowContent}>
          <Text style={styles.price}>{formatNumber(level.price, 2)}</Text>
          <Text style={styles.amount}>{formatNumber(level.amount, 3)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.title}>Bids</Text>
        {bids.map((level) => renderLevel(level, maxBid, 'rgba(37, 209, 106, 0.2)'))}
      </View>
      <View style={styles.column}>
        <Text style={styles.title}>Asks</Text>
        {asks.map((level) => renderLevel(level, maxAsk, 'rgba(255, 77, 103, 0.2)'))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  column: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  title: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.sm,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    flex: 1,
  },
  depthBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    color: colors.textSecondary,
    width: 80,
    textAlign: 'right',
  },
});

export default DepthBook;
