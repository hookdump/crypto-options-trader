"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import { UnderlyingSelector } from "./underlying-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Menu,
  Settings,
  TrendingUp,
  LayoutGrid,
  FileText,
  Wallet,
  Circle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Chain", icon: LayoutGrid },
  { href: "/trade", label: "Trade", icon: TrendingUp },
  { href: "/positions", label: "Positions", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const { wsConnected, accountInfo } = useOptionsStore();
  const { apiConfigured } = usePreferencesStore();

  const balance = accountInfo?.asset?.[0];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Logo + Asset Selector */}
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-zinc-900 border-zinc-800"
            >
              <SheetHeader>
                <SheetTitle className="text-zinc-100">
                  Crypto Options
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline font-semibold text-zinc-100">
              Crypto Options
            </span>
          </Link>

          {/* Asset Selector */}
          <div className="hidden md:block">
            <UnderlyingSelector />
          </div>
        </div>

        {/* Center: Navigation (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Status + Balance */}
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <Circle
              className={cn(
                "h-2 w-2 fill-current",
                wsConnected ? "text-green-500" : "text-red-500"
              )}
            />
            <span className="hidden sm:inline text-xs text-zinc-500">
              {wsConnected ? "Live" : "Disconnected"}
            </span>
          </div>

          {/* Balance */}
          {apiConfigured && balance && (
            <div className="hidden sm:flex items-center gap-2">
              <Wallet className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-mono text-zinc-300">
                {parseFloat(balance.available).toFixed(2)} {balance.asset}
              </span>
            </div>
          )}

          {/* API Status */}
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              apiConfigured
                ? "bg-green-500/20 text-green-400"
                : "bg-zinc-700 text-zinc-400"
            )}
          >
            {apiConfigured ? "API Active" : "Read Only"}
          </Badge>
        </div>
      </div>

      {/* Mobile Asset Selector */}
      <div className="md:hidden px-4 pb-2">
        <UnderlyingSelector />
      </div>
    </header>
  );
}
