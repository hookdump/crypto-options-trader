import type {
  WsTickerMessage,
  WsDepthMessage,
  WsTradeMessage,
  WsKlineMessage,
  WsIndexMessage,
  KlineInterval,
} from "./types";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_BINANCE_WS_URL || "wss://nbstream.binance.com/eoptions";

type StreamType = "ticker" | "depth" | "trade" | "kline" | "index";

interface Subscription {
  stream: string;
  callback: (data: unknown) => void;
}

type MessageHandler = (data: unknown) => void;

class BinanceWebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private messageQueue: string[] = [];
  private onConnectionChange?: (connected: boolean) => void;

  setConnectionChangeHandler(handler: (connected: boolean) => void) {
    this.onConnectionChange = handler;
  }

  private getStreamName(
    type: StreamType,
    symbol: string,
    interval?: KlineInterval
  ): string {
    switch (type) {
      case "ticker":
        return `${symbol}@ticker`;
      case "depth":
        return `${symbol}@depth@100ms`;
      case "trade":
        return `${symbol}@trade`;
      case "kline":
        return `${symbol}@kline_${interval || "1m"}`;
      case "index":
        return `${symbol}@index`;
      default:
        throw new Error(`Unknown stream type: ${type}`);
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(`${WS_BASE_URL}/ws`);

        this.ws.onopen = () => {
          console.log("[WS] Connected to Binance Options WebSocket");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.onConnectionChange?.(true);

          // Send queued messages
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg && this.ws?.readyState === WebSocket.OPEN) {
              this.ws.send(msg);
            }
          }

          // Resubscribe to all existing subscriptions
          this.resubscribeAll();

          // Start ping interval
          this.startPingInterval();

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("[WS] Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("[WS] WebSocket error:", error);
          this.isConnecting = false;
        };

        this.ws.onclose = (event) => {
          console.log("[WS] Connection closed:", event.code, event.reason);
          this.isConnecting = false;
          this.onConnectionChange?.(false);
          this.stopPingInterval();

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(data: unknown) {
    // Handle different message types
    if (typeof data !== "object" || data === null) return;

    const message = data as Record<string, unknown>;

    // Handle combined stream format
    if ("stream" in message && "data" in message) {
      const stream = message.stream as string;
      const streamData = message.data;
      const handlers = this.subscriptions.get(stream);
      if (handlers) {
        handlers.forEach((handler) => handler(streamData));
      }
      return;
    }

    // Handle single stream format
    if ("e" in message) {
      const eventType = message.e as string;
      const symbol = (message.s as string)?.toLowerCase() || "";

      let streamName = "";
      switch (eventType) {
        case "24hrTicker":
          streamName = `${symbol}@ticker`;
          break;
        case "depth":
        case "depthUpdate":
          streamName = `${symbol}@depth@100ms`;
          break;
        case "trade":
          streamName = `${symbol}@trade`;
          break;
        case "kline":
          const interval = (message.k as { i: string })?.i || "1m";
          streamName = `${symbol}@kline_${interval}`;
          break;
        case "index":
          streamName = `${symbol}@index`;
          break;
      }

      if (streamName) {
        const handlers = this.subscriptions.get(streamName);
        if (handlers) {
          handlers.forEach((handler) => handler(message));
        }
      }
    }
  }

  private startPingInterval() {
    this.stopPingInterval();
    // Send ping every 2 minutes to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "ping" }));
      }
    }, 120000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private resubscribeAll() {
    const streams = Array.from(this.subscriptions.keys());
    if (streams.length > 0) {
      this.sendSubscribe(streams);
    }
  }

  private sendSubscribe(streams: string[]) {
    const message = JSON.stringify({
      method: "SUBSCRIBE",
      params: streams,
      id: Date.now(),
    });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  private sendUnsubscribe(streams: string[]) {
    const message = JSON.stringify({
      method: "UNSUBSCRIBE",
      params: streams,
      id: Date.now(),
    });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  subscribe(
    type: StreamType,
    symbol: string,
    callback: MessageHandler,
    interval?: KlineInterval
  ): () => void {
    const stream = this.getStreamName(type, symbol.toLowerCase(), interval);

    // Add to subscriptions
    if (!this.subscriptions.has(stream)) {
      this.subscriptions.set(stream, []);
      // Send subscribe message
      this.sendSubscribe([stream]);
    }
    this.subscriptions.get(stream)!.push(callback);

    // Ensure connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(stream);
      if (handlers) {
        const index = handlers.indexOf(callback);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.subscriptions.delete(stream);
          this.sendUnsubscribe([stream]);
        }
      }
    };
  }

  // Convenience methods
  subscribeTicker(
    symbol: string,
    callback: (data: WsTickerMessage) => void
  ): () => void {
    return this.subscribe("ticker", symbol, callback as MessageHandler);
  }

  subscribeDepth(
    symbol: string,
    callback: (data: WsDepthMessage) => void
  ): () => void {
    return this.subscribe("depth", symbol, callback as MessageHandler);
  }

  subscribeTrade(
    symbol: string,
    callback: (data: WsTradeMessage) => void
  ): () => void {
    return this.subscribe("trade", symbol, callback as MessageHandler);
  }

  subscribeKline(
    symbol: string,
    interval: KlineInterval,
    callback: (data: WsKlineMessage) => void
  ): () => void {
    return this.subscribe("kline", symbol, callback as MessageHandler, interval);
  }

  subscribeIndex(
    underlying: string,
    callback: (data: WsIndexMessage) => void
  ): () => void {
    return this.subscribe("index", underlying, callback as MessageHandler);
  }

  // Subscribe to multiple symbols' tickers at once
  subscribeMultipleTickers(
    symbols: string[],
    callback: (data: WsTickerMessage) => void
  ): () => void {
    const unsubscribers = symbols.map((symbol) =>
      this.subscribeTicker(symbol, callback)
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  disconnect() {
    this.stopPingInterval();
    this.subscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsManager = new BinanceWebSocketManager();

export default wsManager;
