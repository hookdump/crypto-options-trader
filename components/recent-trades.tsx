"use client";

import { useOptionsStore } from "@/lib/store";
import { formatNumber, formatTradeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RecentTrades() {
  const { recentTrades, selectedSymbol } = useOptionsStore();

  if (!selectedSymbol) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        Select a contract to view trades
      </div>
    );
  }

  if (recentTrades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        No recent trades
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800 text-xs text-zinc-400">
        <span className="w-1/3">Price</span>
        <span className="w-1/3 text-center">Size</span>
        <span className="w-1/3 text-right">Time</span>
      </div>

      {/* Trades */}
      <ScrollArea className="flex-1">
        {recentTrades.map((trade) => {
          const isBuy = trade.side === 1;
          return (
            <div
              key={trade.tradeId || trade.id}
              className="flex items-center justify-between px-2 py-1.5 text-sm font-mono hover:bg-zinc-800/50"
            >
              <span
                className={cn(
                  "w-1/3",
                  isBuy ? "text-green-400" : "text-red-400"
                )}
              >
                {formatNumber(trade.price, 2)}
              </span>
              <span className="w-1/3 text-center text-zinc-300">
                {formatNumber(trade.qty, 4)}
              </span>
              <span className="w-1/3 text-right text-zinc-500">
                {formatTradeTime(trade.time)}
              </span>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
