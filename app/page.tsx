"use client";

import { useOptionsStore } from "@/lib/store";
import { ExpirySelector } from "@/components/expiry-selector";
import { OptionsChain } from "@/components/options-chain";
import { ContractInfo } from "@/components/contract-info";
import { OrderBook } from "@/components/order-book";
import { PriceChart } from "@/components/price-chart";
import { RecentTrades } from "@/components/recent-trades";
import { OrderForm } from "@/components/order-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isLoading, error, selectedSymbol } = useOptionsStore();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-red-400 text-lg mb-2">Error loading data</div>
        <div className="text-zinc-500 text-sm">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <div className="text-zinc-400">Loading options data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Expiry Selector */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Expiration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ExpirySelector />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Options Chain - Takes 2 columns on xl */}
        <div className="xl:col-span-2">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Options Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <OptionsChain />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Contract Details */}
        <div className="space-y-4">
          {/* Contract Info */}
          <ContractInfo />

          {/* Order Form */}
          <OrderForm />
        </div>
      </div>

      {/* Bottom Panel - Chart, Order Book, Trades */}
      {selectedSymbol && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Price Chart */}
          <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-0 h-[400px]">
              <PriceChart />
            </CardContent>
          </Card>

          {/* Order Book & Trades */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <Tabs defaultValue="orderbook" className="h-[400px] flex flex-col">
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
      )}
    </div>
  );
}
