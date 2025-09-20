// File: src/components/ListSection.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

interface ListSectionProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
}

const ListSection: React.FC<ListSectionProps> = ({ title, actionLabel, onActionPress, children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {actionLabel ? (
          <TouchableOpacity onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel}>
            <Text style={styles.action}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  action: {
    color: colors.accent,
    fontWeight: '600',
  },
});

export default ListSection;
