// File: src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Card from '../components/Card';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme, setBaseCurrency, signOut } from '../store/slices/sessionSlice';
import { setSimulationSpeed, clearOrders } from '../store/slices/ordersSlice';
import { setBalances, setAllocations, setEquityHistory } from '../store/slices/portfolioSlice';
import { seedBalances, seedEquityHistory, seedPairs, seedCandles, allTokens } from '../services/seed';
import { seedMarket } from '../store/slices/marketSlice';
import { colors, spacing, radii } from '../theme';
import { mockSocket } from '../services/mockSocket';

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.session);
  const simulationSpeed = useAppSelector((state) => state.orders.simulationSpeed);

  const handleReset = () => {
    const pairs = seedPairs();
    const candles = seedCandles(pairs);
    const balances = seedBalances();
    const total = balances.reduce((sum, balance) => sum + balance.amount * 1000, 0);
    const allocations = balances.map((balance) => ({
      symbol: balance.symbol,
      name: allTokens.find((token) => token.symbol === balance.symbol)?.name ?? balance.symbol,
      value: balance.amount * 1000,
      weight: total ? (balance.amount * 1000) / total : 0,
    }));
    dispatch(seedMarket({ pairs, candles }));
    dispatch(setBalances(balances));
    dispatch(setAllocations(allocations));
    dispatch(setEquityHistory(seedEquityHistory()));
    dispatch(clearOrders());
    mockSocket.stop();
    mockSocket.start(pairs, candles);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.heading}>Settings</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity onPress={() => dispatch(toggleTheme())} style={styles.button} accessibilityLabel="Toggle theme">
          <Text style={styles.buttonText}>Theme: {session.theme === 'dark' ? 'Dark' : 'Light'}</Text>
        </TouchableOpacity>
      </Card>
      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}>
          {(['USD', 'EUR'] as const).map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[styles.choice, session.baseCurrency === currency && styles.choiceActive]}
              onPress={() => dispatch(setBaseCurrency(currency))}
            >
              <Text style={styles.choiceText}>{currency}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {[1, 5, 20].map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[styles.choice, simulationSpeed === speed && styles.choiceActive]}
              onPress={() => dispatch(setSimulationSpeed(speed as 1 | 5 | 20))}
            >
              <Text style={styles.choiceText}>{`${speed}×`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>Session</Text>
        <TouchableOpacity onPress={handleReset} style={styles.button} accessibilityLabel="Reset simulation">
          <Text style={styles.buttonText}>Reset Simulation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch(signOut())} style={styles.button} accessibilityLabel="Sign out">
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  choice: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  choiceActive: {
    backgroundColor: colors.accent,
  },
  choiceText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default SettingsScreen;
