"use client";

import { useOptionsStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatNumber,
  formatIV,
  formatGreek,
  parseSymbol,
  formatExpiryFull,
  getDaysToExpiry,
  formatPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function ContractInfo() {
  const { selectedSymbol, tickers, markPrices, indexPrices, parsedSymbols } =
    useOptionsStore();

  if (!selectedSymbol) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex items-center justify-center h-48 text-zinc-500 text-sm">
          Select a contract to view details
        </CardContent>
      </Card>
    );
  }

  const ticker = tickers[selectedSymbol];
  const mark = markPrices[selectedSymbol];
  const parsed = parseSymbol(selectedSymbol);
  const symbolData = parsedSymbols.find((s) => s.symbol === selectedSymbol);

  const underlying = parsed?.underlying
    ? `${parsed.underlying}USDT`
    : undefined;
  const indexPrice = underlying ? indexPrices[underlying] : undefined;

  const isCall = parsed?.side === "C";
  const strikePrice = parsed?.strike ? parseFloat(parsed.strike) : 0;
  const currentPrice = indexPrice ? parseFloat(indexPrice.indexPrice) : 0;

  const isITM = isCall
    ? currentPrice > strikePrice
    : currentPrice < strikePrice;
  const intrinsicValue = isCall
    ? Math.max(0, currentPrice - strikePrice)
    : Math.max(0, strikePrice - currentPrice);

  const lastPrice = ticker?.lastPrice ? parseFloat(ticker.lastPrice) : 0;
  const timeValue = Math.max(0, lastPrice - intrinsicValue);

  const daysToExpiry = symbolData ? getDaysToExpiry(symbolData.expiryDate) : 0;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-mono">{selectedSymbol}</CardTitle>
          <div className="flex gap-2">
            <Badge
              className={cn(
                isCall
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {isCall ? "CALL" : "PUT"}
            </Badge>
            <Badge
              className={cn(
                isITM
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-zinc-700 text-zinc-400"
              )}
            >
              {isITM ? "ITM" : "OTM"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Mark Price</div>
            <div className="text-xl font-mono font-semibold">
              {mark?.markPrice ? formatNumber(mark.markPrice, 4) : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Last Price</div>
            <div className="text-xl font-mono">
              {ticker?.lastPrice ? formatNumber(ticker.lastPrice, 4) : "-"}
            </div>
          </div>
        </div>

        {/* Bid/Ask */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Bid</div>
            <div className="text-lg font-mono text-green-400">
              {ticker?.bidPrice ? formatNumber(ticker.bidPrice, 4) : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Ask</div>
            <div className="text-lg font-mono text-red-400">
              {ticker?.askPrice ? formatNumber(ticker.askPrice, 4) : "-"}
            </div>
          </div>
        </div>

        {/* Value Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Intrinsic</div>
            <div className="font-mono">{formatNumber(intrinsicValue, 2)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Time Value</div>
            <div className="font-mono">{formatNumber(timeValue, 2)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Days</div>
            <div className="font-mono">{daysToExpiry}</div>
          </div>
        </div>

        {/* Greeks */}
        <div className="pt-2 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2">Greeks</div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <div className="text-xs text-zinc-600">Delta</div>
              <div className="font-mono text-sm">
                {mark?.delta ? formatGreek(mark.delta, 4) : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">Gamma</div>
              <div className="font-mono text-sm">
                {mark?.gamma ? formatGreek(mark.gamma, 6) : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">Theta</div>
              <div className="font-mono text-sm">
                {mark?.theta ? formatGreek(mark.theta, 4) : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">Vega</div>
              <div className="font-mono text-sm">
                {mark?.vega ? formatGreek(mark.vega, 4) : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* IV */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Mark IV</div>
            <div className="font-mono">{mark?.markIV ? formatIV(mark.markIV) : "-"}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Bid IV</div>
            <div className="font-mono">{mark?.bidIV ? formatIV(mark.bidIV) : "-"}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Ask IV</div>
            <div className="font-mono">{mark?.askIV ? formatIV(mark.askIV) : "-"}</div>
          </div>
        </div>

        {/* 24h Stats */}
        {ticker && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
            <div>
              <div className="text-xs text-zinc-500 mb-1">24h Change</div>
              <div
                className={cn(
                  "font-mono",
                  parseFloat(ticker.priceChangePercent) > 0
                    ? "text-green-400"
                    : parseFloat(ticker.priceChangePercent) < 0
                    ? "text-red-400"
                    : ""
                )}
              >
                {formatPercent(ticker.priceChangePercent)}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">24h Volume</div>
              <div className="font-mono">
                {formatNumber(ticker.volume, 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Trades</div>
              <div className="font-mono">{ticker.tradeCount}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
