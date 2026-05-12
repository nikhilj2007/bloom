"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Types & seed data ────────────────────────────────────────────────────────

interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;   // absolute $ change from open
  pct: number;      // % change from open
  flash: "up" | "down" | null;
}

const SEED_PRICES: Record<string, { name: string; open: number }> = {
  VOO:  { name: "Vanguard S&P 500",   open: 512.47 },
  SPY:  { name: "SPDR S&P 500",        open: 523.18 },
  AAPL: { name: "Apple Inc.",           open: 214.32 },
  AMZN: { name: "Amazon.com",           open: 194.76 },
};

function seedStocks(): Stock[] {
  return Object.entries(SEED_PRICES).map(([ticker, { name, open }]) => ({
    ticker,
    name,
    price: open,
    change: 0,
    pct: 0,
    flash: null,
  }));
}

// Random fluctuation between -0.2% and +0.5%
function fluctuate(price: number): number {
  const delta = price * ((-0.002 + Math.random() * 0.007));
  return Math.round((price + delta) * 100) / 100;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketPulseTicker() {
  const [stocks, setStocks] = useState<Stock[]>(seedStocks);
  const openPrices = useRef<Record<string, number>>(
    Object.fromEntries(Object.entries(SEED_PRICES).map(([t, v]) => [t, v.open]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const newPrice = fluctuate(s.price);
          const open     = openPrices.current[s.ticker];
          const change   = Math.round((newPrice - open) * 100) / 100;
          const pct      = Math.round((change / open) * 10000) / 100;
          const flash    = newPrice > s.price ? "up" : "down";
          return { ...s, price: newPrice, change, pct, flash };
        })
      );

      // Clear flash after 600 ms
      setTimeout(() => {
        setStocks((prev) => prev.map((s) => ({ ...s, flash: null })));
      }, 600);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#f0f7f0]">
            <Activity className="w-4 h-4 text-[#3E863E]" />
          </div>
          <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>
            Market Pulse
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-semibold">
            Live
          </Badge>
        </div>
      </div>

      {/* Ticker rows */}
      <div className="space-y-2">
        {stocks.map((s) => {
          const isUp  = s.pct >= 0;
          const flash = s.flash;

          return (
            <div
              key={s.ticker}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-colors duration-300 ${
                flash === "up"
                  ? "bg-emerald-50 border-emerald-200"
                  : flash === "down"
                  ? "bg-rose-50 border-rose-200"
                  : "bg-[#f9fafb] border-[#E8F0E8]"
              }`}
            >
              {/* Left: ticker + name */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                    flash === "up"
                      ? "bg-emerald-100 text-emerald-700"
                      : flash === "down"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-[#f0f7f0] text-[#2d6a2d]"
                  }`}
                >
                  {s.ticker.slice(0, 3)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{s.ticker}</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    {s.name}
                  </p>
                </div>
              </div>

              {/* Right: price + change */}
              <div className="text-right">
                <p
                  className={`text-sm font-bold transition-colors duration-300 ${
                    flash === "up"
                      ? "text-emerald-600"
                      : flash === "down"
                      ? "text-rose-500"
                      : "text-foreground"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ${s.price.toFixed(2)}
                </p>
                <div
                  className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold transition-colors duration-300 ${
                    isUp ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isUp ? "+" : ""}
                  {s.pct.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Simulated prices · updates every 3s · not real market data
      </p>
    </div>
  );
}
