"use client";

import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent, parseSymbol } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Positions() {
  const { positions, setSelectedSymbol } = useOptionsStore();
  const { apiConfigured } = usePreferencesStore();

  if (!apiConfigured) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
        Configure API keys to view positions
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
        No open positions
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-zinc-400">Symbol</TableHead>
            <TableHead className="text-zinc-400">Side</TableHead>
            <TableHead className="text-right text-zinc-400">Size</TableHead>
            <TableHead className="text-right text-zinc-400">Entry</TableHead>
            <TableHead className="text-right text-zinc-400">Mark</TableHead>
            <TableHead className="text-right text-zinc-400">PnL</TableHead>
            <TableHead className="text-right text-zinc-400">ROE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => {
            const parsed = parseSymbol(position.symbol);
            const isCall = position.optionSide === "CALL";
            const isLong = position.side === "LONG";
            const pnl = parseFloat(position.unrealizedPNL);
            const roe = parseFloat(position.ror);

            return (
              <TableRow
                key={position.symbol}
                className="hover:bg-zinc-800/50 cursor-pointer"
                onClick={() => setSelectedSymbol(position.symbol)}
              >
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    {position.symbol}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        isCall
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {isCall ? "C" : "P"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      isLong
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-orange-500/20 text-orange-400"
                    )}
                  >
                    {position.side}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(position.quantity, 4)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(position.entryPrice, 2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(position.markPrice, 2)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono",
                    pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : ""
                  )}
                >
                  {pnl >= 0 ? "+" : ""}
                  {formatNumber(pnl, 2)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono",
                    roe > 0 ? "text-green-400" : roe < 0 ? "text-red-400" : ""
                  )}
                >
                  {formatPercent(roe * 100)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
