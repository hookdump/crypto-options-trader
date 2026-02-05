"use client";

import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import { Positions } from "@/components/positions";
import { OpenOrders } from "@/components/open-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function PositionsPage() {
  const { accountInfo, positions, openOrders } = useOptionsStore();
  const { apiConfigured } = usePreferencesStore();

  // Calculate totals
  const totalPnl = positions.reduce(
    (sum, p) => sum + parseFloat(p.unrealizedPNL || "0"),
    0
  );

  const balance = accountInfo?.asset?.[0];
  const equity = balance ? parseFloat(balance.equity || "0") : 0;
  const available = balance ? parseFloat(balance.available || "0") : 0;
  const margin = equity - available;

  // Portfolio Greeks
  const totalDelta =
    accountInfo?.greek?.reduce(
      (sum, g) => sum + parseFloat(g.delta || "0"),
      0
    ) || 0;
  const totalGamma =
    accountInfo?.greek?.reduce(
      (sum, g) => sum + parseFloat(g.gamma || "0"),
      0
    ) || 0;
  const totalTheta =
    accountInfo?.greek?.reduce(
      (sum, g) => sum + parseFloat(g.theta || "0"),
      0
    ) || 0;
  const totalVega =
    accountInfo?.greek?.reduce((sum, g) => sum + parseFloat(g.vega || "0"), 0) ||
    0;

  if (!apiConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Wallet className="h-12 w-12 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">
          API Keys Required
        </h2>
        <p className="text-zinc-500 max-w-md">
          Configure your Binance API keys in settings to view positions, orders,
          and account information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Equity */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Equity</p>
                <p className="text-2xl font-semibold font-mono">
                  ${formatNumber(equity, 2)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Available */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Available</p>
                <p className="text-2xl font-semibold font-mono">
                  ${formatNumber(available, 2)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Margin Used */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Margin Used</p>
                <p className="text-2xl font-semibold font-mono">
                  ${formatNumber(margin, 2)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 text-xs font-bold">
                  {equity > 0 ? ((margin / equity) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unrealized PnL */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Unrealized P&L</p>
                <p
                  className={cn(
                    "text-2xl font-semibold font-mono",
                    totalPnl > 0
                      ? "text-green-400"
                      : totalPnl < 0
                      ? "text-red-400"
                      : ""
                  )}
                >
                  {totalPnl >= 0 ? "+" : ""}${formatNumber(totalPnl, 2)}
                </p>
              </div>
              {totalPnl >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Greeks */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="py-4">
          <CardTitle className="text-base">Portfolio Greeks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Delta</p>
              <p className="text-xl font-mono">{formatNumber(totalDelta, 4)}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Gamma</p>
              <p className="text-xl font-mono">{formatNumber(totalGamma, 6)}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Theta</p>
              <p
                className={cn(
                  "text-xl font-mono",
                  totalTheta < 0 ? "text-red-400" : "text-green-400"
                )}
              >
                {formatNumber(totalTheta, 4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Vega</p>
              <p className="text-xl font-mono">{formatNumber(totalVega, 4)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions & Orders */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <Tabs defaultValue="positions">
          <TabsList className="w-full justify-start bg-transparent border-b border-zinc-800 rounded-none px-4">
            <TabsTrigger
              value="positions"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Positions ({positions.length})
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
            >
              Open Orders ({openOrders.length})
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
  );
}
