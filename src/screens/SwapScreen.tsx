// File: src/screens/SwapScreen.tsx
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
import { updateDraft, setLastSwap } from '../store/slices/swapSlice';
import { formatCurrency, formatNumber } from '../utils/format';
import Sheet from '../components/Sheet';
import { matchingEngine } from '../services/matching';
import { recordTransaction, setBalances } from '../store/slices/portfolioSlice';
import { selectionAsync } from '../utils/haptics';

const SwapScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { draft } = useAppSelector((state) => state.swap);
  const { tokens, pairs } = useAppSelector((state) => state.market);
  const { balances } = useAppSelector((state) => state.portfolio);
  const [tokenSheet, setTokenSheet] = React.useState<'from' | 'to' | null>(null);
  const [reviewVisible, setReviewVisible] = React.useState(false);

  const fromToken = tokens.find((token) => token.id === draft.fromTokenId) ?? tokens[0];
  const toToken = tokens.find((token) => token.id === draft.toTokenId) ?? tokens[1];

  const pair = React.useMemo(() => {
    return (
      pairs.find(
        (p) => p.base.id === draft.toTokenId && p.quote.id === draft.fromTokenId,
      ) ||
      pairs.find((p) => p.base.id === draft.fromTokenId && p.quote.id === draft.toTokenId)
    );
  }, [draft.fromTokenId, draft.toTokenId, pairs]);

  const estimatedOut = React.useMemo(() => {
    if (!pair) return 0;
    if (draft.fromTokenId === pair.quote.id) {
      return draft.amount / pair.lastPrice;
    }
    return draft.amount * pair.lastPrice;
  }, [draft.amount, draft.fromTokenId, pair]);

  const priceImpact = React.useMemo(() => 0.0002 + Math.random() * 0.0015, [draft.fromTokenId, draft.toTokenId]);
  const networkFee = 2.5;
  const otherFee = 0.5;

  const handleSelectToken = (tokenId: string, type: 'from' | 'to') => {
    selectionAsync();
    if (type === 'from') {
      dispatch(updateDraft({ fromTokenId: tokenId }));
    } else {
      dispatch(updateDraft({ toTokenId: tokenId }));
    }
    setTokenSheet(null);
  };

  const handleAmountChange = (value: string) => {
    const parsed = Number.parseFloat(value) || 0;
    dispatch(updateDraft({ amount: parsed }));
  };

  const handleMax = () => {
    const balance = balances[draft.fromTokenId] ?? 0;
    dispatch(updateDraft({ amount: Number(balance.toFixed(4)) }));
  };

  const handleConfirmSwap = () => {
    if (!pair) return;
    const result = matchingEngine.swap({
      fromTokenId: draft.fromTokenId,
      toTokenId: draft.toTokenId,
      amountFrom: draft.amount,
      balances,
      pair,
    });
    dispatch(setBalances(result.balances));
    dispatch(recordTransaction(result.transaction));
    dispatch(
      setLastSwap({
        fromTokenId: draft.fromTokenId,
        toTokenId: draft.toTokenId,
        amount: draft.amount,
        priceExecuted: result.priceExecuted,
        slippage: result.slippage,
      }),
    );
    setReviewVisible(false);
  };

  const availableBalance = balances[draft.fromTokenId] ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Swap</Text>
        <Text style={styles.caption}>Simulated multi-chain swaps between popular tokens.</Text>

        <View style={styles.chainSelector}>
          <TouchableOpacity
            style={styles.chainPill}
            onPress={() => selectionAsync()}
            accessibilityRole="button"
            accessibilityLabel="Select chain"
          >
            <Text style={styles.chainLabel}>{draft.chain}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>From</Text>
              <TouchableOpacity
                style={styles.tokenButton}
                onPress={() => setTokenSheet('from')}
                accessibilityRole="button"
                accessibilityLabel="Select from token"
              >
                <Text style={styles.tokenSymbol}>{fromToken?.symbol}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.amountColumn}>
              <View style={styles.amountRow}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  value={draft.amount ? String(draft.amount) : ''}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Swap amount"
                />
                <TouchableOpacity onPress={handleMax} accessibilityRole="button" accessibilityLabel="Use max">
                  <Text style={styles.max}>Max</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.balance}>Balance {formatNumber(availableBalance, 4)}</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>To</Text>
              <TouchableOpacity
                style={styles.tokenButton}
                onPress={() => setTokenSheet('to')}
                accessibilityRole="button"
                accessibilityLabel="Select to token"
              >
                <Text style={styles.tokenSymbol}>{toToken?.symbol}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.amountColumn}>
              <Text style={styles.estimate}>{formatNumber(estimatedOut, 4)}</Text>
              <Text style={styles.balance}>Est. Output</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Price impact</Text>
            <Text style={styles.metaValue}>{formatNumber(priceImpact * 100, 2)}%</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Est. Network Fee</Text>
            <Text style={styles.metaValue}>{formatCurrency(networkFee)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Est. Other Fees</Text>
            <Text style={styles.metaValue}>{formatCurrency(otherFee)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => setReviewVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Review swap"
        >
          <Text style={styles.reviewLabel}>Review Swap</Text>
        </TouchableOpacity>
      </ScrollView>

      <Sheet
        visible={tokenSheet !== null}
        title="Select token"
        onClose={() => setTokenSheet(null)}
      >
        {tokens.map((token) => (
          <TouchableOpacity
            key={token.id}
            style={styles.sheetRow}
            onPress={() => handleSelectToken(token.id, tokenSheet ?? 'from')}
            accessibilityRole="button"
            accessibilityLabel={`Select ${token.symbol}`}
          >
            <Text style={styles.sheetSymbol}>{token.symbol}</Text>
            <Text style={styles.sheetName}>{token.name}</Text>
          </TouchableOpacity>
        ))}
      </Sheet>

      <Sheet
        visible={reviewVisible}
        title="Confirm Swap"
        onClose={() => setReviewVisible(false)}
        confirmLabel="Confirm"
        onConfirm={handleConfirmSwap}
      >
        <View style={styles.reviewRow}>
          <Text style={styles.reviewText}>From</Text>
          <Text style={styles.reviewText}>
            {formatNumber(draft.amount, 4)} {fromToken?.symbol}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewText}>To</Text>
          <Text style={styles.reviewText}>
            {formatNumber(estimatedOut, 4)} {toToken?.symbol}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewSub}>Price Impact</Text>
          <Text style={styles.reviewSub}>{formatNumber(priceImpact * 100, 2)}%</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewSub}>Network Fee</Text>
          <Text style={styles.reviewSub}>{formatCurrency(networkFee)}</Text>
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
  chainSelector: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  chainPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  chainLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tokenButton: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  tokenSymbol: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  amountColumn: {
    alignItems: 'flex-end',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    color: colors.textPrimary,
    fontSize: 20,
    textAlign: 'right',
    minWidth: 80,
  },
  max: {
    color: colors.accent,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  balance: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  estimate: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  metaCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metaLabel: {
    color: colors.textSecondary,
  },
  metaValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  reviewLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
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
  reviewText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reviewSub: {
    color: colors.textSecondary,
  },
});

export default SwapScreen;
