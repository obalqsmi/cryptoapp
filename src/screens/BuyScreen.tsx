// File: src/screens/BuyScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { colors, radii, spacing } from '../theme';
import Sheet from '../components/Sheet';
import { formatCurrency, formatNumber } from '../utils/format';
import { matchingEngine } from '../services/matching';
import { recordTransaction, setBalances } from '../store/slices/portfolioSlice';
import { selectionAsync } from '../utils/haptics';

const PAYMENT_METHODS = ['USD Account', 'Apple Pay', 'Credit Card'];

const BuyScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pairs } = useAppSelector((state) => state.market);
  const { balances } = useAppSelector((state) => state.portfolio);
  const [amount, setAmount] = React.useState(100);
  const [selectedMethod, setSelectedMethod] = React.useState(PAYMENT_METHODS[0]);
  const [tokenSheetVisible, setTokenSheetVisible] = React.useState(false);
  const [reviewVisible, setReviewVisible] = React.useState(false);
  const [selectedPairId, setSelectedPairId] = React.useState(pairs[0]?.id ?? 'btc-usdc');

  const pair = pairs.find((item) => item.id === selectedPairId) ?? pairs[0];

  const handlePreset = (value: number | 'max') => {
    selectionAsync();
    if (value === 'max') {
      setAmount(1000);
    } else {
      setAmount(value);
    }
  };

  const handleConfirm = () => {
    if (!pair) return;
    const result = matchingEngine.marketOrder({
      pair,
      side: 'buy',
      amountFiat: amount,
      balances,
    });
    dispatch(setBalances(result.balances));
    dispatch(recordTransaction(result.transaction));
    setReviewVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Buy</Text>
        <Text style={styles.caption}>Instantly purchase crypto with your preferred payment method.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={String(amount)}
              onChangeText={(value) => setAmount(Number.parseFloat(value) || 0)}
              accessibilityLabel="Fiat amount"
            />
            <Text style={styles.amountCurrency}>USD</Text>
          </View>
          <View style={styles.presetRow}>
            {[25, 50, 100].map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.presetButton}
                onPress={() => handlePreset(value)}
                accessibilityRole="button"
                accessibilityLabel={`Set amount ${value}`}
              >
                <Text style={styles.presetLabel}>${value}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => handlePreset('max')}
              accessibilityRole="button"
              accessibilityLabel="Set max amount"
            >
              <Text style={styles.presetLabel}>Max</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => {
            const active = method === selectedMethod;
            return (
              <TouchableOpacity
                key={method}
                style={[styles.methodRow, active && styles.methodRowActive]}
                onPress={() => {
                  selectionAsync();
                  setSelectedMethod(method);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Use ${method}`}
              >
                <Text style={styles.methodLabel}>{method}</Text>
                {active ? <Text style={styles.methodSelected}>Selected</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Buying</Text>
          <TouchableOpacity
            style={styles.tokenSelector}
            onPress={() => setTokenSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Select buy token"
          >
            <Text style={styles.tokenSymbol}>{pair?.base.symbol}</Text>
            <Text style={styles.tokenName}>with USD</Text>
          </TouchableOpacity>
          <Text style={styles.quote}>{formatCurrency(pair?.lastPrice ?? 0)}</Text>
          <Text style={styles.quoteCaption}>Current price</Text>
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => setReviewVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Text style={styles.ctaLabel}>Next</Text>
        </TouchableOpacity>
      </ScrollView>

      <Sheet
        visible={tokenSheetVisible}
        title="Select asset"
        onClose={() => setTokenSheetVisible(false)}
      >
        {pairs.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.sheetRow}
            onPress={() => {
              selectionAsync();
              setSelectedPairId(option.id);
              setTokenSheetVisible(false);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Select ${option.base.symbol}`}
          >
            <Text style={styles.sheetSymbol}>{option.base.symbol}</Text>
            <Text style={styles.sheetName}>{option.base.name}</Text>
          </TouchableOpacity>
        ))}
      </Sheet>

      <Sheet
        visible={reviewVisible}
        title="Confirm Purchase"
        onClose={() => setReviewVisible(false)}
        confirmLabel="Confirm"
        onConfirm={handleConfirm}
      >
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Pay</Text>
          <Text style={styles.reviewValue}>{formatCurrency(amount)}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Receive</Text>
          <Text style={styles.reviewValue}>
            {formatNumber(amount / (pair?.lastPrice ?? 1), 4)} {pair?.base.symbol}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewSub}>Payment method</Text>
          <Text style={styles.reviewSub}>{selectedMethod}</Text>
        </View>
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
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  caption: {
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInput: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    flex: 1,
  },
  amountCurrency: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  presetButton: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    marginRight: spacing.sm,
  },
  presetLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  methodRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodRowActive: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  methodLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  methodSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  tokenSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  tokenSymbol: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tokenName: {
    color: colors.textSecondary,
  },
  quote: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  quoteCaption: {
    color: colors.textSecondary,
  },
  cta: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sheetRow: {
    paddingVertical: spacing.sm,
  },
  sheetSymbol: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sheetName: {
    color: colors.textSecondary,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  reviewLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reviewValue: {
    color: colors.textPrimary,
  },
  reviewSub: {
    color: colors.textSecondary,
  },
});

export default BuyScreen;
