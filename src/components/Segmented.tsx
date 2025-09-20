// File: src/components/Segmented.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { selectionAsync } from '../utils/haptics';

interface SegmentedProps<T extends string> {
  options: readonly T[];
  selected: T;
  onChange: (value: T) => void;
}

const Segmented = <T extends string>({ options, selected, onChange }: SegmentedProps<T>) => {
  const handlePress = (value: T) => {
    selectionAsync();
    onChange(value);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => handlePress(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter ${option}`}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.cardElevated,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.textPrimary,
  },
});

export default Segmented;
