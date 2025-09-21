// File: src/components/DepthBook.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DepthLevel } from '../types';
import { colors, spacing } from '../theme';

type Props = {
  bids: DepthLevel[];
  asks: DepthLevel[];
};

const DepthBook: React.FC<Props> = ({ bids, asks }) => {
  const maxBid = Math.max(...bids.map((item) => item.amount), 1);
  const maxAsk = Math.max(...asks.map((item) => item.amount), 1);
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text style={styles.sectionTitle}>Bids</Text>
        {bids.map((level) => {
          const width = `${((level.amount / maxBid) * 100).toFixed(2)}%` as `${number}%`;
          return (
            <View key={`bid-${level.price}`} style={styles.row}>
              <View style={[styles.depthBar, { width, backgroundColor: 'rgba(46, 204, 113, 0.18)', alignSelf: 'flex-end' }]} />
              <View style={styles.rowContent}>
                <Text style={[styles.price, { color: colors.positive }]}>{level.price.toFixed(2)}</Text>
                <Text style={styles.amount}>{level.amount.toFixed(3)}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={styles.sectionTitle}>Asks</Text>
        {asks.map((level) => {
          const width = `${((level.amount / maxAsk) * 100).toFixed(2)}%` as `${number}%`;
          return (
            <View key={`ask-${level.price}`} style={styles.row}>
              <View style={[styles.depthBar, { width, backgroundColor: 'rgba(255, 77, 79, 0.18)' }]} />
              <View style={styles.rowContent}>
                <Text style={[styles.price, { color: colors.negative }]}>{level.price.toFixed(2)}</Text>
                <Text style={styles.amount}>{level.amount.toFixed(3)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  sectionTitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  row: {
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  depthBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  price: {
    fontWeight: '600',
  },
  amount: {
    color: colors.textSecondary,
  },
});

export default DepthBook;
