# Questions & Decisions Needed

## API Keys Setup

1. **Do you have Binance Options API access?**
   - European Options API requires specific permissions
   - You need to enable "European Options" in your Binance account settings
   - API key should have "Enable European Options" checkbox ticked

2. **How should API keys be stored?**
   - Currently configured via Vercel environment variables (recommended)
   - Alternative: Local `.env.local` file for development
   - Would you prefer a different approach? (e.g., user login, encrypted storage)

## Features Priority

3. **What features should I prioritize next?**
   - [ ] IV Surface visualization (3D volatility surface)
   - [ ] P&L Calculator for positions
   - [ ] Strategy builder (spreads, straddles, butterflies, etc.)
   - [ ] Position risk analysis (max loss, breakeven)
   - [ ] Historical data & backtesting
   - [ ] Price alerts / notifications
   - [ ] Order templates / quick orders
   - [ ] Multi-account support

4. **UI/UX Preferences:**
   - Is the dark theme OK, or prefer light/system theme toggle?
   - Are the colors for Calls (green) and Puts (red) good?
   - Any specific layout changes you'd like?
   - Mobile-first or desktop-first priority?

## Trading Workflow

5. **What's your typical trading workflow?**
   - Do you primarily trade single options or spreads?
   - Do you need quick-fill buttons (e.g., bid-1tick, ask+1tick)?
   - Do you want position sizing helpers?
   - Any specific order types needed beyond limit/market?

6. **Greeks Display:**
   - Current: Delta, Gamma, Theta, Vega, IV
   - Need Rho?
   - Need second-order Greeks (Vanna, Charm, Vomma)?
   - Want Greeks aggregated by expiry or underlying?

## Data & Analytics

7. **Historical Data Needs:**
   - Do you need historical options data?
   - What timeframes matter most?
   - Want implied volatility history?

8. **P&L Tracking:**
   - Just unrealized P&L, or full trade history?
   - Daily/weekly/monthly breakdown?
   - Export capabilities (CSV, JSON)?

## Technical Preferences

9. **Any specific technical requirements?**
   - Browser compatibility needs?
   - Offline capabilities?
   - Data export formats?

10. **Notifications:**
    - Browser notifications OK?
    - Email alerts needed?
    - Telegram/Discord webhook support?

## Known Issues to Address

- WebSocket might disconnect on some networks (VPN, corporate firewalls)
- Binance EAPI might have regional restrictions
- Rate limits could affect heavy usage

---

## Notes for Implementation

When you provide your API keys, add them to Vercel:
1. Go to: https://vercel.com/hookdumps-projects/crypto-options-trader/settings/environment-variables
2. Add `BINANCE_API_KEY` = your_key
3. Add `BINANCE_API_SECRET` = your_secret
4. Redeploy to apply

Or for local development:
```bash
# Create .env.local in project root
echo "BINANCE_API_KEY=your_key" >> .env.local
echo "BINANCE_API_SECRET=your_secret" >> .env.local
```
