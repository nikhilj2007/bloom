"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton";
import { NetWorthCard } from "@/components/NetWorthCard";
import { CollegeProfileForm } from "@/components/CollegeProfileForm";
import { AccountList } from "@/components/AccountList";
import { FutureCastChart } from "@/components/FutureCastChart";
import { AppHeader, MobileBottomDock } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Bot,
  Target,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { MarketPulseTicker } from "@/components/MarketPulseTicker";
import { calculateNetWorth, calculateGlowScore } from "@/lib/utils";
import type { CategorySummary } from "@/types";
import { useProfile } from "@/context/ProfileContext";
import { usePlaid } from "@/context/PlaidContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Budget",        icon: BarChart2,     href: "/budget",    gradient: "from-[#4C994C] to-[#3E863E]", bg: "bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8]" },
  { label: "AI Coach",      icon: MessageCircle, href: "/negotiate", gradient: "from-[#3E863E] to-[#2d6a2d]", bg: "bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8]" },
  { label: "Grow / Invest", icon: TrendingUp,    href: "/grow",      gradient: "from-[#5aaa5a] to-[#4C994C]", bg: "bg-gradient-to-br from-[#e8f5e8] to-[#f0f7f0]" },
  { label: "Set Goals",     icon: Target,        href: "/",          gradient: "from-[#2ECC71] to-[#0ea5e9]", bg: "bg-gradient-to-br from-[#e8fdf3] to-[#e0f7ff]"  },
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function MiniTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-currency">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Net worth trend chart ────────────────────────────────────────────────────

function NetWorthTrendChart({ netWorth }: { netWorth: number }) {
  const trendData = useMemo(() => {
    const base = netWorth !== 0 ? netWorth : 1_200;
    return ["Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((month, i) => ({
      month,
      value: Math.round(base * (0.55 + (i / 5) * 0.45)),
    }));
  }, [netWorth]);

  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading font-semibold text-sm">Net Worth Trend</p>
        <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-medium">
          6-month
        </Badge>
      </div>
      <div className="flex-1" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3E863E" stopOpacity={0.30} />
                <stop offset="100%" stopColor="#4C994C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#999" }} />
            <YAxis hide />
            <Tooltip content={<MiniTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3E863E"
              strokeWidth={2}
              fill="url(#trendGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#3E863E", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Quick actions panel ──────────────────────────────────────────────────────

function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
      <p className="font-heading font-semibold text-sm">Quick Actions</p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ label, icon: Icon, href, gradient, bg }) => (
          <Link key={label} href={href}>
            <div className={`${bg} rounded-xl border border-white/80 p-3.5 space-y-2 hover:scale-[1.02] hover:card-glow transition-all duration-200 cursor-pointer`}>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-semibold leading-tight">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Money Moves panel ────────────────────────────────────────────────────────

function MoneyMoves({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
      <p className="font-heading font-semibold text-sm">Money Moves</p>
      <div
        className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${
          isConnected
            ? "bg-gradient-to-r from-[#e8fdf3] to-[#f0fef8] border border-emerald-200"
            : "bg-gradient-to-r from-[#fafafa] to-[#f5f5f5] border border-dashed border-slate-200"
        }`}
      >
        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isConnected ? "text-emerald-500" : "text-slate-300"}`} />
        <div>
          <p className="text-xs font-semibold text-foreground">
            {isConnected ? "Fidelity Linked" : "Link Fidelity Account"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isConnected ? "Live balance synced" : "Connect for real-time data"}
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-[#f0f7f0] to-[#e8f5e8] border border-[#A8D4A8] p-3.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2d6a2d]">
          <Lightbulb className="w-3 h-3" /> Gemini AI Tip
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          &ldquo;Mentioning specific market data — like Glassdoor ranges — can raise your offer by 12% on average. Try the AI Coach!&rdquo;
        </p>
      </div>
    </div>
  );
}

// ─── Spending summary ─────────────────────────────────────────────────────────

function SpendingSummary({ summary }: { summary: CategorySummary[] }) {
  if (!summary.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-[#D0E8D0] card-soft p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-heading font-semibold text-sm">30-Day Spending Breakdown</p>
        <Badge className="bg-[#f0f7f0] text-[#2d6a2d] border-[#A8D4A8] border text-[10px] font-medium">
          Live · Plaid
        </Badge>
      </div>
      <div className="space-y-3">
        {summary.slice(0, 6).map(({ category, label, total, percentage }) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{label}</span>
              <span className="text-currency text-muted-foreground">
                ${total.toFixed(2)}{" "}
                <span className="text-[10px]">({percentage}%)</span>
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-[#E0F0E0] overflow-hidden">
              <div
                className="h-full rounded-full gradient-brand transition-all duration-700"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <Link href="/budget">
        <button className="w-full text-xs font-semibold text-[#2d6a2d] py-2 rounded-xl border border-[#A8D4A8] bg-[#f0f7f0] hover:bg-[#e8f5e8] transition-colors">
          View full Budget breakdown →
        </button>
      </Link>
    </div>
  );
}

// ─── Dashboard (exported) ─────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useUser();
  const { profile, setProfile } = useProfile();
  const {
    accounts,
    transactionSummary,
    isConnected,
    isLoadingPlaid,
    handlePlaidSuccess,
  } = usePlaid();

  const breakdown = useMemo(() => calculateNetWorth(accounts, profile), [accounts, profile]);
  const glowScore  = useMemo(() => calculateGlowScore(accounts, profile),  [accounts, profile]);
  const firstName  = user?.firstName ?? user?.username ?? "You";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AppHeader />
      <MobileBottomDock />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-10 pt-8 space-y-8">

        {/* ── Hero Slogan ──────────────────────────────────────────── */}
        <section className="text-center py-4">
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif", color: "#1a2332" }}
          >
            Know your{" "}
            <span style={{ color: "#3E863E", fontWeight: 800 }}>worth</span>.
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Your financial picture — live, compounding, and growing.
          </p>
        </section>

        {/* ── Welcome + Plaid Link ──────────────────────────────────── */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3E863E] mb-1">
              Your Dashboard
            </p>
            <p className="font-heading text-2xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="gradient-brand-text">{firstName}!</span>
            </p>
          </div>
          {!isConnected && <PlaidLinkButton onSuccess={handlePlaidSuccess} />}
        </section>

        {isLoadingPlaid && (
          <div className="flex items-center gap-3 text-sm text-[#2d6a2d] p-4 rounded-2xl border border-[#A8D4A8] bg-[#f0f7f0]/60 animate-pulse">
            <div className="w-4 h-4 border-2 border-[#3E863E] border-t-transparent rounded-full animate-spin shrink-0" />
            {isConnected
              ? "Refreshing your Plaid data…"
              : "Fetching your account balances from Plaid…"}
          </div>
        )}

        {/* ── Main Grid ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NetWorthCard breakdown={breakdown} isConnected={isConnected} glowScore={glowScore} />
              <NetWorthTrendChart netWorth={breakdown.total} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <QuickActions />
              <MoneyMoves isConnected={isConnected} />
            </div>
            {transactionSummary.length > 0 && (
              <SpendingSummary summary={transactionSummary} />
            )}
            <AccountList accounts={accounts} />
            <CollegeProfileForm profile={profile} onChange={setProfile} />
          </div>

          <div className="space-y-6">
            <Link href="/negotiate">
              <div className="group rounded-2xl border border-[#A8D4A8] bg-gradient-to-br from-[#f0f7f0] via-[#e8f5e8] to-[#f0f7f0] p-5 space-y-3 card-glow hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#3E863E] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm">&ldquo;Worth It&rdquo; AI Coach</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Practice negotiating your first internship salary with a
                    Gemini-powered hiring manager.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#2d6a2d]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3E863E] animate-pulse" />
                  Powered by Gemini
                </div>
              </div>
            </Link>
            <MarketPulseTicker />
            <FutureCastChart netWorth={breakdown.total} isConnected={isConnected} compact />
          </div>
        </section>
      </main>
    </div>
  );
}
