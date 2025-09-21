// File: src/navigation/index.tsx
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MarketsScreen from '../screens/MarketsScreen';
import MarketDetailScreen from '../screens/MarketDetailScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MarketDetail: { pairId: string };
};

export type AppTabParamList = {
  Dashboard: undefined;
  Markets: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarIcon: ({ color, size }) => {
        const icon =
          route.name === 'Dashboard'
            ? 'wallet'
            : route.name === 'Markets'
            ? 'stats-chart'
            : route.name === 'History'
            ? 'time'
            : 'settings';
        return <Ionicons name={icon as never} color={color} size={size} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Markets" component={MarketsScreen} />
    <Tab.Screen name="History" component={OrderHistoryScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const themeMode = useAppSelector((state) => state.session.theme);
  const authenticated = useAppSelector((state) => state.session.authenticated);

  return (
    <NavigationContainer theme={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!authenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={AppTabs} />
            <Stack.Screen
              name="MarketDetail"
              component={MarketDetailScreen}
              options={{ headerShown: true, headerTransparent: true, headerTintColor: colors.textPrimary, title: '' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
