"use client";

import { useOptionsStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/format";

export function UnderlyingSelector() {
  const {
    underlyings,
    selectedUnderlying,
    setSelectedUnderlying,
    indexPrices,
  } = useOptionsStore();

  const currentPrice = indexPrices[selectedUnderlying];

  return (
    <div className="flex items-center gap-4">
      <Select value={selectedUnderlying} onValueChange={setSelectedUnderlying}>
        <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700">
          <SelectValue placeholder="Select asset" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {underlyings.map((underlying) => (
            <SelectItem
              key={underlying}
              value={underlying}
              className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
            >
              {underlying}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentPrice && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Index:</span>
          <span className="text-lg font-mono font-semibold text-zinc-100">
            ${formatNumber(currentPrice.indexPrice, 2)}
          </span>
        </div>
      )}
    </div>
  );
}
