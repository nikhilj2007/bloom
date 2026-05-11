"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, Banknote, GraduationCap, PiggyBank, CreditCard, BookOpen } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { NetWorthBreakdown } from "@/types";

interface NetWorthCardProps {
  breakdown: NetWorthBreakdown;
  isConnected: boolean;
}

const ASSET_ROWS = [
  { key: "fidelityBrokerage" as const, label: "Fidelity Brokerage", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  { key: "fidelityDebit" as const, label: "Fidelity Cash", icon: Wallet, color: "text-sky-500", bg: "bg-sky-50" },
  { key: "otherCash" as const, label: "Other Cash", icon: Banknote, color: "text-amber-500", bg: "bg-amber-50" },
  { key: "financialAid" as const, label: "Grants / Aid", icon: GraduationCap, color: "text-[#9b6de0]", bg: "bg-[#f3edff]" },
];

const LIABILITY_ROWS = [
  { key: "studentLoans" as const, label: "Student Loans", icon: BookOpen, color: "text-rose-500", bg: "bg-rose-50" },
  { key: "creditCardDebt" as const, label: "Credit Card", icon: CreditCard, color: "text-rose-500", bg: "bg-rose-50" },
];

// ─── Glow Score arc gauge (SVG stroke-dasharray semi-circle) ──────────────────

function GlowArc({ score }: { score: number }) {
  const minScore = 300, maxScore = 850;
  const pct = Math.max(0.01, Math.min(0.99, (score - minScore) / (maxScore - minScore)));

  const cx = 100, cy = 94, r = 72;
  const circumference = 2 * Math.PI * r;   // ≈ 452.4
  const semiCirc = circumference / 2;       // ≈ 226.2
  const fillLength = pct * semiCirc;

  return (
    <svg
      width="200"
      height="104"
      viewBox="0 0 200 104"
      className="overflow-visible"
      aria-label={`Glow Score ${score}`}
    >
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B792F0" />
          <stop offset="50%" stopColor="#D98BCC" />
          <stop offset="100%" stopColor="#FFB899" />
        </linearGradient>
        <linearGradient id="arcGradGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B792F0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFB899" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Soft glow halo behind the track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#arcGradGlow)"
        strokeWidth={22}
        strokeDasharray={`${semiCirc} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(180, ${cx}, ${cy})`}
      />

      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#EDE9F5"
        strokeWidth={11}
        strokeDasharray={`${semiCirc} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(180, ${cx}, ${cy})`}
      />

      {/* Filled arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth={11}
        strokeDasharray={`${fillLength} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(180, ${cx}, ${cy})`}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NetWorthCard({ breakdown, isConnected }: NetWorthCardProps) {
  const isPositive = breakdown.total >= 0;

  // Static "Glow Score" — a visual financial health indicator
  const glowScore = 742;

  return (
    <div className="rounded-2xl overflow-hidden relative card-glow h-full flex flex-col">
      {/* Pastel gradient header */}
      <div className="relative bg-gradient-to-br from-[#F3EDFF] via-[#FAE8F8] to-[#FFF0E8] px-5 pt-5 pb-3">
        {/* Ambient blob */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#B792F0]/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/70 shadow-sm">
              <PiggyBank className="w-4 h-4 text-[#9b6de0]" />
            </div>
            <span className="font-heading font-semibold text-sm text-[#6b4fa0]">Glow Score</span>
          </div>
          {isConnected ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px] font-semibold">
              Live
            </Badge>
          ) : (
            <Badge className="bg-white/60 text-[#9b6de0] border-[#D4B8F8] border text-[10px] font-semibold">
              Manual
            </Badge>
          )}
        </div>

        {/* Arc gauge */}
        <div className="flex flex-col items-center -mb-2 relative z-10">
          <GlowArc score={glowScore} />
          <div className="text-center -mt-12">
            <p className="text-currency text-4xl font-bold text-[#6b4fa0] leading-none">
              {glowScore}
            </p>
            <p className="text-[10px] text-[#9b6de0] font-semibold mt-0.5 uppercase tracking-wider">
              Very Good
            </p>
          </div>
          <div className="flex justify-between w-36 mt-3 text-[9px] text-[#B792F0]/70 font-medium">
            <span>300</span>
            <span>850</span>
          </div>
        </div>
      </div>

      {/* White body */}
      <div className="bg-white px-5 py-4 flex-1 space-y-4 border border-t-0 border-[#E8E0F5] rounded-b-2xl">
        {/* Net worth hero */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
            Total Net Worth
          </p>
          <p className={`text-currency text-3xl font-bold leading-none ${isPositive ? "text-foreground" : "text-rose-500"}`}>
            {formatCurrency(breakdown.total)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {isConnected ? "Fidelity + profile synced" : "Based on your profile"}
          </p>
        </div>

        {/* Assets vs Liabilities summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wide text-emerald-600 font-bold">Assets</p>
            <p className="text-currency text-sm font-bold text-emerald-600 mt-0.5">
              {formatCurrency(breakdown.totalAssets)}
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wide text-rose-500 font-bold">Liabilities</p>
            <p className="text-currency text-sm font-bold text-rose-500 mt-0.5">
              −{formatCurrency(breakdown.totalLiabilities)}
            </p>
          </div>
        </div>

        <Separator className="bg-[#F0EAF8]" />

        {/* Asset rows */}
        <div className="space-y-2">
          {ASSET_ROWS.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <span className="text-currency text-xs font-semibold text-foreground">
                +{formatCurrency(breakdown[key])}
              </span>
            </div>
          ))}
        </div>

        <Separator className="bg-[#F0EAF8]" />

        {/* Liability rows */}
        <div className="space-y-2">
          {LIABILITY_ROWS.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <span className="text-currency text-xs font-semibold text-rose-500">
                −{formatCurrency(breakdown[key])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
