// File: src/components/CoinRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pair } from '../types';
import { colors, radii, spacing } from '../theme';
import { formatCurrency, formatPercent } from '../utils/format';
import IconCircle from './IconCircle';
import Sparkline from './Sparkline';

interface CoinRowProps {
  pair: Pair;
  currency: string;
  onPress?: () => void;
}

const CoinRow: React.FC<CoinRowProps> = ({ pair, currency, onPress }) => {
  const changeColor = pair.change24h >= 0 ? colors.success : colors.danger;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pair.base.name} details`}
    >
      <View style={styles.left}>
        <IconCircle icon={pair.base.icon} />
        <View>
          <Text style={styles.symbol}>{pair.base.symbol}</Text>
          <Text style={styles.name}>{pair.base.name}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <View style={styles.metrics}>
          <Text style={styles.price}>{formatCurrency(pair.lastPrice, currency)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>{formatPercent(pair.change24h)}</Text>
        </View>
        <Sparkline data={pair.history.slice(-30)} width={70} height={28} color={changeColor} />
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metrics: {
    marginRight: spacing.md,
    alignItems: 'flex-end',
  },
  symbol: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  change: {
    marginTop: spacing.xs,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default CoinRow;
