// File: src/components/ActionBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { selectionAsync } from '../utils/haptics';

interface ActionBarProps {
  onBuy?: () => void;
  onSell?: () => void;
  onSend?: () => void;
  onReceive?: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ onBuy, onSell, onSend, onReceive }) => {
  const renderButton = (label: string, onPress?: () => void, color: string = colors.accent) => (
    <TouchableOpacity
      key={label}
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => {
        selectionAsync();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderButton('Buy', onBuy, colors.accent)}
      {renderButton('Sell', onSell, colors.cardElevated)}
      {renderButton('Send', onSend, colors.cardElevated)}
      {renderButton('Receive', onReceive, colors.cardElevated)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ActionBar;
