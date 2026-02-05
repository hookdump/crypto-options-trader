import { format, formatDistanceToNow } from "date-fns";

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number | string,
  decimals: number = 2,
  currency: string = "USD"
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(
  value: number | string,
  decimals: number = 2
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format a number as compact (1K, 1M, etc.)
 */
export function formatCompact(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number | string,
  decimals: number = 2
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";

  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format a date
 */
export function formatDate(
  date: Date | number,
  formatStr: string = "MMM d, yyyy"
): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date as relative time
 */
export function formatRelative(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format expiry date for display
 */
export function formatExpiry(date: Date): string {
  return format(date, "MMM d");
}

/**
 * Format expiry date with year
 */
export function formatExpiryFull(date: Date): string {
  return format(date, "MMM d, yyyy");
}

/**
 * Format strike price for display
 */
export function formatStrike(strike: number): string {
  if (strike >= 1000) {
    return formatNumber(strike, 0);
  }
  return formatNumber(strike, 2);
}

/**
 * Format IV (Implied Volatility)
 */
export function formatIV(iv: number | string): string {
  const num = typeof iv === "string" ? parseFloat(iv) : iv;
  if (isNaN(num)) return "-";
  return `${(num * 100).toFixed(1)}%`;
}

/**
 * Format Greek values
 */
export function formatGreek(value: number | string, decimals: number = 4): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toFixed(decimals);
}

/**
 * Format price change with color class
 */
export function formatPriceChange(
  change: number | string
): { text: string; className: string } {
  const num = typeof change === "string" ? parseFloat(change) : change;
  if (isNaN(num)) return { text: "-", className: "" };

  const sign = num > 0 ? "+" : "";
  const className = num > 0 ? "text-green-500" : num < 0 ? "text-red-500" : "";

  return {
    text: `${sign}${formatNumber(num, 2)}`,
    className,
  };
}

/**
 * Format percent change with color class
 */
export function formatPercentChange(
  change: number | string
): { text: string; className: string } {
  const num = typeof change === "string" ? parseFloat(change) : change;
  if (isNaN(num)) return { text: "-", className: "" };

  const sign = num > 0 ? "+" : "";
  const className = num > 0 ? "text-green-500" : num < 0 ? "text-red-500" : "";

  return {
    text: `${sign}${num.toFixed(2)}%`,
    className,
  };
}

/**
 * Parse option symbol string
 * Format: BTC-241227-100000-C
 */
export function parseSymbol(symbol: string): {
  underlying: string;
  expiry: string;
  strike: string;
  side: "C" | "P";
} | null {
  const parts = symbol.split("-");
  if (parts.length !== 4) return null;

  return {
    underlying: parts[0],
    expiry: parts[1],
    strike: parts[2],
    side: parts[3] as "C" | "P",
  };
}

/**
 * Get days until expiry
 */
export function getDaysToExpiry(expiryDate: Date): number {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format time for trades
 */
export function formatTradeTime(timestamp: number): string {
  return format(new Date(timestamp), "HH:mm:ss");
}
