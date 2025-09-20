// File: src/screens/EarnScreen.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { colors, radii, spacing } from '../theme';
import BalanceHero from '../components/BalanceHero';
import Chip from '../components/Chip';
import Sheet from '../components/Sheet';
import { addEarnPosition, recordTransaction, setBalances } from '../store/slices/portfolioSlice';
import { formatNumber } from '../utils/format';
import { selectionAsync } from '../utils/haptics';

const FILTERS = ['For You', 'High APY', 'Stablecoins', 'All'] as const;
type FilterOption = (typeof FILTERS)[number];

const EarnScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector((state) => state.session);
  const { pairs } = useAppSelector((state) => state.market);
  const { balances, earnProducts } = useAppSelector((state) => state.portfolio);
  const [filter, setFilter] = React.useState<FilterOption>('For You');
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = React.useState('50');

  const totalBalance = React.useMemo(() => {
    const priceMap: Record<string, number> = { usd: 1, usdc: 1, usdt: 1 };
    pairs.forEach((pair) => {
      priceMap[pair.base.id] = pair.lastPrice;
    });
    return Object.entries(balances).reduce((sum, [tokenId, amount]) => {
      const price = priceMap[tokenId] ?? 1;
      return sum + amount * price;
    }, 0);
  }, [balances, pairs]);

  const pnlAmount = totalBalance * 0.012;
  const pnlPercent = totalBalance > 0 ? pnlAmount / totalBalance : 0;

  const filteredProducts = React.useMemo(() => {
    if (filter === 'All') return earnProducts;
    if (filter === 'High APY') {
      return earnProducts.filter((product) => product.apy > 0.07);
    }
    if (filter === 'Stablecoins') {
      return earnProducts.filter((product) => ['usdc', 'usdt'].includes(product.token.id));
    }
    return earnProducts.slice(0, 3);
  }, [earnProducts, filter]);

  const selectedProduct = earnProducts.find((product) => product.id === selectedProductId) ?? null;

  const handleStake = () => {
    if (!selectedProduct) return;
    const amountValue = Number.parseFloat(stakeAmount) || 0;
    const tokenBalance = balances[selectedProduct.token.id] ?? 0;
    const updatedBalances = {
      ...balances,
      [selectedProduct.token.id]: Math.max(0, tokenBalance - amountValue),
    };
    dispatch(setBalances(updatedBalances));
    dispatch(
      addEarnPosition({
        id: `earn-${Date.now()}`,
        productId: selectedProduct.id,
        tokenId: selectedProduct.token.id,
        amount: amountValue,
        startDate: Date.now(),
        lockPeriodDays: selectedProduct.lockPeriodDays,
        apy: selectedProduct.apy,
        accruedReward: 0,
      }),
    );
    dispatch(
      recordTransaction({
        id: `txn-${Date.now()}`,
        type: 'earn',
        timestamp: Date.now(),
        description: `Staked ${selectedProduct.token.symbol}`,
        amountFiat: -amountValue,
        amountToken: amountValue,
        tokenId: selectedProduct.token.id,
        fee: 0,
      }),
    );
    setSelectedProductId(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <BalanceHero balance={totalBalance} pnlAmount={pnlAmount} pnlPercent={pnlPercent} currency={currency} />
        <View style={styles.filterRow}>
          {FILTERS.map((option) => (
            <Chip
              key={option}
              label={option}
              active={option === filter}
              onPress={() => {
                selectionAsync();
                setFilter(option);
              }}
            />
          ))}
        </View>

        <View style={styles.grid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.card}>
              <Text style={styles.tokenSymbol}>{product.token.symbol}</Text>
              <Text style={styles.tokenName}>{product.token.name}</Text>
              <Text style={styles.apy}>{formatNumber(product.apy * 100, 2)}% APY</Text>
              <Text style={styles.lock}>{product.lockPeriodDays === 0 ? 'Flexible' : `${product.lockPeriodDays} Days`}</Text>
              <TouchableOpacity
                style={styles.stakeButton}
                onPress={() => {
                  setSelectedProductId(product.id);
                  setStakeAmount('50');
                }}
                accessibilityRole="button"
                accessibilityLabel={`Stake ${product.token.symbol}`}
              >
                <Text style={styles.stakeLabel}>Stake</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <Sheet
        visible={selectedProductId !== null}
        title="Stake"
        onClose={() => setSelectedProductId(null)}
        confirmLabel="Confirm"
        onConfirm={handleStake}
      >
        <Text style={styles.sheetLabel}>Amount</Text>
        <TextInput
          style={styles.sheetInput}
          keyboardType="numeric"
          value={stakeAmount}
          onChangeText={setStakeAmount}
          accessibilityLabel="Stake amount"
        />
        {selectedProduct ? (
          <Text style={styles.sheetHint}>
            Balance: {formatNumber(balances[selectedProduct.token.id] ?? 0, 4)} {selectedProduct.token.symbol}
          </Text>
        ) : null}
      </Sheet>
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
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '48%',
    marginBottom: spacing.lg,
  },
  tokenSymbol: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  tokenName: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  apy: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  lock: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  stakeButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  stakeLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sheetLabel: {
    color: colors.textSecondary,
  },
  sheetInput: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.textPrimary,
  },
  sheetHint: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default EarnScreen;
