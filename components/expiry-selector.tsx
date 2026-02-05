"use client";

import { useOptionsStore } from "@/lib/store";
import { formatExpiry, getDaysToExpiry } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ExpirySelector() {
  const { expiryDates, selectedExpiry, setSelectedExpiry } = useOptionsStore();

  if (expiryDates.length === 0) {
    return (
      <div className="text-sm text-zinc-500">No expiry dates available</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setSelectedExpiry(null)}
        className={cn(
          "px-3 py-1.5 text-sm rounded-md transition-colors",
          selectedExpiry === null
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        )}
      >
        All
      </button>
      {expiryDates.map((date) => {
        const daysToExpiry = getDaysToExpiry(date);
        const isSelected =
          selectedExpiry?.getTime() === date.getTime();

        return (
          <button
            key={date.getTime()}
            onClick={() => setSelectedExpiry(date)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2",
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            )}
          >
            {formatExpiry(date)}
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                daysToExpiry <= 1
                  ? "bg-red-500/20 text-red-400"
                  : daysToExpiry <= 7
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-zinc-700 text-zinc-400"
              )}
            >
              {daysToExpiry}d
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
