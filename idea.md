# Crypto Options Trader

## Type
Professional Trading Tool

## One-Liner
A sophisticated real-time crypto options trading platform powered by Binance API.

## Problem
Trading crypto options on Binance's native interface lacks advanced features, real-time analytics, and a streamlined UX for serious options traders. Navigating through contracts, analyzing Greeks, and executing trades requires multiple clicks and lacks customization.

## Solution
A dedicated options trading dashboard that connects directly to Binance's European Options API (EAPI), providing:
- Real-time market data via WebSocket
- Visual options chain with all expirations
- Live order book and price charts
- One-click trading with bid/ask execution
- Greeks calculation and display
- Portfolio tracking and P&L analysis

## Core Features (MVP)
1. Asset browser - View all available underlying assets (BTC, ETH, etc.)
2. Options chain - Navigate by expiration date, strike price, call/put
3. Real-time pricing - Live bid/ask from WebSocket streams
4. Order book depth - Visual representation of liquidity
5. Price charts - Candlestick charts for option contracts
6. Order placement - Buy/Sell with limit orders
7. Position tracking - View open positions and orders
8. Greeks display - Delta, Gamma, Theta, Vega calculations

## Storage Needs
- localStorage for user preferences (theme, favorite symbols, layout)
- API keys stored securely in environment variables (server-side)

## Target Users
- Crypto options traders
- Market makers
- Derivatives enthusiasts
- Professional traders seeking better UX

## Notes
- Uses Binance European Options API (EAPI)
- REST API base: https://eapi.binance.com
- WebSocket: wss://nbstream.binance.com/eoptions/
- Requires API key + secret for trading (read-only market data is public)
