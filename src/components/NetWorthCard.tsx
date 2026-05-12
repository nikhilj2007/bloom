"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Wallet,
  Banknote,
  GraduationCap,
  PiggyBank,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { NetWorthBreakdown } from "@/types";

interface NetWorthCardProps {
  breakdown: NetWorthBreakdown;
  isConnected: boolean;
  glowScore: number;
}

const ASSET_ROWS = [
  { key: "fidelityBrokerage" as const, label: "Fidelity Brokerage", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
  { key: "fidelityDebit"     as const, label: "Fidelity Cash",      icon: Wallet,     color: "text-sky-500",     bg: "bg-sky-50"     },
  { key: "otherCash"         as const, label: "Other Cash",         icon: Banknote,   color: "text-amber-500",   bg: "bg-amber-50"   },
  { key: "financialAid"      as const, label: "Grants / Aid",       icon: GraduationCap, color: "text-[#3E863E]", bg: "bg-[#f0f7f0]" },
];

const LIABILITY_ROWS = [
  { key: "studentLoans"   as const, label: "Student Loans", icon: BookOpen,   color: "text-rose-500", bg: "bg-rose-50" },
  { key: "creditCardDebt" as const, label: "Credit Card",   icon: CreditCard, color: "text-rose-500", bg: "bg-rose-50" },
];

// ─── Label & arc-color for 1-100 scale ───────────────────────────────────────

function glowLabel(score: number): string {
  if (score >= 85) return "Excellent ✦";
  if (score >= 70) return "Very Good";
  if (score >= 55) return "Good";
  if (score >= 35) return "Building";
  return "Starting";
}

// Returns Tailwind gradient classes for the filled arc segment
function glowArcColor(score: number): [string, string] {
  if (score >= 70) return ["#3E863E", "#2ECC71"];   // strong green
  if (score >= 50) return ["#4C994C", "#5aaa5a"];   // mid green
  return ["#7EC07E", "#5aaa5a"];                    // lighter green (low)
}

// ─── SVG semi-circle gauge (1-100) ───────────────────────────────────────────

function GlowArc({ score }: { score: number }) {
  const pct = Math.max(0.01, Math.min(0.99, (score - 1) / 99));
  const cx = 100, cy = 94, r = 72;
  const circumference = 2 * Math.PI * r;
  const semiCirc = circumference / 2;
  const fillLength = pct * semiCirc;
  const [colorA, colorB] = glowArcColor(score);

  return (
    <svg
      width="200"
      height="104"
      viewBox="0 0 200 104"
      className="overflow-visible"
      aria-label={`Glow Score ${score} out of 100`}
    >
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
        <linearGradient id="arcGradGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={colorA} stopOpacity="0.30" />
          <stop offset="100%" stopColor={colorB} stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Soft glow halo */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="url(#arcGradGlow)"
        strokeWidth={22}
        strokeDasharray={`${semiCirc} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(180, ${cx}, ${cy})`}
      />

      {/* Background track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#D8EDD8"
        strokeWidth={11}
        strokeDasharray={`${semiCirc} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(180, ${cx}, ${cy})`}
      />

      {/* Filled arc */}
      <circle
        cx={cx} cy={cy} r={r}
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

export function NetWorthCard({ breakdown, isConnected, glowScore }: NetWorthCardProps) {
  const isPositive = breakdown.total >= 0;

  return (
    <div className="rounded-2xl overflow-hidden relative card-glow h-full flex flex-col">
      {/* Green header */}
      <div className="relative bg-gradient-to-br from-[#f0f7f0] via-[#e8f5e8] to-[#f5faf5] px-5 pt-5 pb-3">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#3E863E]/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/80 shadow-sm">
              <PiggyBank className="w-4 h-4 text-[#3E863E]" />
            </div>
            <span className="font-heading font-semibold text-sm text-[#2d6a2d]">
              Glow Score
            </span>
          </div>
          {isConnected ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px] font-semibold">
              Live
            </Badge>
          ) : (
            <Badge className="bg-white/70 text-[#3E863E] border-[#A8D4A8] border text-[10px] font-semibold">
              Manual
            </Badge>
          )}
        </div>

        {/* Arc gauge */}
        <div className="flex flex-col items-center -mb-2 relative z-10">
          <GlowArc score={glowScore} />
          <div className="text-center -mt-12">
            <p className="text-currency text-4xl font-bold text-[#2d6a2d] leading-none">
              {glowScore}
            </p>
            <p className="text-[10px] text-[#3E863E] font-semibold mt-0.5 uppercase tracking-wider">
              {glowLabel(glowScore)}
            </p>
          </div>
          <div className="flex justify-between w-36 mt-3 text-[9px] text-[#3E863E]/60 font-medium">
            <span>1</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* White body */}
      <div className="bg-white px-5 py-4 flex-1 space-y-4 border border-t-0 border-[#D0E8D0] rounded-b-2xl">
        {/* Net worth hero */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
            Total Net Worth
          </p>
          <p
            className={`text-currency text-3xl font-bold leading-none ${
              isPositive ? "text-foreground" : "text-rose-500"
            }`}
          >
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

        <Separator className="bg-[#E0F0E0]" />

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

        <Separator className="bg-[#E0F0E0]" />

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
