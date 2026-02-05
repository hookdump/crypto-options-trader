"use client";

import { usePreferencesStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Key, BarChart2, Palette, Info, ExternalLink } from "lucide-react";

const INTERVALS = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "1d", label: "1 day" },
];

const DEPTH_OPTIONS = [10, 20, 50, 100];

export default function SettingsPage() {
  const {
    apiConfigured,
    chartInterval,
    setChartInterval,
    orderBookDepth,
    setOrderBookDepth,
    defaultUnderlying,
    setDefaultUnderlying,
  } = usePreferencesStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* API Configuration */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Connect your Binance API keys to enable trading
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Status</span>
            <Badge
              className={cn(
                apiConfigured
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              )}
            >
              {apiConfigured ? "Connected" : "Not Configured"}
            </Badge>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              API keys are configured via environment variables for security:
            </p>
            <div className="bg-zinc-800 rounded-md p-3 font-mono text-sm">
              <p className="text-zinc-500"># .env.local</p>
              <p className="text-zinc-300">BINANCE_API_KEY=your_api_key</p>
              <p className="text-zinc-300">BINANCE_API_SECRET=your_secret</p>
            </div>
            <p className="text-xs text-zinc-500">
              Never share your API secret. Enable only trading permissions, no
              withdrawal.
            </p>
          </div>

          <a
            href="https://www.binance.com/en/my/settings/api-management"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Create API key on Binance
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Chart Settings */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Chart Settings</CardTitle>
              <CardDescription>
                Customize chart display preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Default Interval</p>
              <p className="text-xs text-zinc-500">
                Default candlestick interval
              </p>
            </div>
            <Select value={chartInterval} onValueChange={setChartInterval}>
              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {INTERVALS.map((interval) => (
                  <SelectItem
                    key={interval.value}
                    value={interval.value}
                    className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Order Book Depth</p>
              <p className="text-xs text-zinc-500">
                Number of price levels to display
              </p>
            </div>
            <Select
              value={orderBookDepth.toString()}
              onValueChange={(v) => setOrderBookDepth(parseInt(v))}
            >
              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {DEPTH_OPTIONS.map((depth) => (
                  <SelectItem
                    key={depth}
                    value={depth.toString()}
                    className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {depth} levels
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize the user interface
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Default Underlying</p>
              <p className="text-xs text-zinc-500">
                Default asset to load on startup
              </p>
            </div>
            <Select
              value={defaultUnderlying}
              onValueChange={setDefaultUnderlying}
            >
              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem
                  value="BTCUSDT"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  BTC
                </SelectItem>
                <SelectItem
                  value="ETHUSDT"
                  className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
                >
                  ETH
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>About</CardTitle>
              <CardDescription>
                Crypto Options Trader v1.0.0
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          <p>
            Professional-grade crypto options trading platform powered by
            Binance European Options API.
          </p>
          <p>
            Built with Next.js, TypeScript, and TradingView Lightweight Charts.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="https://developers.binance.com/docs/derivatives/options-trading/general-info"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              API Docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
