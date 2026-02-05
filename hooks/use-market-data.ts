"use client";

import { useEffect, useRef, useCallback } from "react";
import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import {
  getExchangeInfo,
  getTicker24hr,
  getMarkPrice,
  getIndexPrice,
  getOrderBook,
  getKlines,
  getRecentTrades,
} from "@/lib/binance-api";
import wsManager from "@/lib/websocket-manager";
import type {
  WsTickerMessage,
  WsDepthMessage,
  WsTradeMessage,
  WsKlineMessage,
  WsIndexMessage,
  KlineInterval,
  Ticker24hr,
  MarkPrice,
  Trade,
  Kline,
} from "@/lib/types";

export function useMarketData() {
  const {
    selectedUnderlying,
    selectedSymbol,
    setExchangeInfo,
    updateTicker,
    updateTickers,
    updateMarkPrice,
    updateMarkPrices,
    updateIndexPrice,
    setOrderBook,
    setRecentTrades,
    addTrade,
    setKlines,
    updateKline,
    setLoading,
    setError,
    setWsConnected,
    getFilteredSymbols,
  } = useOptionsStore();

  const { chartInterval } = usePreferencesStore();

  const tickerUnsubRef = useRef<(() => void) | null>(null);
  const depthUnsubRef = useRef<(() => void) | null>(null);
  const tradeUnsubRef = useRef<(() => void) | null>(null);
  const klineUnsubRef = useRef<(() => void) | null>(null);
  const indexUnsubRef = useRef<(() => void) | null>(null);

  // Fetch initial exchange info
  const fetchExchangeInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await getExchangeInfo();
      setExchangeInfo(info);
    } catch (error) {
      console.error("Failed to fetch exchange info:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch exchange info"
      );
    } finally {
      setLoading(false);
    }
  }, [setExchangeInfo, setLoading, setError]);

  // Fetch tickers for filtered symbols
  const fetchTickers = useCallback(async () => {
    try {
      const tickers = await getTicker24hr();
      updateTickers(tickers);
    } catch (error) {
      console.error("Failed to fetch tickers:", error);
    }
  }, [updateTickers]);

  // Fetch mark prices
  const fetchMarkPrices = useCallback(async () => {
    try {
      const marks = await getMarkPrice();
      updateMarkPrices(marks);
    } catch (error) {
      console.error("Failed to fetch mark prices:", error);
    }
  }, [updateMarkPrices]);

  // Fetch index price for underlying
  const fetchIndexPrice = useCallback(async () => {
    if (!selectedUnderlying) return;

    try {
      const price = await getIndexPrice(selectedUnderlying);
      updateIndexPrice(selectedUnderlying, price);
    } catch (error) {
      console.error("Failed to fetch index price:", error);
    }
  }, [selectedUnderlying, updateIndexPrice]);

  // Fetch order book for selected symbol
  const fetchOrderBook = useCallback(async () => {
    if (!selectedSymbol) return;

    try {
      const book = await getOrderBook(selectedSymbol, 20);
      setOrderBook(book);
    } catch (error) {
      console.error("Failed to fetch order book:", error);
    }
  }, [selectedSymbol, setOrderBook]);

  // Fetch klines for selected symbol
  const fetchKlines = useCallback(async () => {
    if (!selectedSymbol) return;

    try {
      const klines = await getKlines(
        selectedSymbol,
        chartInterval as KlineInterval,
        { limit: 200 }
      );
      setKlines(klines);
    } catch (error) {
      console.error("Failed to fetch klines:", error);
    }
  }, [selectedSymbol, chartInterval, setKlines]);

  // Fetch recent trades for selected symbol
  const fetchRecentTrades = useCallback(async () => {
    if (!selectedSymbol) return;

    try {
      const trades = await getRecentTrades(selectedSymbol, 50);
      setRecentTrades(trades);
    } catch (error) {
      console.error("Failed to fetch recent trades:", error);
    }
  }, [selectedSymbol, setRecentTrades]);

  // Setup WebSocket subscriptions for tickers
  const setupTickerSubscriptions = useCallback(() => {
    const symbols = getFilteredSymbols();
    if (symbols.length === 0) return;

    // Unsubscribe from previous
    if (tickerUnsubRef.current) {
      tickerUnsubRef.current();
    }

    // Subscribe to tickers for all symbols
    const symbolNames = symbols.map((s) => s.symbol);
    tickerUnsubRef.current = wsManager.subscribeMultipleTickers(
      symbolNames,
      (data: WsTickerMessage) => {
        const ticker: Ticker24hr = {
          symbol: data.s,
          priceChange: data.p,
          priceChangePercent: data.P,
          lastPrice: data.c,
          lastQty: data.Q,
          open: data.o,
          high: data.h,
          low: data.l,
          volume: data.V,
          amount: data.A,
          bidPrice: data.bo,
          askPrice: data.ao,
          openTime: 0,
          closeTime: data.E,
          firstTradeId: data.F,
          tradeCount: data.n,
          strikePrice: "",
          exercisePrice: data.eep,
        };
        updateTicker(ticker);
      }
    );
  }, [getFilteredSymbols, updateTicker]);

  // Setup WebSocket for index price
  const setupIndexSubscription = useCallback(() => {
    if (!selectedUnderlying) return;

    if (indexUnsubRef.current) {
      indexUnsubRef.current();
    }

    indexUnsubRef.current = wsManager.subscribeIndex(
      selectedUnderlying,
      (data: WsIndexMessage) => {
        updateIndexPrice(selectedUnderlying, {
          indexPrice: data.p,
          time: data.E,
        });
      }
    );
  }, [selectedUnderlying, updateIndexPrice]);

  // Setup WebSocket for selected symbol
  const setupSymbolSubscriptions = useCallback(() => {
    if (!selectedSymbol) return;

    // Cleanup previous subscriptions
    if (depthUnsubRef.current) depthUnsubRef.current();
    if (tradeUnsubRef.current) tradeUnsubRef.current();
    if (klineUnsubRef.current) klineUnsubRef.current();

    // Subscribe to depth updates
    depthUnsubRef.current = wsManager.subscribeDepth(
      selectedSymbol,
      (data: WsDepthMessage) => {
        setOrderBook({
          transactionTime: data.T,
          symbol: data.s,
          bids: data.b,
          asks: data.a,
        });
      }
    );

    // Subscribe to trade updates
    tradeUnsubRef.current = wsManager.subscribeTrade(
      selectedSymbol,
      (data: WsTradeMessage) => {
        const trade: Trade = {
          id: parseInt(data.t),
          tradeId: parseInt(data.t),
          symbol: data.s,
          price: data.p,
          qty: data.q,
          quoteQty: "",
          side: data.S === "BUY" ? 1 : -1,
          time: data.T,
        };
        addTrade(trade);
      }
    );

    // Subscribe to kline updates
    klineUnsubRef.current = wsManager.subscribeKline(
      selectedSymbol,
      chartInterval as KlineInterval,
      (data: WsKlineMessage) => {
        const kline: Kline = {
          openTime: data.k.t,
          open: data.k.o,
          high: data.k.h,
          low: data.k.l,
          close: data.k.c,
          volume: data.k.v,
          closeTime: data.k.T,
          amount: data.k.q,
          tradeCount: data.k.n,
          takerVolume: data.k.V,
          takerAmount: data.k.Q,
          time: Math.floor(data.k.t / 1000),
        };
        updateKline(kline);
      }
    );
  }, [
    selectedSymbol,
    chartInterval,
    setOrderBook,
    addTrade,
    updateKline,
  ]);

  // Initialize: fetch exchange info and connect WebSocket
  useEffect(() => {
    fetchExchangeInfo();

    wsManager.setConnectionChangeHandler(setWsConnected);
    wsManager.connect().catch(console.error);

    return () => {
      // Cleanup all subscriptions
      if (tickerUnsubRef.current) tickerUnsubRef.current();
      if (depthUnsubRef.current) depthUnsubRef.current();
      if (tradeUnsubRef.current) tradeUnsubRef.current();
      if (klineUnsubRef.current) klineUnsubRef.current();
      if (indexUnsubRef.current) indexUnsubRef.current();
    };
  }, [fetchExchangeInfo, setWsConnected]);

  // Fetch data when underlying changes
  useEffect(() => {
    if (!selectedUnderlying) return;

    fetchTickers();
    fetchMarkPrices();
    fetchIndexPrice();
    setupTickerSubscriptions();
    setupIndexSubscription();

    // Refresh tickers and marks periodically (every 30s)
    const refreshInterval = setInterval(() => {
      fetchTickers();
      fetchMarkPrices();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [
    selectedUnderlying,
    fetchTickers,
    fetchMarkPrices,
    fetchIndexPrice,
    setupTickerSubscriptions,
    setupIndexSubscription,
  ]);

  // Fetch data when selected symbol changes
  useEffect(() => {
    if (!selectedSymbol) return;

    fetchOrderBook();
    fetchKlines();
    fetchRecentTrades();
    setupSymbolSubscriptions();
  }, [
    selectedSymbol,
    fetchOrderBook,
    fetchKlines,
    fetchRecentTrades,
    setupSymbolSubscriptions,
  ]);

  // Refetch klines when interval changes
  useEffect(() => {
    if (!selectedSymbol) return;

    fetchKlines();

    // Re-setup kline subscription with new interval
    if (klineUnsubRef.current) klineUnsubRef.current();
    klineUnsubRef.current = wsManager.subscribeKline(
      selectedSymbol,
      chartInterval as KlineInterval,
      (data: WsKlineMessage) => {
        const kline: Kline = {
          openTime: data.k.t,
          open: data.k.o,
          high: data.k.h,
          low: data.k.l,
          close: data.k.c,
          volume: data.k.v,
          closeTime: data.k.T,
          amount: data.k.q,
          tradeCount: data.k.n,
          takerVolume: data.k.V,
          takerAmount: data.k.Q,
          time: Math.floor(data.k.t / 1000),
        };
        updateKline(kline);
      }
    );
  }, [chartInterval, selectedSymbol, fetchKlines, updateKline]);

  return {
    fetchExchangeInfo,
    fetchTickers,
    fetchMarkPrices,
    fetchIndexPrice,
    fetchOrderBook,
    fetchKlines,
    fetchRecentTrades,
  };
}
