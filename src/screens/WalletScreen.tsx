// File: src/screens/WalletScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  Text,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import Segmented from '../components/Segmented';
import BalanceHero from '../components/BalanceHero';
import CoinRow from '../components/CoinRow';
import ActionBar from '../components/ActionBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { colors, spacing } from '../theme';
import { setSegment, setSearchTerm } from '../store/slices/marketSlice';
import { formatCurrency } from '../utils/format';
import { Pair } from '../types';
import { RootStackParamList, TabParamList } from '../navigation';
import { selectionAsync } from '../utils/haptics';

const segments = ['Hot', 'Top', 'New', 'Gainers', 'Losers'] as const;

type SegmentOption = (typeof segments)[number];
type WalletNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Wallet'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<WalletNavigationProp>();
  const dispatch = useAppDispatch();
  const { wallets, selectedWalletId, currency } = useAppSelector((state) => state.session);
  const { pairs, selectedSegment, searchTerm } = useAppSelector((state) => state.market);
  const { balances } = useAppSelector((state) => state.portfolio);

  const wallet = wallets.find((item) => item.id === selectedWalletId) ?? wallets[0];

  const priceMap = React.useMemo(() => {
    const map: Record<string, number> = { usd: 1, usdc: 1, usdt: 1 };
    pairs.forEach((pair) => {
      map[pair.base.id] = pair.lastPrice;
    });
    return map;
  }, [pairs]);

  const totalBalance = React.useMemo(() => {
    return Object.entries(balances).reduce((sum, [tokenId, amount]) => {
      const price = priceMap[tokenId] ?? 1;
      return sum + amount * price;
    }, 0);
  }, [balances, priceMap]);

  const pnlAmount = React.useMemo(() => {
    return pairs.reduce((sum, pair) => {
      const amount = balances[pair.base.id] ?? 0;
      const value = amount * pair.lastPrice;
      return sum + value * pair.change24h;
    }, 0);
  }, [balances, pairs]);

  const pnlPercent = totalBalance > 0 ? pnlAmount / totalBalance : 0;

  const filteredPairs = React.useMemo(() => {
    let list: Pair[] = pairs.slice();
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      list = list.filter(
        (pair) =>
          pair.base.symbol.toLowerCase().includes(query) || pair.base.name.toLowerCase().includes(query),
      );
    }
    switch (selectedSegment) {
      case 'Gainers':
        list = list.sort((a, b) => b.change24h - a.change24h);
        break;
      case 'Losers':
        list = list.sort((a, b) => a.change24h - b.change24h);
        break;
      case 'Top':
        list = list.sort((a, b) => (balances[b.base.id] ?? 0) * b.lastPrice - (balances[a.base.id] ?? 0) * a.lastPrice);
        break;
      case 'New':
        list = list.reverse();
        break;
      default:
        list = list.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
        break;
    }
    return list;
  }, [balances, pairs, searchTerm, selectedSegment]);

  const handleSelectSegment = (value: SegmentOption) => {
    selectionAsync();
    dispatch(setSegment(value));
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchTerm(value));
  };

  const renderCoin: ListRenderItem<Pair> = ({ item }) => (
    <CoinRow
      pair={item}
      currency={currency}
      onPress={() => navigation.navigate('CoinDetail', { pairId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title={wallet?.name ?? 'Wallet'} subtitle={currency} onPressSearch={() => {}} onPressWallet={() => {}} />
        <BalanceHero balance={totalBalance} pnlAmount={pnlAmount} pnlPercent={pnlPercent} currency={currency} />
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Portfolio Value</Text>
          <Text style={styles.searchValue}>{formatCurrency(totalBalance, currency)}</Text>
        </View>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search coins"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={searchTerm}
            onChangeText={handleSearch}
            accessibilityLabel="Search coins"
          />
        </View>
        <Segmented options={segments} selected={selectedSegment as SegmentOption} onChange={handleSelectSegment} />
        <FlatList
          data={filteredPairs}
          renderItem={renderCoin}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
        />
        <ActionBar
          onBuy={() => navigation.navigate('Buy')}
          onSell={() => navigation.navigate('Buy')}
          onSend={() => navigation.navigate('Actions')}
          onReceive={() => navigation.navigate('Actions')}
        />
        <View style={styles.bottomSpacer} />
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
  searchContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchLabel: {
    color: colors.textSecondary,
  },
  searchValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  searchBox: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    color: colors.textPrimary,
  },
  list: {
    paddingTop: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default WalletScreen;
