// File: src/components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onPressWallet?: () => void;
  onPressSearch?: () => void;
  onPressSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onPressWallet,
  onPressSearch,
  onPressSettings,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Select wallet"
        onPress={onPressWallet}
        style={styles.walletButton}
      >
        <Text style={styles.walletTitle}>{title}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressSearch}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Ionicons name="search" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonRight]}
          onPress={onPressSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  iconButtonRight: {
    marginLeft: spacing.sm,
  },
});

export default Header;
