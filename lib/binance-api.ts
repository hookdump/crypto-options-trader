import CryptoJS from "crypto-js";
import type {
  ExchangeInfo,
  Ticker24hr,
  IndexPrice,
  MarkPrice,
  OrderBook,
  Kline,
  Trade,
  OpenInterest,
  Order,
  Position,
  AccountInfo,
  KlineInterval,
} from "./types";

const EAPI_BASE_URL =
  process.env.NEXT_PUBLIC_BINANCE_EAPI_URL || "https://eapi.binance.com";

interface RequestParams {
  [key: string]: string | number | boolean | undefined;
}

function buildQueryString(params: RequestParams): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
}

function generateSignature(queryString: string, secret: string): string {
  return CryptoJS.HmacSHA256(queryString, secret).toString(CryptoJS.enc.Hex);
}

async function publicRequest<T>(
  endpoint: string,
  params: RequestParams = {}
): Promise<T> {
  const queryString = buildQueryString(params);
  const url = `${EAPI_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: response.statusText }));
    throw new Error(error.msg || `Request failed: ${response.status}`);
  }

  return response.json();
}

async function signedRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  params: RequestParams = {},
  apiKey?: string,
  apiSecret?: string
): Promise<T> {
  if (!apiKey || !apiSecret) {
    throw new Error("API key and secret are required for signed requests");
  }

  const timestamp = Date.now();
  const paramsWithTimestamp = { ...params, timestamp, recvWindow: 5000 };
  const queryString = buildQueryString(paramsWithTimestamp);
  const signature = generateSignature(queryString, apiSecret);

  const url = `${EAPI_BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  const response = await fetch(url, {
    method,
    headers: {
      "X-MBX-APIKEY": apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: response.statusText }));
    throw new Error(error.msg || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ============ PUBLIC ENDPOINTS ============

/**
 * Get exchange information including all option symbols
 */
export async function getExchangeInfo(): Promise<ExchangeInfo> {
  return publicRequest<ExchangeInfo>("/eapi/v1/exchangeInfo");
}

/**
 * Get 24hr ticker for a symbol or all symbols
 */
export async function getTicker24hr(symbol?: string): Promise<Ticker24hr[]> {
  const result = await publicRequest<Ticker24hr | Ticker24hr[]>(
    "/eapi/v1/ticker",
    symbol ? { symbol } : {}
  );
  return Array.isArray(result) ? result : [result];
}

/**
 * Get the current index price for an underlying asset
 */
export async function getIndexPrice(underlying: string): Promise<IndexPrice> {
  return publicRequest<IndexPrice>("/eapi/v1/index", { underlying });
}

/**
 * Get mark price and greeks for a symbol
 */
export async function getMarkPrice(symbol?: string): Promise<MarkPrice[]> {
  const result = await publicRequest<MarkPrice | MarkPrice[]>(
    "/eapi/v1/mark",
    symbol ? { symbol } : {}
  );
  return Array.isArray(result) ? result : [result];
}

/**
 * Get order book depth
 */
export async function getOrderBook(
  symbol: string,
  limit: number = 100
): Promise<OrderBook> {
  return publicRequest<OrderBook>("/eapi/v1/depth", { symbol, limit });
}

/**
 * Get klines/candlestick data
 */
export async function getKlines(
  symbol: string,
  interval: KlineInterval,
  options?: {
    startTime?: number;
    endTime?: number;
    limit?: number;
  }
): Promise<Kline[]> {
  const rawKlines = await publicRequest<
    [number, string, string, string, string, string, number, string, number, string, string][]
  >("/eapi/v1/klines", {
    symbol,
    interval,
    startTime: options?.startTime,
    endTime: options?.endTime,
    limit: options?.limit || 500,
  });

  return rawKlines.map((k) => ({
    openTime: k[0],
    open: k[1],
    high: k[2],
    low: k[3],
    close: k[4],
    volume: k[5],
    closeTime: k[6],
    amount: k[7],
    tradeCount: k[8],
    takerVolume: k[9],
    takerAmount: k[10],
    time: Math.floor(k[0] / 1000), // For lightweight-charts (seconds)
  }));
}

/**
 * Get recent trades
 */
export async function getRecentTrades(
  symbol: string,
  limit: number = 100
): Promise<Trade[]> {
  return publicRequest<Trade[]>("/eapi/v1/trades", { symbol, limit });
}

/**
 * Get open interest
 */
export async function getOpenInterest(
  underlyingAsset: string,
  expiration: string
): Promise<OpenInterest[]> {
  return publicRequest<OpenInterest[]>("/eapi/v1/openInterest", {
    underlyingAsset,
    expiration,
  });
}

/**
 * Get historical volatility
 */
export async function getHistoricalVolatility(
  underlying: string
): Promise<{ close: number; closeTime: number }[]> {
  return publicRequest("/eapi/v1/historicalVolatility", { underlying });
}

// ============ SIGNED ENDPOINTS ============

/**
 * Get account information
 */
export async function getAccountInfo(
  apiKey: string,
  apiSecret: string
): Promise<AccountInfo> {
  return signedRequest<AccountInfo>(
    "/eapi/v1/account",
    "GET",
    {},
    apiKey,
    apiSecret
  );
}

/**
 * Get current positions
 */
export async function getPositions(
  apiKey: string,
  apiSecret: string,
  symbol?: string
): Promise<Position[]> {
  return signedRequest<Position[]>(
    "/eapi/v1/position",
    "GET",
    symbol ? { symbol } : {},
    apiKey,
    apiSecret
  );
}

/**
 * Get open orders
 */
export async function getOpenOrders(
  apiKey: string,
  apiSecret: string,
  symbol?: string
): Promise<Order[]> {
  return signedRequest<Order[]>(
    "/eapi/v1/openOrders",
    "GET",
    symbol ? { symbol } : {},
    apiKey,
    apiSecret
  );
}

/**
 * Get order history
 */
export async function getOrderHistory(
  apiKey: string,
  apiSecret: string,
  symbol: string,
  options?: {
    orderId?: number;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }
): Promise<Order[]> {
  return signedRequest<Order[]>(
    "/eapi/v1/historyOrders",
    "GET",
    { symbol, ...options },
    apiKey,
    apiSecret
  );
}

/**
 * Place a new order
 */
export async function placeOrder(
  apiKey: string,
  apiSecret: string,
  params: {
    symbol: string;
    side: "BUY" | "SELL";
    type: "LIMIT" | "MARKET";
    quantity: string;
    price?: string;
    timeInForce?: "GTC" | "IOC" | "FOK";
    reduceOnly?: boolean;
    postOnly?: boolean;
    clientOrderId?: string;
    isMmp?: boolean;
  }
): Promise<Order> {
  return signedRequest<Order>(
    "/eapi/v1/order",
    "POST",
    params,
    apiKey,
    apiSecret
  );
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  apiKey: string,
  apiSecret: string,
  symbol: string,
  orderId?: number,
  clientOrderId?: string
): Promise<Order> {
  return signedRequest<Order>(
    "/eapi/v1/order",
    "DELETE",
    { symbol, orderId, clientOrderId },
    apiKey,
    apiSecret
  );
}

/**
 * Cancel all open orders for a symbol
 */
export async function cancelAllOrders(
  apiKey: string,
  apiSecret: string,
  symbol: string
): Promise<Order[]> {
  return signedRequest<Order[]>(
    "/eapi/v1/allOpenOrders",
    "DELETE",
    { symbol },
    apiKey,
    apiSecret
  );
}

/**
 * Batch place orders
 */
export async function batchPlaceOrders(
  apiKey: string,
  apiSecret: string,
  orders: Array<{
    symbol: string;
    side: "BUY" | "SELL";
    type: "LIMIT" | "MARKET";
    quantity: string;
    price?: string;
    timeInForce?: "GTC" | "IOC" | "FOK";
    reduceOnly?: boolean;
    postOnly?: boolean;
    clientOrderId?: string;
  }>
): Promise<Order[]> {
  return signedRequest<Order[]>(
    "/eapi/v1/batchOrders",
    "POST",
    { orders: JSON.stringify(orders) },
    apiKey,
    apiSecret
  );
}

// ============ USER DATA STREAM ============

/**
 * Start a user data stream (listenKey)
 */
export async function startUserDataStream(
  apiKey: string
): Promise<{ listenKey: string }> {
  const response = await fetch(`${EAPI_BASE_URL}/eapi/v1/listenKey`, {
    method: "POST",
    headers: {
      "X-MBX-APIKEY": apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: response.statusText }));
    throw new Error(error.msg || `Request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Keep alive a user data stream
 */
export async function keepAliveUserDataStream(
  apiKey: string,
  listenKey: string
): Promise<void> {
  const response = await fetch(
    `${EAPI_BASE_URL}/eapi/v1/listenKey?listenKey=${listenKey}`,
    {
      method: "PUT",
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: response.statusText }));
    throw new Error(error.msg || `Request failed: ${response.status}`);
  }
}

/**
 * Close a user data stream
 */
export async function closeUserDataStream(
  apiKey: string,
  listenKey: string
): Promise<void> {
  const response = await fetch(
    `${EAPI_BASE_URL}/eapi/v1/listenKey?listenKey=${listenKey}`,
    {
      method: "DELETE",
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: response.statusText }));
    throw new Error(error.msg || `Request failed: ${response.status}`);
  }
}
