// File: src/navigation/index.tsx
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAppSelector } from '../store/hooks';
import { colors } from '../theme';
import WalletScreen from '../screens/WalletScreen';
import SwapScreen from '../screens/SwapScreen';
import EarnScreen from '../screens/EarnScreen';
import ActionsScreen from '../screens/ActionsScreen';
import CoinDetailScreen from '../screens/CoinDetailScreen';
import BuyScreen from '../screens/BuyScreen';

export type RootStackParamList = {
  Root: undefined;
  CoinDetail: { pairId: string };
  Buy: undefined;
};

export type TabParamList = {
  Wallet: undefined;
  Swap: undefined;
  Earn: undefined;
  Actions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const darkTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.accent,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

const TabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Wallet'
              ? 'wallet'
              : route.name === 'Swap'
                ? 'swap-horizontal'
                : route.name === 'Earn'
                  ? 'trending-up'
                  : 'flash';
          return <Ionicons name={iconName as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Swap" component={SwapScreen} />
      <Tab.Screen name="Earn" component={EarnScreen} />
      <Tab.Screen name="Actions" component={ActionsScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const themeMode = useAppSelector((state) => state.session.theme);
  const navigationTheme = React.useMemo(() => darkTheme, [themeMode]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Root" component={TabsNavigator} />
        <Stack.Screen name="CoinDetail" component={CoinDetailScreen} />
        <Stack.Screen name="Buy" component={BuyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
