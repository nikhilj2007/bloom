"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { AppHeader, MobileBottomDock } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  TrendingUp,
  Building2,
  PiggyBank,
  Zap,
  Newspaper,
  Lightbulb,
  ArrowLeft,
  Trophy,
  CircleDollarSign,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const NET_WORTH_GOAL = 100_000;

interface Asset {
  id: string;
  name: string;
  description: string;
  cost: number;
  yieldPerSec: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  count: number;
}

const INITIAL_ASSETS: Asset[] = [
  {
    id: "hys",
    name: "High-Yield Savings",
    description: "Park your cash and earn interest automatically.",
    cost: 250,
    yieldPerSec: 1,
    icon: PiggyBank,
    color: "text-sky-600",
    bg: "bg-sky-50",
    count: 0,
  },
  {
    id: "etf",
    name: "Index Fund ETF",
    description: "Diversified market exposure — the Bogle way.",
    cost: 1_200,
    yieldPerSec: 8,
    icon: TrendingUp,
    color: "text-[#3E863E]",
    bg: "bg-[#f0f7f0]",
    count: 0,
  },
  {
    id: "rental",
    name: "Rental Property",
    description: "Real estate delivers the best passive cashflow.",
    cost: 10_000,
    yieldPerSec: 95,
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    count: 0,
  },
];

const MARKET_NEWS = [
  "🟢 Fed holds rates — growth stocks rally",
  "📈 S&P 500 hits new all-time high",
  "💡 Index funds beat 90% of active managers in 2024",
  "🏠 Rental vacancy rates hit 10-year low",
  "🌱 ESG ETF inflows surge 40% YoY",
  "📊 Warren Buffett doubles down on long-term investing",
  "🔔 High-yield savings now at 5.2% APY",
  "🚀 Compound interest: the 8th wonder of the world",
];

const FINANCIAL_TIPS = [
  { threshold: 0,      tip: "Tip: Every $1 you save is $1 working for you. Start clicking!" },
  { threshold: 50,     tip: "Tip: Passive income means making money while you sleep!" },
  { threshold: 250,    tip: "Tip: A High-Yield Savings account beats a regular savings account by 10x." },
  { threshold: 1_000,  tip: "Tip: Index funds like VOO & SPY give you the whole market at low cost." },
  { threshold: 5_000,  tip: "Tip: The 4% rule — retire when your investments are 25x your annual expenses." },
  { threshold: 10_000, tip: "Tip: Real estate provides cash flow AND appreciation — a double win." },
  { threshold: 50_000, tip: "Tip: You're halfway to $100K! Diversification is protecting your gains." },
  { threshold: 90_000, tip: "🎉 Almost there! Financial freedom is about choices, not just money." },
];

function getActiveTip(netWorth: number): string {
  let tip = FINANCIAL_TIPS[0].tip;
  for (const entry of FINANCIAL_TIPS) {
    if (netWorth >= entry.threshold) tip = entry.tip;
  }
  return tip;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 space-y-2">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className="text-xl font-bold leading-none"
        style={{ fontFamily: "var(--font-mono)", color: "#1a2332" }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClickerGame() {
  const [cash, setCash]                   = useState(0);
  const [netWorth, setNetWorth]           = useState(0);
  const [assets, setAssets]              = useState<Asset[]>(INITIAL_ASSETS);
  const [clickAnim, setClickAnim]         = useState(false);
  const [newsIdx, setNewsIdx]            = useState(0);
  const [won, setWon]                    = useState(false);

  // Derived passive income from all assets
  const passiveIncome = assets.reduce((sum, a) => sum + a.yieldPerSec * a.count, 0);

  // Passive income tick — every second
  useEffect(() => {
    if (passiveIncome === 0) return;
    const id = setInterval(() => {
      setCash((c) => c + passiveIncome);
      setNetWorth((nw) => {
        const next = nw + passiveIncome;
        if (next >= NET_WORTH_GOAL) setWon(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [passiveIncome]);

  // Rotate news ticker every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setNewsIdx((i) => (i + 1) % MARKET_NEWS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleWork = useCallback(() => {
    setCash((c) => c + 1);
    setNetWorth((nw) => {
      const next = nw + 1;
      if (next >= NET_WORTH_GOAL) setWon(true);
      return next;
    });
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 150);
  }, []);

  const handleBuy = useCallback((assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        if (cash < a.cost) return a;
        setCash((c) => c - a.cost);
        return { ...a, count: a.count + 1, cost: Math.round(a.cost * 1.15) };
      })
    );
  }, [cash]);

  const progressPct = Math.min(100, (netWorth / NET_WORTH_GOAL) * 100);
  const tip = getActiveTip(netWorth);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AppHeader />
      <MobileBottomDock />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-10 pt-8 space-y-6">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center shadow-md">
              <CircleDollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-jakarta)", color: "#1a2332" }}
              >
                💰 Financial Freedom Clicker
              </h1>
              <p className="text-xs text-muted-foreground">
                Build your net worth to{" "}
                <strong className="text-[#3E863E]">{fmt(NET_WORTH_GOAL)}</strong> to win.
              </p>
            </div>
          </div>
          <Link href="/arcade">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-[#2d6a2d] px-3.5 py-2 rounded-xl border border-[#A8D4A8] bg-[#f0f7f0] hover:bg-[#e8f5e8] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Arcade
            </button>
          </Link>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span style={{ color: "#1a2332" }}>Net Worth Progress</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "#3E863E" }}>
              {fmt(netWorth)} / {fmt(NET_WORTH_GOAL)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-[#E0F0E0] overflow-hidden">
            <div
              className="h-full rounded-full gradient-brand transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>$0</span>
            <span className="text-[#3E863E] font-semibold">{progressPct.toFixed(1)}% complete</span>
            <span>{fmt(NET_WORTH_GOAL)}</span>
          </div>
        </div>

        {/* ── Win banner ────────────────────────────────────────────── */}
        {won && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 text-center text-white space-y-2 shadow-xl">
            <Trophy className="w-10 h-10 mx-auto" />
            <h2 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-jakarta)" }}>
              Financial Freedom Achieved!
            </h2>
            <p className="text-sm opacity-90">
              You built a {fmt(netWorth)} net worth. The power of passive income is real.
            </p>
          </div>
        )}

        {/* ── 3-column grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Column 1: The Bank ──────────────────────────────────── */}
          <div className="space-y-4">
            <h2
              className="text-sm font-bold uppercase tracking-wider text-[#2d6a2d]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              The Bank
            </h2>

            {/* Stats */}
            <StatCard
              label="Net Worth"
              value={fmt(netWorth)}
              icon={TrendingUp}
              color="text-[#3E863E]"
              bg="bg-[#f0f7f0]"
            />
            <StatCard
              label="Cash on Hand"
              value={fmt(cash)}
              icon={Banknote}
              color="text-sky-600"
              bg="bg-sky-50"
            />
            <StatCard
              label="Passive Income / sec"
              value={passiveIncome > 0 ? `+${fmt(passiveIncome)}` : "$0.00"}
              icon={Zap}
              color="text-amber-600"
              bg="bg-amber-50"
            />

            {/* Work button */}
            <button
              onClick={handleWork}
              className={`w-full py-5 rounded-2xl gradient-brand text-white font-extrabold text-xl shadow-lg flex items-center justify-center gap-3 select-none transition-transform duration-75 ${
                clickAnim ? "scale-95 opacity-90" : "hover:opacity-90 active:scale-95"
              }`}
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <Banknote className="w-7 h-7" />
              WORK FOR $1
            </button>
            <p className="text-[10px] text-center text-muted-foreground">
              Click to earn cash manually. Buy assets for passive income!
            </p>
          </div>

          {/* ── Column 2: Assets Shop ───────────────────────────────── */}
          <div className="space-y-4">
            <h2
              className="text-sm font-bold uppercase tracking-wider text-[#2d6a2d]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Assets Shop
            </h2>

            <div className="space-y-3">
              {assets.map((asset) => {
                const canAfford = cash >= asset.cost;
                const Icon      = asset.icon;

                return (
                  <div
                    key={asset.id}
                    className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${asset.bg} shrink-0`}>
                          <Icon className={`w-5 h-5 ${asset.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{asset.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                            {asset.description}
                          </p>
                        </div>
                      </div>
                      {asset.count > 0 && (
                        <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-bold shrink-0">
                          ×{asset.count}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">
                          Cost:{" "}
                          <span
                            className="font-bold text-foreground"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {fmt(asset.cost)}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Yield:{" "}
                          <span className="font-bold text-[#3E863E]">
                            +{fmt(asset.yieldPerSec)}/sec
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuy(asset.id)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          canAfford
                            ? "gradient-brand text-white hover:opacity-90 shadow-sm active:scale-95"
                            : "bg-[#f0f7f0] text-[#aac8aa] cursor-not-allowed border border-[#D0E8D0]"
                        }`}
                      >
                        {canAfford ? "Buy" : `Need ${fmt(asset.cost - cash)} more`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Asset roster summary */}
            {passiveIncome > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] border border-[#A8D4A8] p-4 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a2d]">
                  Portfolio Income
                </p>
                {assets
                  .filter((a) => a.count > 0)
                  .map((a) => (
                    <div key={a.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {a.count}× {a.name}
                      </span>
                      <span
                        className="font-bold text-[#3E863E]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        +{fmt(a.yieldPerSec * a.count)}/sec
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-[#A8D4A8]">
                  <span className="text-[#2d6a2d]">Total Passive</span>
                  <span
                    className="text-[#2d6a2d]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    +{fmt(passiveIncome)}/sec
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Column 3: News & Tips ───────────────────────────────── */}
          <div className="space-y-4">
            <h2
              className="text-sm font-bold uppercase tracking-wider text-[#2d6a2d]"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              News & Insights
            </h2>

            {/* Market news ticker */}
            <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 space-y-3 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#f0f7f0]">
                  <Newspaper className="w-3.5 h-3.5 text-[#3E863E]" />
                </div>
                <p className="text-xs font-semibold">Market News</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-auto" />
              </div>
              <div className="relative h-10 overflow-hidden">
                <p
                  key={newsIdx}
                  className="text-xs text-foreground leading-snug font-medium animate-[fadeSlide_0.5s_ease-in-out]"
                  style={{ animation: "fadeSlide 0.5s ease-in-out" }}
                >
                  {MARKET_NEWS[newsIdx]}
                </p>
              </div>
              <div className="flex gap-1 mt-1">
                {MARKET_NEWS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i === newsIdx ? "bg-[#3E863E]" : "bg-[#E0F0E0]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Financial tips */}
            <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs font-semibold">Financial Tips</p>
              </div>
              <p
                key={tip}
                className="text-xs text-foreground leading-relaxed"
              >
                {tip}
              </p>
            </div>

            {/* Mini stats */}
            <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-4 space-y-3">
              <p className="text-xs font-semibold">Game Stats</p>
              <div className="space-y-2">
                {[
                  { label: "Assets owned", value: assets.reduce((s, a) => s + a.count, 0).toString() },
                  { label: "Income/min",   value: fmt(passiveIncome * 60) },
                  { label: "Income/hr",    value: fmt(passiveIncome * 3600) },
                  { label: "To goal",      value: fmt(Math.max(0, NET_WORTH_GOAL - netWorth)) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span
                      className="font-bold text-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real lesson callout */}
            <div className="rounded-2xl bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] border border-[#A8D4A8] p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a2d]">
                Real Life Lesson
              </p>
              <p className="text-[11px] text-[#2d6a2d] leading-relaxed">
                This game mirrors reality: <strong>clicking = trading your time for money</strong>.
                Assets = investments that earn <strong>while you sleep</strong>. The sooner you buy
                assets, the faster you reach financial freedom.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Inline animation keyframe */}
      <style jsx global>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}
