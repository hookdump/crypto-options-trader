# Crypto Options Trader - Implementation Plan

## Overview
Professional-grade crypto options trading platform connecting to Binance European Options API (EAPI) with real-time data, advanced charting, and streamlined order execution.

## Complexity Assessment
- [x] Needs external API (Binance EAPI)
- [x] Real-time WebSocket connections
- [x] Client-side heavy (charts, calculations)
- [ ] Needs own backend - NO, direct API calls from client/API routes

## Architecture

### API Layer
```
Binance EAPI (REST)
├── /eapi/v1/exchangeInfo    → Available options contracts
├── /eapi/v1/ticker          → 24hr ticker stats
├── /eapi/v1/index           → Underlying asset index price
├── /eapi/v1/depth           → Order book
├── /eapi/v1/klines          → Candlestick data
├── /eapi/v1/mark            → Mark price
├── /eapi/v1/trades          → Recent trades
├── /eapi/v1/openInterest    → Open interest by strike/expiry
├── /eapi/v1/order           → Place/cancel orders (signed)
├── /eapi/v1/openOrders      → Get open orders (signed)
└── /eapi/v1/position        → Current positions (signed)

Binance WebSocket
├── <symbol>@ticker          → Real-time ticker
├── <symbol>@trade           → Real-time trades
├── <symbol>@depth           → Order book updates
├── <symbol>@kline_<interval>→ Candlestick updates
└── <underlying>@index       → Index price updates
```

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Lightweight Charts (TradingView) |
| State | Zustand |
| WebSocket | Native WebSocket + reconnection |
| API Calls | Next.js API routes (for signed requests) |
| Hosting | Vercel |

## Features (MVP)

### Phase 1: Core Infrastructure
- [ ] Project setup with Next.js + TypeScript
- [ ] Binance API client (REST)
- [ ] WebSocket manager with auto-reconnect
- [ ] Basic layout with navigation

### Phase 2: Market Data Display
- [ ] Asset selector (BTC, ETH, etc.)
- [ ] Options chain table (expiry × strike matrix)
- [ ] Real-time price updates via WebSocket
- [ ] Underlying index price display

### Phase 3: Contract Details
- [ ] Order book visualization
- [ ] Price chart with candlesticks
- [ ] Recent trades feed
- [ ] Contract specifications display

### Phase 4: Trading
- [ ] API key configuration (secure storage)
- [ ] Order form (buy/sell, limit/market)
- [ ] Open orders display
- [ ] Position tracking
- [ ] Order cancellation

### Phase 5: Analytics
- [ ] Greeks calculation (Delta, Gamma, Theta, Vega)
- [ ] P&L tracking
- [ ] IV surface visualization

## Data Models

### Option Symbol Format
```
BTC-241227-100000-C
│    │      │     └─ C=Call, P=Put
│    │      └─────── Strike price
│    └────────────── Expiry (YYMMDD)
└──────────────────── Underlying
```

### Local Storage Schema
```typescript
interface UserPreferences {
  theme: 'dark' | 'light';
  favoriteSymbols: string[];
  defaultUnderlying: string;
  chartInterval: string;
  orderBookDepth: number;
}
```

## Pages/Routes

```
/                    → Dashboard with asset selector + quick overview
/chain/[underlying]  → Full options chain for an underlying
/contract/[symbol]   → Single contract view (chart, book, trades)
/trade               → Trading panel with positions
/settings            → API key config + preferences
```

## Environment Variables
```
NEXT_PUBLIC_BINANCE_EAPI_URL=https://eapi.binance.com
NEXT_PUBLIC_BINANCE_WS_URL=wss://nbstream.binance.com/eoptions
BINANCE_API_KEY=<user's key>
BINANCE_API_SECRET=<user's secret>
```

## Implementation Order

1. **Setup & Infrastructure**
   - Initialize Next.js with TypeScript + Tailwind
   - Install dependencies (shadcn/ui, zustand, lightweight-charts)
   - Create API client utilities
   - Create WebSocket manager

2. **Layout & Navigation**
   - Dark theme layout
   - Header with asset selector
   - Sidebar navigation
   - Responsive design

3. **Options Chain**
   - Fetch exchange info
   - Parse and group by expiry/strike
   - Display in matrix format
   - Add real-time price updates

4. **Contract View**
   - Order book component
   - Candlestick chart
   - Trade feed
   - Greeks display

5. **Trading**
   - API route for signed requests
   - Order form component
   - Position display
   - Order management

6. **Polish**
   - Error handling
   - Loading states
   - Mobile responsiveness
   - Performance optimization

## Security Considerations
- API keys stored server-side only
- Signed requests made through API routes
- No sensitive data in localStorage
- HTTPS only

## Known Limitations
- European options only (not American)
- Binance API rate limits apply
- WebSocket connection limits (10 msgs/sec inbound)
- Some endpoints require API key even for read-only
