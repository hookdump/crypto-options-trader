// Binance EAPI Types

export interface OptionAsset {
  id: number;
  name: string;
}

export interface OptionContract {
  id: number;
  baseAsset: string;
  quoteAsset: string;
  underlying: string;
  settleAsset: string;
}

export interface PriceFilter {
  filterType: "PRICE_FILTER";
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

export interface LotSizeFilter {
  filterType: "LOT_SIZE";
  minQty: string;
  maxQty: string;
  stepSize: string;
}

export type SymbolFilter = PriceFilter | LotSizeFilter;

export interface OptionSymbol {
  contractId: number;
  expiryDate: number;
  filters: SymbolFilter[];
  id: number;
  symbol: string;
  side: "CALL" | "PUT";
  strikePrice: string;
  underlying: string;
  unit: number;
  makerFeeRate: string;
  takerFeeRate: string;
  minQty: string;
  maxQty: string;
  initialMargin: string;
  maintenanceMargin: string;
  minInitialMargin: string;
  minMaintenanceMargin: string;
  priceScale: number;
  quantityScale: number;
  quoteAsset: string;
}

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  optionContracts: OptionContract[];
  optionAssets: OptionAsset[];
  optionSymbols: OptionSymbol[];
  rateLimits: RateLimit[];
}

export interface RateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
}

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  lastQty: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  amount: string;
  bidPrice: string;
  askPrice: string;
  openTime: number;
  closeTime: number;
  firstTradeId: number;
  tradeCount: number;
  strikePrice: string;
  exercisePrice: string;
}

export interface IndexPrice {
  indexPrice: string;
  time: number;
}

export interface MarkPrice {
  symbol: string;
  markPrice: string;
  bidIV: string;
  askIV: string;
  markIV: string;
  delta: string;
  theta: string;
  gamma: string;
  vega: string;
  highPriceLimit: string;
  lowPriceLimit: string;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBook {
  transactionTime: number;
  symbol: string;
  bids: [string, string][]; // [price, qty]
  asks: [string, string][]; // [price, qty]
}

export interface Kline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  amount: string;
  tradeCount: number;
  takerVolume: string;
  takerAmount: string;
  // For chart library
  time?: number;
}

export interface Trade {
  id: number;
  tradeId: number;
  symbol: string;
  price: string;
  qty: string;
  quoteQty: string;
  side: number; // -1 = sell, 1 = buy
  time: number;
}

export interface OpenInterest {
  symbol: string;
  sumOpenInterest: string;
  sumOpenInterestUsd: string;
  timestamp: number;
}

// Trading Types
export interface Order {
  orderId: number;
  symbol: string;
  price: string;
  quantity: string;
  executedQty: string;
  fee: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  timeInForce: "GTC" | "IOC" | "FOK";
  reduceOnly: boolean;
  postOnly: boolean;
  createTime: number;
  updateTime: number;
  status: "ACCEPTED" | "REJECTED" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
  avgPrice: string;
  source: string;
  clientOrderId: string;
  priceScale: number;
  quantityScale: number;
  optionSide: "CALL" | "PUT";
  quoteAsset: string;
  mmp: boolean;
}

export interface Position {
  entryPrice: string;
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: string;
  reducibleQty: string;
  markValue: string;
  ror: string;
  unrealizedPNL: string;
  markPrice: string;
  strikePrice: string;
  positionCost: string;
  expiryDate: number;
  priceScale: number;
  quantityScale: number;
  optionSide: "CALL" | "PUT";
  quoteAsset: string;
  time: number;
}

export interface AccountInfo {
  asset: AccountAsset[];
  greek: AccountGreek[];
  time: number;
}

export interface AccountAsset {
  asset: string;
  marginBalance: string;
  equity: string;
  available: string;
  locked: string;
  unrealizedPNL: string;
}

export interface AccountGreek {
  underlying: string;
  delta: string;
  gamma: string;
  theta: string;
  vega: string;
}

// Parsed/Computed Types
export interface ParsedOptionSymbol {
  symbol: string;
  underlying: string;
  expiryDate: Date;
  expiryTimestamp: number;
  strikePrice: number;
  side: "CALL" | "PUT";
  raw: OptionSymbol;
}

export interface OptionsChainRow {
  strikePrice: number;
  call?: ParsedOptionSymbol;
  put?: ParsedOptionSymbol;
  callTicker?: Ticker24hr;
  putTicker?: Ticker24hr;
  callMark?: MarkPrice;
  putMark?: MarkPrice;
}

export interface OptionsChainByExpiry {
  expiryDate: Date;
  expiryTimestamp: number;
  rows: OptionsChainRow[];
}

// WebSocket Types
export interface WsTickerMessage {
  e: "24hrTicker";
  E: number;
  T: number;
  s: string;
  o: string;
  h: string;
  l: string;
  c: string;
  V: string;
  A: string;
  P: string;
  p: string;
  Q: string;
  F: number;
  L: number;
  n: number;
  bo: string;
  ao: string;
  bq: string;
  aq: string;
  b: string;
  a: string;
  d: string;
  t: string;
  g: string;
  v: string;
  vo: string;
  mp: string;
  hl: string;
  ll: string;
  eep: string;
}

export interface WsDepthMessage {
  e: "depth";
  E: number;
  T: number;
  s: string;
  u: number;
  b: [string, string][];
  a: [string, string][];
}

export interface WsTradeMessage {
  e: "trade";
  E: number;
  s: string;
  t: string;
  p: string;
  q: string;
  b: number;
  a: number;
  T: number;
  S: string;
}

export interface WsKlineMessage {
  e: "kline";
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
  };
}

export interface WsIndexMessage {
  e: "index";
  E: number;
  s: string;
  p: string;
}

// Store Types
export interface OptionsStore {
  // Data
  exchangeInfo: ExchangeInfo | null;
  underlyings: string[];
  selectedUnderlying: string;
  expiryDates: Date[];
  selectedExpiry: Date | null;
  optionsChain: OptionsChainByExpiry[];

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
  updateMarkPrice: (mark: MarkPrice) => void;
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
}

// API Configuration
export interface ApiConfig {
  apiKey?: string;
  apiSecret?: string;
}

export type KlineInterval =
  | "1m" | "3m" | "5m" | "15m" | "30m"
  | "1h" | "2h" | "4h" | "6h" | "12h"
  | "1d" | "3d" | "1w" | "1M";
