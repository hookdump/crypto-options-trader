"use client";

import { useOptionsStore } from "@/lib/store";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderBookRowProps {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
  side: "bid" | "ask";
}

function OrderBookRow({
  price,
  quantity,
  total,
  maxTotal,
  side,
}: OrderBookRowProps) {
  const percentage = (total / maxTotal) * 100;
  const isBid = side === "bid";

  return (
    <div className="relative flex items-center h-7 text-sm font-mono">
      {/* Background bar */}
      <div
        className={cn(
          "absolute inset-y-0 transition-all duration-150",
          isBid ? "right-0 bg-green-500/10" : "left-0 bg-red-500/10"
        )}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />

      {/* Content */}
      <div className="relative flex w-full items-center justify-between px-2">
        <span
          className={cn(
            "w-1/3 text-left",
            isBid ? "text-green-400" : "text-red-400"
          )}
        >
          {formatNumber(price, 2)}
        </span>
        <span className="w-1/3 text-center text-zinc-300">
          {formatNumber(quantity, 4)}
        </span>
        <span className="w-1/3 text-right text-zinc-400">
          {formatNumber(total, 4)}
        </span>
      </div>
    </div>
  );
}

export function OrderBook() {
  const { orderBook, selectedSymbol } = useOptionsStore();

  if (!selectedSymbol) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        Select a contract to view order book
      </div>
    );
  }

  if (!orderBook) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        Loading order book...
      </div>
    );
  }

  // Calculate totals for depth visualization
  const asks = orderBook.asks.slice(0, 15).map(([price, qty]) => ({
    price,
    quantity: qty,
  }));

  const bids = orderBook.bids.slice(0, 15).map(([price, qty]) => ({
    price,
    quantity: qty,
  }));

  // Calculate cumulative totals
  let askTotal = 0;
  const asksWithTotal = asks.map((a) => {
    askTotal += parseFloat(a.quantity);
    return { ...a, total: askTotal };
  });

  let bidTotal = 0;
  const bidsWithTotal = bids.map((b) => {
    bidTotal += parseFloat(b.quantity);
    return { ...b, total: bidTotal };
  });

  const maxTotal = Math.max(
    asksWithTotal[asksWithTotal.length - 1]?.total || 0,
    bidsWithTotal[bidsWithTotal.length - 1]?.total || 0
  );

  // Calculate spread
  const bestBid = bids[0] ? parseFloat(bids[0].price) : 0;
  const bestAsk = asks[0] ? parseFloat(asks[0].price) : 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = bestAsk > 0 ? (spread / bestAsk) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800 text-xs text-zinc-400">
        <span className="w-1/3">Price</span>
        <span className="w-1/3 text-center">Size</span>
        <span className="w-1/3 text-right">Total</span>
      </div>

      {/* Asks (reversed to show lowest at bottom) */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col-reverse">
          {asksWithTotal.map((ask, i) => (
            <OrderBookRow
              key={`ask-${i}`}
              price={ask.price}
              quantity={ask.quantity}
              total={ask.total}
              maxTotal={maxTotal}
              side="ask"
            />
          ))}
        </div>
      </ScrollArea>

      {/* Spread */}
      <div className="flex items-center justify-center py-2 border-y border-zinc-800 bg-zinc-900/50">
        <span className="text-xs text-zinc-400">
          Spread: {formatNumber(spread, 2)} ({formatNumber(spreadPercent, 2)}%)
        </span>
      </div>

      {/* Bids */}
      <ScrollArea className="flex-1">
        <div>
          {bidsWithTotal.map((bid, i) => (
            <OrderBookRow
              key={`bid-${i}`}
              price={bid.price}
              quantity={bid.quantity}
              total={bid.total}
              maxTotal={maxTotal}
              side="bid"
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
