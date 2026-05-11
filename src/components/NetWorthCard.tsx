"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { key: "fidelityBrokerage" as const, label: "Fidelity Brokerage", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "fidelityDebit" as const, label: "Fidelity Cash / Debit", icon: Wallet, color: "text-sky-400", bg: "bg-sky-500/10" },
  { key: "otherCash" as const, label: "Other Cash & Savings", icon: Banknote, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "financialAid" as const, label: "Annual Grants / Aid", icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10" },
];

const LIABILITY_ROWS = [
  { key: "studentLoans" as const, label: "Student Loans", icon: BookOpen, color: "text-rose-400", bg: "bg-rose-500/10" },
  { key: "creditCardDebt" as const, label: "Credit Card Debt", icon: CreditCard, color: "text-rose-400", bg: "bg-rose-500/10" },
];

export function NetWorthCard({ breakdown, isConnected }: NetWorthCardProps) {
  const isPositive = breakdown.total >= 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white overflow-hidden relative">
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <PiggyBank className="w-5 h-5 text-violet-400" />
            </div>
            <CardTitle className="text-slate-300 font-medium text-base">Net Worth</CardTitle>
          </div>
          {isConnected ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">Live</Badge>
          ) : (
            <Badge className="bg-slate-700 text-slate-400 border-slate-600 border">Manual</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hero number */}
        <div>
          <p className={`text-5xl font-bold tracking-tight ${isPositive ? "text-white" : "text-rose-400"}`}>
            {formatCurrency(breakdown.total)}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {isConnected ? "Fidelity + profile data synced" : "Based on your financial profile"}
          </p>
        </div>

        {/* Assets vs Liabilities summary bar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-emerald-400 font-semibold">Total Assets</p>
            <p className="text-lg font-bold text-emerald-300">{formatCurrency(breakdown.totalAssets)}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-rose-400 font-semibold">Total Liabilities</p>
            <p className="text-lg font-bold text-rose-300">−{formatCurrency(breakdown.totalLiabilities)}</p>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Asset rows */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-emerald-400 font-semibold mb-2">Assets</p>
          <div className="space-y-2">
            {ASSET_ROWS.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <span className="text-xs text-slate-300">{label}</span>
                </div>
                <span className="text-xs font-semibold text-white">+{formatCurrency(breakdown[key])}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Liability rows */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-rose-400 font-semibold mb-2">Liabilities</p>
          <div className="space-y-2">
            {LIABILITY_ROWS.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <span className="text-xs text-slate-300">{label}</span>
                </div>
                <span className="text-xs font-semibold text-rose-400">−{formatCurrency(breakdown[key])}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
