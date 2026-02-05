"use client";

import { useState } from "react";
import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderSide = "BUY" | "SELL";
type OrderType = "LIMIT" | "MARKET";
type TimeInForce = "GTC" | "IOC" | "FOK";

export function OrderForm() {
  const { selectedSymbol, tickers, accountInfo } = useOptionsStore();
  const { apiConfigured } = usePreferencesStore();

  const [side, setSide] = useState<OrderSide>("BUY");
  const [orderType, setOrderType] = useState<OrderType>("LIMIT");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState<TimeInForce>("GTC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticker = selectedSymbol ? tickers[selectedSymbol] : null;

  // Auto-fill price from ticker
  const fillBid = () => {
    if (ticker?.bidPrice) setPrice(ticker.bidPrice);
  };

  const fillAsk = () => {
    if (ticker?.askPrice) setPrice(ticker.askPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSymbol || !apiConfigured) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side,
          type: orderType,
          quantity,
          price: orderType === "LIMIT" ? price : undefined,
          timeInForce: orderType === "LIMIT" ? timeInForce : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Order failed");
      }

      // Reset form
      setQuantity("");
      setPrice("");

      // TODO: Show success notification
    } catch (error) {
      console.error("Order error:", error);
      // TODO: Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedValue =
    parseFloat(quantity || "0") * parseFloat(price || "0");

  if (!selectedSymbol) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex items-center justify-center h-48 text-zinc-500 text-sm">
          Select a contract to trade
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Place Order</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Buy/Sell Toggle */}
          <Tabs
            value={side}
            onValueChange={(v) => setSide(v as OrderSide)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 bg-zinc-800">
              <TabsTrigger
                value="BUY"
                className={cn(
                  "data-[state=active]:bg-green-600 data-[state=active]:text-white"
                )}
              >
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="SELL"
                className={cn(
                  "data-[state=active]:bg-red-600 data-[state=active]:text-white"
                )}
              >
                Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Order Type */}
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">
              Order Type
            </label>
            <Select
              value={orderType}
              onValueChange={(v) => setOrderType(v as OrderType)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem
                  value="LIMIT"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  Limit
                </SelectItem>
                <SelectItem
                  value="MARKET"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  Market
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price (for limit orders) */}
          {orderType === "LIMIT" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-500">Price</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={fillBid}
                    className="text-xs text-green-400 hover:text-green-300"
                  >
                    Bid
                  </button>
                  <span className="text-zinc-600">|</span>
                  <button
                    type="button"
                    onClick={fillAsk}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Ask
                  </button>
                </div>
              </div>
              <Input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-zinc-800 border-zinc-700 font-mono"
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">
              Quantity (contracts)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="bg-zinc-800 border-zinc-700 font-mono"
            />
          </div>

          {/* Time in Force (for limit orders) */}
          {orderType === "LIMIT" && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
                Time in Force
              </label>
              <Select
                value={timeInForce}
                onValueChange={(v) => setTimeInForce(v as TimeInForce)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem
                    value="GTC"
                    className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    Good Till Cancel
                  </SelectItem>
                  <SelectItem
                    value="IOC"
                    className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    Immediate or Cancel
                  </SelectItem>
                  <SelectItem
                    value="FOK"
                    className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    Fill or Kill
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Estimated Value */}
          {estimatedValue > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
              <span className="text-zinc-500">Est. Value</span>
              <span className="font-mono">
                ${formatNumber(estimatedValue, 2)}
              </span>
            </div>
          )}

          {/* Submit Button */}
          {!apiConfigured ? (
            <div className="text-center text-sm text-zinc-500 py-2">
              Configure API keys in settings to trade
            </div>
          ) : (
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !quantity ||
                (orderType === "LIMIT" && !price)
              }
              className={cn(
                "w-full font-semibold",
                side === "BUY"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isSubmitting
                ? "Placing Order..."
                : `${side} ${selectedSymbol}`}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
