# Crypto Dashboard (Binance-Style Simulator)

## 📌 Overview
A **Binance-style iOS crypto trading dashboard simulator** built with **React Native (Expo) + TypeScript**.  
It replicates real exchange features — markets, charts, trading, portfolio, order history, and settings — but runs entirely in **simulation mode with mock data**.  
No real money, APIs, or wallets are used.

---

## 🚀 Features
- **Authentication** – Email/password login (simulated), session persistence with AsyncStorage  
- **Dashboard** – Total balance, 24h P&L %, allocation breakdown, equity curve chart  
- **Markets** – Searchable/sortable pairs, last price, 24h change, volume, mini sparklines  
- **Market Detail & Trading**  
  - Interactive candlestick charts (1m/5m/1h/1d) with zoom & pan  
  - Depth orderbook with clickable rows to prefill orders  
  - Market & Limit orders with quick % buttons (25/50/75/100)  
  - Matching engine simulation with fills, slippage, and 0.1% fees  
  - Recent trades feed with animated updates  
- **Orders & History** – Open orders (cancel), trade history with timestamps and fees  
- **Settings** – Theme toggle, base currency, simulation speed (1×/5×/20×), reset simulation  

---

## ⚙️ Simulation Engine
- **Mock Socket** generates ticks, candlesticks, trades, and orderbook depth  
- **Matching Engine** executes market/limit orders against synthetic orderbook  
- **Persistence** – All balances, orders, and trades stored in AsyncStorage  

---

## 🛠️ Tech Stack
- React Native (Expo Managed Workflow)  
- TypeScript  
- Redux Toolkit (state management)  
- React Navigation (stack + tabs)  
- AsyncStorage (persistence)  
- styled-components (UI)  
- react-native-svg (charts & sparklines)  
- Reanimated + Gesture Handler (interactions)  

---

## 📂 Project Structure
crypto-dashboard/
├─ app.json
├─ package.json
├─ babel.config.js
├─ tsconfig.json
├─ metro.config.js
├─ src/
│ ├─ App.tsx
│ ├─ navigation/
│ ├─ store/
│ ├─ services/
│ ├─ utils/
│ ├─ components/
│ ├─ screens/
│ ├─ theme.ts
│ ├─ types.ts
├─ assets/
│ ├─ icon.png
│ ├─ splash.png
│ ├─ fonts/
├─ README.md
