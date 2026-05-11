"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, CreditCard, Banknote, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { NetWorthBreakdown } from "@/types";

interface NetWorthCardProps {
  breakdown: NetWorthBreakdown;
  isConnected: boolean;
}

const rows = [
  {
    key: "fidelityBrokerage" as const,
    label: "Fidelity Brokerage",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    sign: 1,
  },
  {
    key: "fidelityDebit" as const,
    label: "Fidelity Cash Mgmt / Debit",
    icon: Wallet,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    sign: 1,
  },
  {
    key: "otherCash" as const,
    label: "Other Cash & Savings",
    icon: Banknote,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    sign: 1,
  },
  {
    key: "creditCardDebt" as const,
    label: "Credit Card Debt",
    icon: CreditCard,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    sign: -1,
  },
];

export function NetWorthCard({ breakdown, isConnected }: NetWorthCardProps) {
  const isPositive = breakdown.total >= 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white overflow-hidden relative">
      {/* decorative glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <PiggyBank className="w-5 h-5 text-violet-400" />
            </div>
            <CardTitle className="text-slate-300 font-medium text-base">Total Net Worth</CardTitle>
          </div>
          {isConnected ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">
              Live
            </Badge>
          ) : (
            <Badge className="bg-slate-700 text-slate-400 border-slate-600 border">
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <p
            className={`text-5xl font-bold tracking-tight ${
              isPositive ? "text-white" : "text-rose-400"
            }`}
          >
            {formatCurrency(breakdown.total)}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {isConnected
              ? "Synced from your linked accounts"
              : "Connect your accounts to see live data"}
          </p>
        </div>

        <Separator className="bg-slate-700 mb-4" />

        <div className="space-y-3">
          {rows.map(({ key, label, icon: Icon, color, bg, sign }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-md ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
              <span className={`text-sm font-semibold ${sign === -1 ? "text-rose-400" : "text-white"}`}>
                {sign === -1 ? "−" : "+"}{formatCurrency(breakdown[key])}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
