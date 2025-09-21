# Binance-Style Crypto Dashboard Simulator

This Expo-managed React Native app simulates a Binance-inspired trading experience. All interactions are **SIMULATION ONLY – no real APIs**. The project targets an iOS-first dark aesthetic and provides a complete fake exchange workflow with persistent local state.

## Features
- Email/password auth flow persisted with AsyncStorage
- Dashboard with total balance, 24h P&L, allocation breakdown, and equity curve chart
- Markets view with searchable pairs, sparklines, and price/percentage changes
- Market detail screen showing candlestick chart, depth order book, and simulated market/limit orders with quick sizing controls
- Order history with cancelable open orders and trade ledger including fees
- Settings panel for theme toggle, base currency, simulation speed, and state reset
- Redux Toolkit store with slices for session, market data, portfolio, and orders hydrated from storage
- Mock socket and matching engine services for price ticks, depth, candles, and order execution math

## Getting Started
```bash
npm install
npm run typecheck
npx expo start
```

Open the Expo app on your device or run an emulator to explore the simulated exchange.
