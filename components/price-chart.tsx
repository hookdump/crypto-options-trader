"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  ColorType,
  Time,
  CandlestickSeries,
} from "lightweight-charts";
import { useOptionsStore, usePreferencesStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KlineInterval, Kline } from "@/lib/types";

const INTERVALS: { value: KlineInterval; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
];

export function PriceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);

  const { selectedSymbol, klines } = useOptionsStore();
  const { chartInterval, setChartInterval } = usePreferencesStore();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      crosshair: {
        vertLine: {
          color: "#3f3f46",
          width: 1,
          style: 2,
          labelBackgroundColor: "#18181b",
        },
        horzLine: {
          color: "#3f3f46",
          width: 1,
          style: 2,
          labelBackgroundColor: "#18181b",
        },
      },
      rightPriceScale: {
        borderColor: "#27272a",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  // Update data when klines change
  useEffect(() => {
    if (!candleSeriesRef.current || klines.length === 0) return;

    const chartData: CandlestickData<Time>[] = klines.map((k: Kline) => ({
      time: (k.time || Math.floor(k.openTime / 1000)) as Time,
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
    }));

    candleSeriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [klines]);

  if (!selectedSymbol) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Select a contract to view chart
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800">
        <span className="text-sm font-medium text-zinc-300">
          {selectedSymbol}
        </span>
        <Select
          value={chartInterval}
          onValueChange={(v) => setChartInterval(v as KlineInterval)}
        >
          <SelectTrigger className="w-20 h-7 text-xs bg-zinc-800 border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {INTERVALS.map((interval) => (
              <SelectItem
                key={interval.value}
                value={interval.value}
                className="text-xs text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100"
              >
                {interval.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1 min-h-0" />
    </div>
  );
}
