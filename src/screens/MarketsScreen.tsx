// File: src/screens/MarketsScreen.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Sparkline from '../components/Sparkline';
import { useAppSelector } from '../store/hooks';
import { colors, spacing, radii } from '../theme';
import { formatPercent } from '../utils/format';
import type { RootStackParamList } from '../navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const MarketsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = React.useState('');
  const pairs = useAppSelector((state) => state.market.pairs);

  const filtered = pairs.filter((pair) => pair.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Markets</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search pairs"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const positive = item.change24h >= 0;
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('MarketDetail', { pairId: item.id })}
              style={styles.row}
              accessibilityLabel={`Open ${item.id} market detail`}
            >
              <View>
                <Text style={styles.symbol}>{item.id}</Text>
                <Text style={styles.price}>{item.lastPrice.toFixed(2)}</Text>
              </View>
              <Sparkline values={item.sparkline} positive={positive} />
              <Text style={[styles.change, { color: positive ? colors.positive : colors.negative }]}>
                {formatPercent(item.change24h)}
              </Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  symbol: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  change: {
    fontWeight: '600',
  },
});

export default MarketsScreen;
