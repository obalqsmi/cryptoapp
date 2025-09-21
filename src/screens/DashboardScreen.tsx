// File: src/screens/DashboardScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Card from '../components/Card';
import EquityChart from '../components/EquityChart';
import AllocationList from '../components/AllocationList';
import MetricRow from '../components/MetricRow';
import { useAppSelector } from '../store/hooks';
import { colors, spacing } from '../theme';
import { formatCurrency, formatPercent } from '../utils/format';

const DashboardScreen: React.FC = () => {
  const { balances, allocations, equityHistory } = useAppSelector((state) => state.portfolio);
  const baseCurrency = useAppSelector((state) => state.session.baseCurrency);
  const totalValue = balances.reduce((sum, balance) => sum + balance.amount * 1000, 0);
  const last = equityHistory[equityHistory.length - 1] ?? totalValue;
  const previous = equityHistory[equityHistory.length - 2] ?? last;
  const change = last - previous;
  const changePercent = previous ? (change / previous) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.heading}>Overview</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>{formatCurrency(totalValue, baseCurrency)}</Text>
        <Text style={[styles.balanceChange, { color: change >= 0 ? colors.positive : colors.negative }]}>
          {formatCurrency(change, baseCurrency)} ({formatPercent(changePercent)})
        </Text>
      </Card>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Equity Curve</Text>
        <EquityChart values={equityHistory} />
      </Card>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Allocation</Text>
        <AllocationList allocations={allocations} />
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Stats</Text>
        <MetricRow label="Positions" value={`${balances.length}`} />
        <MetricRow label="Top Holding" value={allocations[0]?.symbol ?? '—'} />
        <MetricRow label="Cash" value={formatCurrency(balances.find((b) => b.symbol === 'USDT')?.amount ?? 0)} />
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
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  balanceValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  balanceChange: {
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
});

export default DashboardScreen;
