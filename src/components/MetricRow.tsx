// File: src/components/MetricRow.tsx
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  label: string;
  value: string;
  accent?: 'positive' | 'negative' | 'default';
};

const MetricRow: React.FC<Props> = ({ label, value, accent = 'default' }) => {
  const color =
    accent === 'positive' ? colors.positive : accent === 'negative' ? colors.negative : colors.textPrimary;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MetricRow;
