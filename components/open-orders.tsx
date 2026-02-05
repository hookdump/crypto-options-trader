"use client";

import { useState } from "react";
import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate, parseSymbol } from "@/lib/format";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function OpenOrders() {
  const { openOrders, setSelectedSymbol } = useOptionsStore();
  const { apiConfigured } = usePreferencesStore();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancel = async (symbol: string, orderId: number) => {
    setCancellingId(orderId);
    try {
      const response = await fetch("/api/order", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, orderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Cancel failed");
      }

      // TODO: Refresh orders
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (!apiConfigured) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
        Configure API keys to view orders
      </div>
    );
  }

  if (openOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
        No open orders
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
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-right text-zinc-400">Price</TableHead>
            <TableHead className="text-right text-zinc-400">Size</TableHead>
            <TableHead className="text-right text-zinc-400">Filled</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Time</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openOrders.map((order) => {
            const parsed = parseSymbol(order.symbol);
            const isCall = order.optionSide === "CALL";
            const isBuy = order.side === "BUY";
            const filledPercent =
              (parseFloat(order.executedQty) / parseFloat(order.quantity)) *
              100;

            return (
              <TableRow
                key={order.orderId}
                className="hover:bg-zinc-800/50 cursor-pointer"
                onClick={() => setSelectedSymbol(order.symbol)}
              >
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    {order.symbol}
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
                      isBuy
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {order.side}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400">{order.type}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(order.price, 2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(order.quantity, 4)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span
                    className={cn(
                      filledPercent > 0 ? "text-blue-400" : "text-zinc-500"
                    )}
                  >
                    {formatNumber(filledPercent, 1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      order.status === "ACCEPTED"
                        ? "bg-blue-500/20 text-blue-400"
                        : order.status === "PARTIALLY_FILLED"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-zinc-700 text-zinc-400"
                    )}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {formatDate(order.createTime, "MMM d HH:mm")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(order.symbol, order.orderId);
                    }}
                    disabled={cancellingId === order.orderId}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
