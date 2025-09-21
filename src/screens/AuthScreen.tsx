// File: src/screens/AuthScreen.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { signIn } from '../store/slices/sessionSlice';
import { colors, spacing, radii } from '../theme';

const AuthScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = React.useState('user@crypto.app');
  const [password, setPassword] = React.useState('password123');

  const handleSubmit = () => {
    if (!email.trim()) return;
    dispatch(signIn({ email }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Binance Sim</Text>
        <Text style={styles.subtitle}>Sign in to continue the simulated trading experience.</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.button} accessibilityLabel="Sign in to simulator">
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AuthScreen;
