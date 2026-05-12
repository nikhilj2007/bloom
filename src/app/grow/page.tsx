"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { AppHeader, MobileBottomDock } from "@/components/AppHeader";
import { FutureCastChart } from "@/components/FutureCastChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  PiggyBank,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Zap,
  Info,
} from "lucide-react";
import {
  formatCurrency,
  POST_GRAD_SALARIES,
  CAREER_PATHS,
  calcLoanMinimumPayment,
  calcCCMinimumPayment,
  calcCCTotalInterest,
} from "@/lib/utils";
import { useProfile } from "@/context/ProfileContext";
import { usePlaid } from "@/context/PlaidContext";
import type { CareerPath } from "@/types";

// ── Pre-grad suggestion card ──────────────────────────────────────────────────

function PreGradSection() {
  const { profile } = useProfile();
  const { isConnected } = usePlaid();

  const suggestedPrincipal = Math.round(profile.otherCash * 0.15);
  const suggestedMonthly = Math.round(profile.monthlyIncome * 0.10);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-xl">
          Pre-Graduation: Start Small, Stay Safe
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          We recommend investing only a fraction of your savings now — keep the rest as your emergency fund.
        </p>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-[#D0E8D0] card-soft p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f0f7f0]">
              <PiggyBank className="w-4 h-4 text-[#3E863E]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Suggested Starting Principal
              </p>
              <p className="text-[10px] text-muted-foreground">15% of liquid savings</p>
            </div>
          </div>
          <p className="text-currency text-3xl font-bold text-[#2d6a2d] leading-none">
            {suggestedPrincipal > 0 ? formatCurrency(suggestedPrincipal) : "—"}
          </p>
          {profile.otherCash === 0 && (
            <p className="text-[10px] text-muted-foreground">
              Enter your savings in{" "}
              <Link href="/" className="text-[#3E863E] underline">My Financial Profile</Link> to see this.
            </p>
          )}
          <div className="rounded-lg bg-[#f0f7f0] border border-[#A8D4A8] px-3 py-2">
            <p className="text-[10px] text-[#2d6a2d] leading-relaxed">
              <strong>Why 15%?</strong> Keeping 85% liquid means you have a 3–6 month emergency fund
              before you start investing.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#D0E8D0] card-soft p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f0f7f0]">
              <TrendingUp className="w-4 h-4 text-[#3E863E]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Suggested Monthly Contribution
              </p>
              <p className="text-[10px] text-muted-foreground">10% of monthly income</p>
            </div>
          </div>
          <p className="text-currency text-3xl font-bold text-[#2d6a2d] leading-none">
            {suggestedMonthly > 0 ? formatCurrency(suggestedMonthly) : "—"}
          </p>
          {profile.monthlyIncome === 0 && (
            <p className="text-[10px] text-muted-foreground">
              Enter your income in{" "}
              <Link href="/" className="text-[#3E863E] underline">My Financial Profile</Link>.
            </p>
          )}
          <div className="rounded-lg bg-[#f0f7f0] border border-[#A8D4A8] px-3 py-2">
            <p className="text-[10px] text-[#2d6a2d] leading-relaxed">
              <strong>The 10% rule:</strong> Even small monthly contributions compound dramatically
              over 40 years — see the chart below.
            </p>
          </div>
        </div>
      </div>

      {/* Future-cast chart seeded with suggestions */}
      <FutureCastChart
        key={`${suggestedPrincipal}-${suggestedMonthly}`}
        netWorth={suggestedPrincipal}
        isConnected={isConnected}
        initialMonthlyContribution={Math.max(suggestedMonthly, 25)}
      />
    </section>
  );
}

// ── 50/30/20 bar ──────────────────────────────────────────────────────────────

function SplitBar({
  label,
  pct,
  amount,
  color,
  sublabel,
}: {
  label: string;
  pct: number;
  amount: number;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-semibold">{label}</span>
          {sublabel && <span className="text-muted-foreground text-xs ml-2">{sublabel}</span>}
        </div>
        <div className="text-right">
          <span className="text-currency font-bold">{formatCurrency(amount)}</span>
          <span className="text-muted-foreground text-xs ml-1">/ mo ({pct}%)</span>
        </div>
      </div>
      <div className="relative h-3 w-full rounded-full bg-[#E8ECEF] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Post-grad projector ───────────────────────────────────────────────────────

function PostGradSection() {
  const { profile } = useProfile();
  const [selectedCareer, setSelectedCareer] = useState<CareerPath>(profile.expectedCareer);

  const salaryInfo = POST_GRAD_SALARIES[selectedCareer];
  const monthlyNet = salaryInfo.monthlyNet;

  // 50/30/20 split
  const needs      = Math.round(monthlyNet * 0.50);
  const wants      = Math.round(monthlyNet * 0.30);
  const debtInvest = Math.round(monthlyNet * 0.20);

  // Debt payments
  const loanMin = calcLoanMinimumPayment(profile.studentLoanBalance);
  const ccMin   = calcCCMinimumPayment(profile.creditCardDebt);
  const totalDebtMin = loanMin + ccMin;
  const investTarget = Math.max(0, debtInvest - totalDebtMin);

  const { totalInterest: ccInterest } = calcCCTotalInterest(profile.creditCardDebt);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl">
          Post-Graduation: Your Career Budget
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          The "Glow 50/30/20" plan: how your paycheck should look after graduation.
        </p>
      </div>

      {/* Career selector */}
      <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#3E863E]" />
          <p className="font-heading font-semibold text-sm">Select Your Expected Career</p>
        </div>
        <Select value={selectedCareer} onValueChange={(v) => setSelectedCareer(v as CareerPath)}>
          <SelectTrigger className="border-[#A8D4A8] focus:ring-[#3E863E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(POST_GRAD_SALARIES) as CareerPath[]).map((key) => (
              <SelectItem key={key} value={key}>
                {POST_GRAD_SALARIES[key].label} — {formatCurrency(POST_GRAD_SALARIES[key].annualGross)}/yr
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl bg-[#f0f7f0] border border-[#A8D4A8] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a2d]">Gross Salary</p>
            <p className="text-currency text-lg font-bold text-[#2d6a2d]">
              {formatCurrency(salaryInfo.annualGross)}/yr
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Est. Monthly Take-Home</p>
            <p className="text-currency text-lg font-bold text-emerald-700">
              {formatCurrency(monthlyNet)}/mo
            </p>
            <p className="text-[10px] text-muted-foreground">after ~25% effective tax</p>
          </div>
        </div>
      </div>

      {/* 50/30/20 split */}
      <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-heading font-semibold text-sm">Glow 50/30/20 Budget Split</p>
          <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px]">
            {formatCurrency(monthlyNet)}/mo net
          </Badge>
        </div>

        <SplitBar
          label="50% — Needs"
          pct={50}
          amount={needs}
          color="bg-sky-500"
          sublabel="Rent · Groceries · Utilities"
        />
        <SplitBar
          label="30% — Wants"
          pct={30}
          amount={wants}
          color="bg-amber-500"
          sublabel="Lifestyle · Dining · Travel"
        />
        <SplitBar
          label="20% — Debt + Investing"
          pct={20}
          amount={debtInvest}
          color="bg-[#3E863E]"
          sublabel="Loan payments + investment target"
        />
      </div>

      {/* Debt + Investing breakdown within the 20% bucket */}
      <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
        <p className="font-heading font-semibold text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#3E863E]" />
          Your 20% Bucket — Breakdown
        </p>

        <div className="space-y-3">
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Debt Minimums</p>
            <div className="space-y-1.5">
              {profile.studentLoanBalance > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Student loans (10-yr @ 5%)</span>
                  <span className="text-currency font-semibold text-rose-600">−{formatCurrency(loanMin)}/mo</span>
                </div>
              )}
              {profile.creditCardDebt > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Credit card minimum (2%)</span>
                  <span className="text-currency font-semibold text-rose-600">−{formatCurrency(ccMin)}/mo</span>
                </div>
              )}
              {totalDebtMin === 0 && (
                <p className="text-xs text-muted-foreground">No debt entered — you&apos;re starting clean! 🎉</p>
              )}
            </div>
            {totalDebtMin > 0 && (
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-rose-200">
                <span>Total minimums</span>
                <span className="text-currency text-rose-600">−{formatCurrency(totalDebtMin)}/mo</span>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#f0f7f0] border border-[#A8D4A8] p-3.5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a2d]">
              Aggressive Investment Target
            </p>
            <p className="text-currency text-2xl font-bold text-[#2d6a2d]">
              {formatCurrency(investTarget)}/mo
            </p>
            <p className="text-[10px] text-muted-foreground">
              {debtInvest > 0
                ? `${formatCurrency(debtInvest)} bucket − ${formatCurrency(totalDebtMin)} debt minimums`
                : "Set your income to calculate"}
            </p>
            {investTarget > 0 && (
              <div className="flex items-start gap-1.5 text-[10px] text-[#2d6a2d] bg-white rounded-lg px-3 py-2 border border-[#A8D4A8]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Investing {formatCurrency(investTarget)}/mo starting at graduation could grow to{" "}
                <strong className="ml-0.5">
                  {formatCurrency(investTarget * 12 * 40 * 4)}+
                </strong>{" "}
                in 40 years at 7% avg return.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CC debt warning within context */}
      {profile.creditCardDebt > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <p className="font-heading font-semibold text-sm">Payoff Strategy Note</p>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            If you only make minimum CC payments after graduation, you&apos;ll pay an estimated{" "}
            <strong>{formatCurrency(ccInterest)}</strong> in interest on your{" "}
            {formatCurrency(profile.creditCardDebt)} balance. Consider allocating extra from your 20%
            bucket to eliminate this debt in Year 1 — it&apos;s the highest-ROI financial move you can make.
          </p>
        </div>
      )}

      {/* Info callout */}
      <div className="rounded-xl bg-[#f0f7f0] border border-[#A8D4A8] p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#3E863E] shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Salary figures are averages for entry-level graduates in the US (2025). Take-home pay
          assumes ~25% effective federal + state tax. Loan minimum uses a standard 10-year repayment
          at 5% federal rate. Individual results will vary.
        </p>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function GrowContent() {
  return (
    <div className="space-y-12">
      <Separator className="bg-[#E0F0E0]" />
      <PreGradSection />
      <Separator className="bg-[#E0F0E0]" />
      <PostGradSection />
    </div>
  );
}

export default function GrowPage() {
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
                Your Wealth Engine
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
                Grow
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Smart investing today. A plan for life after graduation.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-[#A8D4A8] text-[#2d6a2d] hover:bg-[#f0f7f0]">
                ← Home
              </Button>
            </Link>
          </div>

          {!isLoaded ? null : !isSignedIn ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
              <div className="space-y-2">
                <h2 className="font-heading text-xl font-bold">Sign in to plan your future</h2>
                <p className="text-muted-foreground text-sm">See personalized investing projections and your post-grad budget blueprint.</p>
              </div>
              <SignInButton mode="modal">
                <Button className="gradient-brand border-0 text-white shadow-lg shadow-[#3E863E]/30 hover:opacity-90">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Sign In
                </Button>
              </SignInButton>
            </div>
          ) : (
            <GrowContent />
          )}
        </main>
      </div>
    </>
  );
}
