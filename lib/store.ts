import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExchangeInfo,
  Ticker24hr,
  MarkPrice,
  IndexPrice,
  OrderBook,
  Trade,
  Kline,
  Position,
  Order,
  AccountInfo,
  ParsedOptionSymbol,
  OptionsChainByExpiry,
  OptionsChainRow,
} from "./types";

// Parse option symbol string to structured data
function parseOptionSymbol(symbol: OptionSymbolData): ParsedOptionSymbol {
  // Format: BTC-241227-100000-C
  const parts = symbol.symbol.split("-");
  const expiryStr = parts[1]; // YYMMDD
  const year = 2000 + parseInt(expiryStr.slice(0, 2));
  const month = parseInt(expiryStr.slice(2, 4)) - 1;
  const day = parseInt(expiryStr.slice(4, 6));

  return {
    symbol: symbol.symbol,
    underlying: symbol.underlying,
    expiryDate: new Date(year, month, day),
    expiryTimestamp: symbol.expiryDate,
    strikePrice: parseFloat(symbol.strikePrice),
    side: symbol.side,
    raw: symbol as never,
  };
}

interface OptionSymbolData {
  symbol: string;
  underlying: string;
  expiryDate: number;
  strikePrice: string;
  side: "CALL" | "PUT";
}

// Group symbols into options chain by expiry
function buildOptionsChain(
  symbols: ParsedOptionSymbol[],
  selectedExpiry: Date | null
): OptionsChainByExpiry[] {
  // Group by expiry date
  const byExpiry = new Map<string, ParsedOptionSymbol[]>();

  symbols.forEach((sym) => {
    const key = sym.expiryTimestamp.toString();
    if (!byExpiry.has(key)) {
      byExpiry.set(key, []);
    }
    byExpiry.get(key)!.push(sym);
  });

  // Convert to array and sort by expiry
  const result: OptionsChainByExpiry[] = [];

  Array.from(byExpiry.entries())
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([, expSymbols]) => {
      // Filter by selected expiry if set
      if (selectedExpiry) {
        const first = expSymbols[0];
        if (
          first.expiryDate.getFullYear() !== selectedExpiry.getFullYear() ||
          first.expiryDate.getMonth() !== selectedExpiry.getMonth() ||
          first.expiryDate.getDate() !== selectedExpiry.getDate()
        ) {
          return;
        }
      }

      // Group by strike price
      const byStrike = new Map<number, OptionsChainRow>();

      expSymbols.forEach((sym) => {
        if (!byStrike.has(sym.strikePrice)) {
          byStrike.set(sym.strikePrice, { strikePrice: sym.strikePrice });
        }
        const row = byStrike.get(sym.strikePrice)!;
        if (sym.side === "CALL") {
          row.call = sym;
        } else {
          row.put = sym;
        }
      });

      // Sort rows by strike price
      const rows = Array.from(byStrike.values()).sort(
        (a, b) => a.strikePrice - b.strikePrice
      );

      result.push({
        expiryDate: expSymbols[0].expiryDate,
        expiryTimestamp: expSymbols[0].expiryTimestamp,
        rows,
      });
    });

  return result;
}

interface OptionsState {
  // Data
  exchangeInfo: ExchangeInfo | null;
  underlyings: string[];
  selectedUnderlying: string;
  expiryDates: Date[];
  selectedExpiry: Date | null;
  optionsChain: OptionsChainByExpiry[];
  parsedSymbols: ParsedOptionSymbol[];

  // Tickers (real-time)
  tickers: Record<string, Ticker24hr>;
  markPrices: Record<string, MarkPrice>;
  indexPrices: Record<string, IndexPrice>;

  // Selected contract
  selectedSymbol: string | null;
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  klines: Kline[];

  // Trading
  positions: Position[];
  openOrders: Order[];
  accountInfo: AccountInfo | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  wsConnected: boolean;

  // Actions
  setExchangeInfo: (info: ExchangeInfo) => void;
  setSelectedUnderlying: (underlying: string) => void;
  setSelectedExpiry: (expiry: Date | null) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  updateTicker: (ticker: Ticker24hr) => void;
  updateTickers: (tickers: Ticker24hr[]) => void;
  updateMarkPrice: (mark: MarkPrice) => void;
  updateMarkPrices: (marks: MarkPrice[]) => void;
  updateIndexPrice: (underlying: string, price: IndexPrice) => void;
  setOrderBook: (book: OrderBook | null) => void;
  setRecentTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  setKlines: (klines: Kline[]) => void;
  updateKline: (kline: Kline) => void;
  setPositions: (positions: Position[]) => void;
  setOpenOrders: (orders: Order[]) => void;
  setAccountInfo: (info: AccountInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWsConnected: (connected: boolean) => void;
  getFilteredSymbols: () => ParsedOptionSymbol[];
}

export const useOptionsStore = create<OptionsState>()((set, get) => ({
  // Initial state
  exchangeInfo: null,
  underlyings: [],
  selectedUnderlying: "BTCUSDT",
  expiryDates: [],
  selectedExpiry: null,
  optionsChain: [],
  parsedSymbols: [],
  tickers: {},
  markPrices: {},
  indexPrices: {},
  selectedSymbol: null,
  orderBook: null,
  recentTrades: [],
  klines: [],
  positions: [],
  openOrders: [],
  accountInfo: null,
  isLoading: false,
  error: null,
  wsConnected: false,

  // Actions
  setExchangeInfo: (info) => {
    // Extract unique underlyings
    const underlyings = [
      ...new Set(info.optionSymbols.map((s) => s.underlying)),
    ].sort();

    // Parse all symbols
    const parsedSymbols = info.optionSymbols.map((s) =>
      parseOptionSymbol(s as OptionSymbolData)
    );

    // Get unique expiry dates for selected underlying
    const state = get();
    const filteredSymbols = parsedSymbols.filter(
      (s) => s.underlying === state.selectedUnderlying
    );

    const expirySet = new Set<number>();
    filteredSymbols.forEach((s) => expirySet.add(s.expiryTimestamp));
    const expiryDates = Array.from(expirySet)
      .sort((a, b) => a - b)
      .map((ts) => new Date(ts));

    // Build options chain
    const optionsChain = buildOptionsChain(filteredSymbols, state.selectedExpiry);

    set({
      exchangeInfo: info,
      underlyings,
      parsedSymbols,
      expiryDates,
      optionsChain,
    });
  },

  setSelectedUnderlying: (underlying) => {
    const state = get();
    const filteredSymbols = state.parsedSymbols.filter(
      (s) => s.underlying === underlying
    );

    const expirySet = new Set<number>();
    filteredSymbols.forEach((s) => expirySet.add(s.expiryTimestamp));
    const expiryDates = Array.from(expirySet)
      .sort((a, b) => a - b)
      .map((ts) => new Date(ts));

    // Reset expiry selection
    const optionsChain = buildOptionsChain(filteredSymbols, null);

    set({
      selectedUnderlying: underlying,
      expiryDates,
      selectedExpiry: null,
      optionsChain,
      selectedSymbol: null,
    });
  },

  setSelectedExpiry: (expiry) => {
    const state = get();
    const filteredSymbols = state.parsedSymbols.filter(
      (s) => s.underlying === state.selectedUnderlying
    );
    const optionsChain = buildOptionsChain(filteredSymbols, expiry);

    set({
      selectedExpiry: expiry,
      optionsChain,
    });
  },

  setSelectedSymbol: (symbol) => {
    set({
      selectedSymbol: symbol,
      orderBook: null,
      recentTrades: [],
      klines: [],
    });
  },

  updateTicker: (ticker) => {
    set((state) => ({
      tickers: { ...state.tickers, [ticker.symbol]: ticker },
    }));
  },

  updateTickers: (tickers) => {
    const tickersMap: Record<string, Ticker24hr> = {};
    tickers.forEach((t) => {
      tickersMap[t.symbol] = t;
    });
    set((state) => ({
      tickers: { ...state.tickers, ...tickersMap },
    }));
  },

  updateMarkPrice: (mark) => {
    set((state) => ({
      markPrices: { ...state.markPrices, [mark.symbol]: mark },
    }));
  },

  updateMarkPrices: (marks) => {
    const marksMap: Record<string, MarkPrice> = {};
    marks.forEach((m) => {
      marksMap[m.symbol] = m;
    });
    set((state) => ({
      markPrices: { ...state.markPrices, ...marksMap },
    }));
  },

  updateIndexPrice: (underlying, price) => {
    set((state) => ({
      indexPrices: { ...state.indexPrices, [underlying]: price },
    }));
  },

  setOrderBook: (book) => set({ orderBook: book }),

  setRecentTrades: (trades) => set({ recentTrades: trades }),

  addTrade: (trade) =>
    set((state) => ({
      recentTrades: [trade, ...state.recentTrades.slice(0, 99)],
    })),

  setKlines: (klines) => set({ klines }),

  updateKline: (kline) =>
    set((state) => {
      const klines = [...state.klines];
      const lastIndex = klines.length - 1;
      if (lastIndex >= 0 && klines[lastIndex].openTime === kline.openTime) {
        klines[lastIndex] = kline;
      } else {
        klines.push(kline);
      }
      return { klines };
    }),

  setPositions: (positions) => set({ positions }),

  setOpenOrders: (orders) => set({ openOrders: orders }),

  setAccountInfo: (info) => set({ accountInfo: info }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setWsConnected: (wsConnected) => set({ wsConnected }),

  getFilteredSymbols: () => {
    const state = get();
    return state.parsedSymbols.filter(
      (s) => s.underlying === state.selectedUnderlying
    );
  },
}));

// Preferences store (persisted)
interface PreferencesState {
  theme: "dark" | "light";
  favoriteSymbols: string[];
  defaultUnderlying: string;
  chartInterval: string;
  orderBookDepth: number;
  apiConfigured: boolean;
  setTheme: (theme: "dark" | "light") => void;
  toggleFavorite: (symbol: string) => void;
  setDefaultUnderlying: (underlying: string) => void;
  setChartInterval: (interval: string) => void;
  setOrderBookDepth: (depth: number) => void;
  setApiConfigured: (configured: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "dark",
      favoriteSymbols: [],
      defaultUnderlying: "BTCUSDT",
      chartInterval: "15m",
      orderBookDepth: 20,
      apiConfigured: false,

      setTheme: (theme) => set({ theme }),

      toggleFavorite: (symbol) =>
        set((state) => ({
          favoriteSymbols: state.favoriteSymbols.includes(symbol)
            ? state.favoriteSymbols.filter((s) => s !== symbol)
            : [...state.favoriteSymbols, symbol],
        })),

      setDefaultUnderlying: (defaultUnderlying) => set({ defaultUnderlying }),

      setChartInterval: (chartInterval) => set({ chartInterval }),

      setOrderBookDepth: (orderBookDepth) => set({ orderBookDepth }),

      setApiConfigured: (apiConfigured) => set({ apiConfigured }),
    }),
    {
      name: "crypto-options-preferences",
    }
  )
);
