// File: src/components/BalanceHero.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';
import { formatCurrency, formatPercent } from '../utils/format';

interface BalanceHeroProps {
  balance: number;
  pnlAmount: number;
  pnlPercent: number;
  currency: string;
}

const BalanceHero: React.FC<BalanceHeroProps> = ({ balance, pnlAmount, pnlPercent, currency }) => {
  const pnlColor = pnlAmount >= 0 ? colors.success : colors.danger;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>{formatCurrency(balance, currency)}</Text>
      <View style={styles.pnlRow}>
        <Text style={[styles.pnl, { color: pnlColor }]}>
          {formatCurrency(pnlAmount, currency)} ({formatPercent(pnlPercent)})
        </Text>
        <Text style={styles.pnlCaption}>24h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadows.card,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  balance: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pnl: {
    fontSize: 15,
    fontWeight: '600',
  },
  pnlCaption: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: spacing.sm,
  },
});

export default BalanceHero;
