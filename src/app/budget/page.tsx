"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { AppHeader, MobileBottomDock } from "@/components/AppHeader";
import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Lock,
  Wallet,
  Link2,
} from "lucide-react";
import { formatCurrency, calcCCTotalInterest } from "@/lib/utils";
import { useProfile } from "@/context/ProfileContext";
import { usePlaid } from "@/context/PlaidContext";
import type { CategorySummary } from "@/types";

// ── Suggested spending limits as a fraction of monthly income ─────────────────
// Keyed by Plaid primary category
const CATEGORY_CONFIG: Record<
  string,
  { pctLimit: number; barColor: string }
> = {
  FOOD_AND_DRINK:       { pctLimit: 0.30, barColor: "bg-amber-500"   },
  GENERAL_MERCHANDISE:  { pctLimit: 0.20, barColor: "bg-blue-500"    },
  TRANSPORTATION:       { pctLimit: 0.15, barColor: "bg-sky-500"     },
  ENTERTAINMENT:        { pctLimit: 0.10, barColor: "bg-purple-500"  },
  PERSONAL_CARE:        { pctLimit: 0.05, barColor: "bg-pink-500"    },
  RENT_AND_UTILITIES:   { pctLimit: 0.50, barColor: "bg-emerald-500" },
  EDUCATION:            { pctLimit: 0.15, barColor: "bg-indigo-500"  },
  LOAN_PAYMENTS:        { pctLimit: 0.20, barColor: "bg-rose-500"    },
};
const DEFAULT_BAR_COLOR = "bg-[#3E863E]";
const DEFAULT_PCT_LIMIT = 0.15;

function getConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? {
    pctLimit: DEFAULT_PCT_LIMIT,
    barColor: DEFAULT_BAR_COLOR,
  };
}

// ── Cash Flow header ──────────────────────────────────────────────────────────

function CashFlowHeader({
  monthlyIncome,
  totalSpent,
}: {
  monthlyIncome: number;
  totalSpent: number;
}) {
  const remaining = monthlyIncome - totalSpent;
  const isPositive = remaining >= 0;
  const usedPct = monthlyIncome > 0 ? Math.min((totalSpent / monthlyIncome) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-base">Cash Flow — This Month</h2>
        <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-semibold">
          Live · Plaid
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Income</p>
          <p className="text-currency text-xl font-bold text-emerald-700">
            {monthlyIncome > 0 ? formatCurrency(monthlyIncome) : "—"}
          </p>
          {monthlyIncome === 0 && (
            <p className="text-[10px] text-muted-foreground">Set in profile</p>
          )}
        </div>

        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Spent</p>
          <p className="text-currency text-xl font-bold text-rose-600">{formatCurrency(totalSpent)}</p>
        </div>

        <div className={`rounded-xl p-4 text-center space-y-1 ${isPositive ? "bg-[#f0f7f0] border border-[#A8D4A8]" : "bg-rose-50 border border-rose-100"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isPositive ? "text-[#2d6a2d]" : "text-rose-600"}`}>
            Remaining
          </p>
          <p className={`text-currency text-xl font-bold flex items-center justify-center gap-1 ${isPositive ? "text-[#2d6a2d]" : "text-rose-600"}`}>
            {isPositive
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />
            }
            {monthlyIncome > 0 ? formatCurrency(Math.abs(remaining)) : "—"}
          </p>
          {monthlyIncome > 0 && (
            <p className="text-[10px] text-muted-foreground">{isPositive ? "under budget" : "over budget"}</p>
          )}
        </div>
      </div>

      {monthlyIncome > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Monthly budget used</span>
            <span className="font-semibold text-foreground">{usedPct.toFixed(0)}%</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-[#E0F0E0] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${usedPct > 90 ? "bg-rose-500" : usedPct > 70 ? "bg-amber-500" : "gradient-brand"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category breakdown card ───────────────────────────────────────────────────

function CategoryBreakdown({
  summary,
  monthlyIncome,
}: {
  summary: CategorySummary[];
  monthlyIncome: number;
}) {
  if (!summary.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-base">Spending by Category</h2>
        <p className="text-[10px] text-muted-foreground">Limit = suggested % of your income</p>
      </div>

      <div className="space-y-4">
        {summary.map(({ category, label, total, transactionCount }) => {
          const { pctLimit, barColor } = getConfig(category);
          const limit = monthlyIncome > 0 ? monthlyIncome * pctLimit : 0;
          const pctUsed = limit > 0 ? Math.min((total / limit) * 100, 110) : 0;
          const isOverBudget = limit > 0 && total > limit;

          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  {isOverBudget && (
                    <Badge className="bg-rose-50 text-rose-600 border-rose-100 border text-[9px] font-semibold py-0">
                      Over limit
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-currency text-xs font-semibold ${isOverBudget ? "text-rose-600" : "text-foreground"}`}>
                    {formatCurrency(total)}
                  </span>
                  {limit > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      / {formatCurrency(limit)} limit
                    </span>
                  )}
                </div>
              </div>

              <div className="relative h-2.5 w-full rounded-full bg-[#E8ECEF] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverBudget ? "bg-rose-500" : barColor
                  }`}
                  style={{ width: `${pctUsed}%` }}
                />
              </div>

              <p className="text-[10px] text-muted-foreground">
                {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
                {limit > 0 && (
                  <span>
                    {" · "}
                    {isOverBudget
                      ? `${formatCurrency(total - limit)} over your ${(pctLimit * 100).toFixed(0)}% limit`
                      : `${formatCurrency(limit - total)} remaining`}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Debt Warning widget ───────────────────────────────────────────────────────

function DebtWarning({
  ccDebt,
  shoppingSpend,
  monthlyIncome,
}: {
  ccDebt: number;
  shoppingSpend: number;
  monthlyIncome: number;
}) {
  if (ccDebt <= 0) return null;

  const { totalInterest, months } = calcCCTotalInterest(ccDebt);
  const shoppingLimit = monthlyIncome * 0.20;
  const shoppingOverage = Math.max(0, shoppingSpend - shoppingLimit);
  const years = (months / 12).toFixed(1);

  return (
    <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-rose-100 shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-rose-700">Credit Card Debt Alert</h3>
          <p className="text-xs text-rose-600 mt-0.5">
            Your {formatCurrency(ccDebt)} balance at ~24% APR is costing you money every day.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-rose-100 p-3.5 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Total Interest (minimums only)</p>
          <p className="text-currency text-lg font-bold text-rose-600">{formatCurrency(totalInterest)}</p>
          <p className="text-[10px] text-muted-foreground">over {years} years</p>
        </div>
        <div className="rounded-xl bg-white border border-rose-100 p-3.5 text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Time to Pay Off</p>
          <p className="text-currency text-lg font-bold text-rose-600">{months} months</p>
          <p className="text-[10px] text-muted-foreground">making minimum payments</p>
        </div>
      </div>

      {shoppingOverage > 0 && (
        <div className="rounded-xl bg-white border border-rose-100 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Suggested Fix
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            You&apos;re <strong className="text-rose-600">{formatCurrency(shoppingOverage)}</strong> over your shopping limit this month.
            Redirecting that amount to your credit card saves you an estimated{" "}
            <strong className="text-[#3E863E]">
              {formatCurrency(shoppingOverage * (0.24 / 12) * months)}
            </strong>{" "}
            in interest and cuts your payoff timeline significantly.
          </p>
        </div>
      )}

      <p className="text-[10px] text-rose-500 font-medium">
        💡 Paying just {formatCurrency(ccDebt * 0.05)}/mo (5% of balance) instead of the minimum
        would pay off your balance in approximately {Math.ceil(Math.log(1.5) / Math.log(1 + (0.24 / 12 * 0.05 - 0.24 / 12) / (ccDebt * 0.05) + 1))} months.
        Every extra dollar counts.
      </p>
    </div>
  );
}

// ── Connect CTA (no Plaid) ────────────────────────────────────────────────────

function ConnectCTA({ onSuccess }: { onSuccess: (t: string, s: any[]) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-xl shadow-[#3E863E]/30">
        <Wallet className="w-7 h-7 text-white" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="font-heading text-xl font-bold">Connect your accounts</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Link your Fidelity account via Plaid to see your real spending breakdown, category limits, and debt insights.
        </p>
      </div>
      <PlaidLinkButton onSuccess={onSuccess} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function BudgetContent() {
  const { profile } = useProfile();
  const { transactionSummary, isConnected, isLoadingPlaid, handlePlaidSuccess } = usePlaid();

  const totalSpent = useMemo(
    () => transactionSummary.reduce((sum, c) => sum + c.total, 0),
    [transactionSummary]
  );

  const shoppingSpend = useMemo(
    () =>
      transactionSummary
        .filter((c) => c.category === "GENERAL_MERCHANDISE" || c.category === "SHOPPING")
        .reduce((sum, c) => sum + c.total, 0),
    [transactionSummary]
  );

  if (!isConnected && !isLoadingPlaid) {
    return <ConnectCTA onSuccess={handlePlaidSuccess} />;
  }

  if (isLoadingPlaid) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[#2d6a2d] text-sm">
        <div className="w-5 h-5 border-2 border-[#3E863E] border-t-transparent rounded-full animate-spin" />
        Syncing your transactions…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CashFlowHeader monthlyIncome={profile.monthlyIncome} totalSpent={totalSpent} />
      <CategoryBreakdown summary={transactionSummary} monthlyIncome={profile.monthlyIncome} />
      <DebtWarning
        ccDebt={profile.creditCardDebt}
        shoppingSpend={shoppingSpend}
        monthlyIncome={profile.monthlyIncome}
      />
    </div>
  );
}

export default function BudgetPage() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <>
      <AppHeader />
      <MobileBottomDock />
      <div className="min-h-screen bg-[#F9FAFB]">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 md:pb-10 pt-8 space-y-6">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3E863E] mb-1">
                Your Spending
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
                Budget
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Real Plaid transactions vs. healthy student baselines.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-[#A8D4A8] text-[#2d6a2d] hover:bg-[#f0f7f0]">
                ← Home
              </Button>
            </Link>
          </div>

          <Separator className="bg-[#E0F0E0]" />

          {!isLoaded ? null : !isSignedIn ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
              <div className="space-y-2">
                <h2 className="font-heading text-xl font-bold">Sign in to view your budget</h2>
                <p className="text-muted-foreground text-sm">Track your real spending and compare against healthy limits.</p>
              </div>
              <SignInButton mode="modal">
                <Button className="gradient-brand border-0 text-white shadow-lg shadow-[#3E863E]/30 hover:opacity-90">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Sign In
                </Button>
              </SignInButton>
            </div>
          ) : (
            <BudgetContent />
          )}
        </main>
      </div>
    </>
  );
}
