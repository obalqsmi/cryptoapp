// File: src/screens/ActionsScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { colors, radii, spacing } from '../theme';
import { useAppSelector } from '../store/hooks';
import { RootStackParamList, TabParamList } from '../navigation';
import ListSection from '../components/ListSection';
import { formatCurrency } from '../utils/format';
import { selectionAsync } from '../utils/haptics';

type ActionsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Actions'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ActionsScreen: React.FC = () => {
  const navigation = useNavigation<ActionsNavigationProp>();
  const { transactions } = useAppSelector((state) => state.portfolio);
  const { currency } = useAppSelector((state) => state.session);

  const recentTransactions = transactions.slice(0, 6);

  const goTo = (route: keyof TabParamList | 'Buy') => {
    selectionAsync();
    if (route === 'Buy') {
      navigation.navigate('Buy');
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Quick Actions</Text>
        <View style={styles.actionRow}>
          {(
            [
              { label: 'Send', route: 'Actions' as const },
              { label: 'Receive', route: 'Actions' as const },
              { label: 'Earn', route: 'Earn' as const },
              { label: 'Swap', route: 'Swap' as const },
            ] satisfies { label: string; route: keyof TabParamList }[]
          ).map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.roundButton}
              onPress={() => goTo(action.route)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={styles.roundLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.manageCard}>
          <Text style={styles.manageTitle}>Manage</Text>
          <View style={styles.manageRow}>
            {(
              [
                { label: 'Buy Crypto', route: 'Buy' as const },
                { label: 'Swap', route: 'Swap' as const },
              ] satisfies { label: string; route: 'Buy' | keyof TabParamList }[]
            ).map((action, index) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.manageButton, index === 1 && styles.manageButtonLast]}
                onPress={() => goTo(action.route)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={styles.manageLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ListSection title="Recent Activity">
          {recentTransactions.map((txn) => (
            <View key={txn.id} style={styles.txnRow}>
              <View>
                <Text style={styles.txnTitle}>{txn.description}</Text>
                <Text style={styles.txnSubtitle}>{new Date(txn.timestamp).toLocaleTimeString()}</Text>
              </View>
              <Text style={[styles.txnAmount, { color: txn.amountFiat >= 0 ? colors.success : colors.danger }]}>
                {formatCurrency(txn.amountFiat, currency)}
              </Text>
            </View>
          ))}
        </ListSection>
      </ScrollView>
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
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  roundButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  manageCard: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  manageTitle: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  manageRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  manageButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  manageButtonLast: {
    marginRight: 0,
    marginLeft: spacing.sm,
  },
  manageLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  txnTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  txnSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  txnAmount: {
    fontWeight: '700',
  },
});

export default ActionsScreen;
