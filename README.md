# Crypto Options Trader

Professional-grade crypto options trading platform powered by Binance European Options API.

**Live Demo:** https://crypto-options-trader.vercel.app

## Features

### Market Data (No API Key Required)
- Browse all available options contracts (BTC, ETH)
- Options chain grouped by expiration and strike
- Real-time price updates via WebSocket
- Greeks display (Delta, Gamma, Theta, Vega, IV)
- Candlestick charts with multiple intervals
- Order book depth visualization
- Recent trades feed

### Trading (API Key Required)
- Place limit and market orders
- View account balance and equity
- Track open positions with P&L
- Manage open orders
- Portfolio Greeks aggregation

## Screenshots

### Options Chain
View all available strikes and expirations at a glance with real-time bid/ask prices.

### Contract Details
Select any contract to see detailed information including Greeks, IV, and 24h stats.

### Trading Panel
Full trading interface with order book, price chart, and order form.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Charts:** TradingView Lightweight Charts v5
- **API:** Binance European Options API (EAPI)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/hookdump/crypto-options-trader.git
cd crypto-options-trader

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:3000 to view the application.

### Enable Trading

To enable trading features, create a `.env.local` file:

```bash
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
```

**Important:**
- Create your API keys at https://www.binance.com/en/my/settings/api-management
- Enable "European Options" permission
- Never enable withdrawal permissions

## Deployment

This project is configured for automatic deployment to Vercel. Push to `main` to trigger a new deployment.

For manual deployment:
```bash
vercel --prod
```

Add environment variables in Vercel dashboard for trading functionality.

## Project Structure

```
app/
├── page.tsx              # Main options chain view
├── trade/page.tsx        # Trading panel
├── positions/page.tsx    # Positions & account view
├── settings/page.tsx     # API configuration
└── api/                  # Server-side API routes

components/
├── options-chain.tsx     # Options matrix table
├── order-book.tsx        # Depth visualization
├── price-chart.tsx       # Candlestick chart
├── order-form.tsx        # Trading form
└── ...

lib/
├── binance-api.ts        # REST API client
├── websocket-manager.ts  # WebSocket handler
├── store.ts              # Zustand state management
└── types.ts              # TypeScript definitions
```

## API Documentation

This app uses the Binance European Options API:
- REST API: `https://eapi.binance.com`
- WebSocket: `wss://nbstream.binance.com/eoptions`
- [Official Documentation](https://developers.binance.com/docs/derivatives/options-trading/general-info)

## License

MIT

## Disclaimer

This software is for educational and informational purposes only. Trading crypto derivatives involves substantial risk of loss. Use at your own risk.
