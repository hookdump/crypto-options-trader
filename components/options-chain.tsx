"use client";

import { useOptionsStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  formatNumber,
  formatStrike,
  formatExpiry,
  formatIV,
  formatGreek,
  getDaysToExpiry,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OptionCellProps {
  symbol?: string;
  bidPrice?: string;
  askPrice?: string;
  lastPrice?: string;
  volume?: string;
  delta?: string;
  iv?: string;
  isCall: boolean;
  onSelect: (symbol: string) => void;
  isSelected: boolean;
}

function OptionCell({
  symbol,
  bidPrice,
  askPrice,
  lastPrice,
  volume,
  delta,
  iv,
  isCall,
  onSelect,
  isSelected,
}: OptionCellProps) {
  if (!symbol) {
    return (
      <TableCell
        colSpan={5}
        className="text-center text-zinc-600 bg-zinc-900/50"
      >
        -
      </TableCell>
    );
  }

  const bid = bidPrice ? parseFloat(bidPrice) : 0;
  const ask = askPrice ? parseFloat(askPrice) : 0;
  const spread = ask > 0 ? ((ask - bid) / ask) * 100 : 0;

  return (
    <>
      <TableCell
        className={cn(
          "text-right font-mono cursor-pointer transition-colors",
          isCall ? "hover:bg-green-900/20" : "hover:bg-red-900/20",
          isSelected && (isCall ? "bg-green-900/30" : "bg-red-900/30")
        )}
        onClick={() => onSelect(symbol)}
      >
        <span className={cn(isCall ? "text-green-400" : "text-red-400")}>
          {formatNumber(bid, 2)}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono cursor-pointer transition-colors",
          isCall ? "hover:bg-green-900/20" : "hover:bg-red-900/20",
          isSelected && (isCall ? "bg-green-900/30" : "bg-red-900/30")
        )}
        onClick={() => onSelect(symbol)}
      >
        <span className={cn(isCall ? "text-green-400" : "text-red-400")}>
          {formatNumber(ask, 2)}
        </span>
      </TableCell>
      <TableCell className="text-right font-mono text-zinc-300">
        {lastPrice ? formatNumber(lastPrice, 2) : "-"}
      </TableCell>
      <TableCell className="text-right font-mono text-zinc-400">
        {volume ? formatNumber(volume, 0) : "-"}
      </TableCell>
      <TableCell className="text-right font-mono text-zinc-400">
        {delta ? formatGreek(delta, 3) : "-"}
      </TableCell>
      <TableCell className="text-right font-mono text-zinc-400">
        {iv ? formatIV(iv) : "-"}
      </TableCell>
    </>
  );
}

export function OptionsChain() {
  const {
    optionsChain,
    selectedExpiry,
    selectedSymbol,
    setSelectedSymbol,
    tickers,
    markPrices,
    indexPrices,
    selectedUnderlying,
  } = useOptionsStore();

  const indexPrice = indexPrices[selectedUnderlying]
    ? parseFloat(indexPrices[selectedUnderlying].indexPrice)
    : 0;

  if (optionsChain.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        No options data available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-8">
        {optionsChain.map((expiryGroup) => {
          const daysToExpiry = getDaysToExpiry(expiryGroup.expiryDate);

          return (
            <div key={expiryGroup.expiryTimestamp} className="space-y-2">
              {!selectedExpiry && (
                <div className="flex items-center gap-3 px-2 py-1 sticky top-0 bg-zinc-950 z-10">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {formatExpiry(expiryGroup.expiryDate)}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      daysToExpiry <= 1
                        ? "bg-red-500/20 text-red-400"
                        : daysToExpiry <= 7
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-zinc-800 text-zinc-400"
                    )}
                  >
                    {daysToExpiry} days
                  </Badge>
                </div>
              )}

              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/50 hover:bg-zinc-900/50">
                      {/* Call columns */}
                      <TableHead className="text-right text-green-400 w-20">
                        Bid
                      </TableHead>
                      <TableHead className="text-right text-green-400 w-20">
                        Ask
                      </TableHead>
                      <TableHead className="text-right text-green-400 w-20">
                        Last
                      </TableHead>
                      <TableHead className="text-right text-green-400 w-16">
                        Vol
                      </TableHead>
                      <TableHead className="text-right text-green-400 w-16">
                        Delta
                      </TableHead>
                      <TableHead className="text-right text-green-400 w-16">
                        IV
                      </TableHead>

                      {/* Strike column */}
                      <TableHead className="text-center bg-zinc-800 text-zinc-100 font-bold w-24">
                        Strike
                      </TableHead>

                      {/* Put columns */}
                      <TableHead className="text-right text-red-400 w-20">
                        Bid
                      </TableHead>
                      <TableHead className="text-right text-red-400 w-20">
                        Ask
                      </TableHead>
                      <TableHead className="text-right text-red-400 w-20">
                        Last
                      </TableHead>
                      <TableHead className="text-right text-red-400 w-16">
                        Vol
                      </TableHead>
                      <TableHead className="text-right text-red-400 w-16">
                        Delta
                      </TableHead>
                      <TableHead className="text-right text-red-400 w-16">
                        IV
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiryGroup.rows.map((row) => {
                      const callTicker = row.call
                        ? tickers[row.call.symbol]
                        : undefined;
                      const putTicker = row.put
                        ? tickers[row.put.symbol]
                        : undefined;
                      const callMark = row.call
                        ? markPrices[row.call.symbol]
                        : undefined;
                      const putMark = row.put
                        ? markPrices[row.put.symbol]
                        : undefined;

                      const isITMCall = indexPrice > row.strikePrice;
                      const isITMPut = indexPrice < row.strikePrice;
                      const isATM =
                        Math.abs(indexPrice - row.strikePrice) / indexPrice <
                        0.02;

                      return (
                        <TableRow
                          key={row.strikePrice}
                          className={cn(
                            "hover:bg-zinc-800/50",
                            isATM && "bg-blue-900/20"
                          )}
                        >
                          <OptionCell
                            symbol={row.call?.symbol}
                            bidPrice={callTicker?.bidPrice}
                            askPrice={callTicker?.askPrice}
                            lastPrice={callTicker?.lastPrice}
                            volume={callTicker?.volume}
                            delta={callMark?.delta}
                            iv={callMark?.markIV}
                            isCall={true}
                            onSelect={setSelectedSymbol}
                            isSelected={selectedSymbol === row.call?.symbol}
                          />

                          <TableCell
                            className={cn(
                              "text-center font-mono font-bold",
                              isATM
                                ? "bg-blue-900/40 text-blue-300"
                                : "bg-zinc-800 text-zinc-100"
                            )}
                          >
                            {formatStrike(row.strikePrice)}
                          </TableCell>

                          <OptionCell
                            symbol={row.put?.symbol}
                            bidPrice={putTicker?.bidPrice}
                            askPrice={putTicker?.askPrice}
                            lastPrice={putTicker?.lastPrice}
                            volume={putTicker?.volume}
                            delta={putMark?.delta}
                            iv={putMark?.markIV}
                            isCall={false}
                            onSelect={setSelectedSymbol}
                            isSelected={selectedSymbol === row.put?.symbol}
                          />
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
