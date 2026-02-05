"use client";

import { useOptionsStore } from "@/lib/store";
import { ContractInfo } from "@/components/contract-info";
import { OrderBook } from "@/components/order-book";
import { PriceChart } from "@/components/price-chart";
import { RecentTrades } from "@/components/recent-trades";
import { OrderForm } from "@/components/order-form";
import { Positions } from "@/components/positions";
import { OpenOrders } from "@/components/open-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatNumber, formatExpiry, getDaysToExpiry } from "@/lib/format";
import { Search, Star } from "lucide-react";
import { useState, useMemo } from "react";

export default function TradePage() {
  const {
    selectedSymbol,
    setSelectedSymbol,
    parsedSymbols,
    selectedUnderlying,
    tickers,
    markPrices,
  } = useOptionsStore();

  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  // Filter symbols
  const filteredSymbols = useMemo(() => {
    let symbols = parsedSymbols.filter(
      (s) => s.underlying === selectedUnderlying
    );

    if (search) {
      const searchLower = search.toLowerCase();
      symbols = symbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchLower) ||
          s.strikePrice.toString().includes(search)
      );
    }

    // Sort by expiry, then by strike
    symbols.sort((a, b) => {
      if (a.expiryTimestamp !== b.expiryTimestamp) {
        return a.expiryTimestamp - b.expiryTimestamp;
      }
      return a.strikePrice - b.strikePrice;
    });

    return symbols;
  }, [parsedSymbols, selectedUnderlying, search]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left: Symbol List */}
      <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-1">
        <CardHeader className="py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-zinc-800 border-zinc-700 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="divide-y divide-zinc-800">
              {filteredSymbols.map((symbol) => {
                const ticker = tickers[symbol.symbol];
                const mark = markPrices[symbol.symbol];
                const isSelected = selectedSymbol === symbol.symbol;
                const daysToExpiry = getDaysToExpiry(symbol.expiryDate);

                return (
                  <button
                    key={symbol.symbol}
                    onClick={() => setSelectedSymbol(symbol.symbol)}
                    className={cn(
                      "w-full px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-blue-600/20 border-l-2 border-blue-500"
                        : "hover:bg-zinc-800/50 border-l-2 border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono text-zinc-200">
                        {symbol.strikePrice}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          symbol.side === "CALL"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        )}
                      >
                        {symbol.side === "CALL" ? "C" : "P"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        {formatExpiry(symbol.expiryDate)} ({daysToExpiry}d)
                      </span>
                      <span className="font-mono text-zinc-400">
                        {ticker?.lastPrice
                          ? formatNumber(ticker.lastPrice, 2)
                          : "-"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Middle: Chart & Order Book */}
      <div className="lg:col-span-2 space-y-4">
        {/* Chart */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-0 h-[350px]">
            <PriceChart />
          </CardContent>
        </Card>

        {/* Order Book & Trades */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <Tabs defaultValue="orderbook" className="h-[300px] flex flex-col">
            <TabsList className="w-full grid grid-cols-2 bg-zinc-800/50 rounded-none border-b border-zinc-800">
              <TabsTrigger
                value="orderbook"
                className="data-[state=active]:bg-zinc-700"
              >
                Order Book
              </TabsTrigger>
              <TabsTrigger
                value="trades"
                className="data-[state=active]:bg-zinc-700"
              >
                Trades
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orderbook" className="flex-1 mt-0 p-0">
              <OrderBook />
            </TabsContent>
            <TabsContent value="trades" className="flex-1 mt-0 p-0">
              <RecentTrades />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right: Contract Info & Order Form */}
      <div className="space-y-4">
        <ContractInfo />
        <OrderForm />
      </div>

      {/* Bottom: Positions & Orders */}
      <div className="lg:col-span-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <Tabs defaultValue="positions">
            <TabsList className="w-full justify-start bg-transparent border-b border-zinc-800 rounded-none px-4">
              <TabsTrigger
                value="positions"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
              >
                Open Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="positions" className="p-4">
              <Positions />
            </TabsContent>
            <TabsContent value="orders" className="p-4">
              <OpenOrders />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
