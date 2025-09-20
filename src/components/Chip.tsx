// File: src/components/Chip.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { selectionAsync } from '../utils/haptics';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, active = false, onPress }) => {
  const handlePress = () => {
    selectionAsync();
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.container, active && styles.containerActive]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  containerActive: {
    backgroundColor: colors.cardElevated,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  labelActive: {
    color: colors.textPrimary,
  },
});

export default Chip;
