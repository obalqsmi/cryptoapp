// File: src/components/AllocationList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Allocation } from '../types';
import { colors, spacing } from '../theme';
import { formatPercent } from '../utils/format';

type Props = {
  allocations: Allocation[];
};

const AllocationList: React.FC<Props> = ({ allocations }) => (
  <View>
    {allocations.map((allocation) => (
      <View key={allocation.symbol} style={styles.row}>
        <View>
          <Text style={styles.symbol}>{allocation.symbol}</Text>
          <Text style={styles.name}>{allocation.name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.value}>${allocation.value.toLocaleString()}</Text>
          <Text style={styles.weight}>{formatPercent(allocation.weight * 100)}</Text>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  symbol: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  weight: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});

export default AllocationList;
