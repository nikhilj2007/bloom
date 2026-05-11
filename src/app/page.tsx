"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAuth, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton";
import { NetWorthCard } from "@/components/NetWorthCard";
import { CollegeProfileForm } from "@/components/CollegeProfileForm";
import { AccountList } from "@/components/AccountList";
import { FutureCastChart } from "@/components/FutureCastChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  Lock,
  TrendingUp,
  Bot,
  Bell,
  Home as HomeIcon,
  Briefcase,
  BarChart2,
  User,
  ShoppingCart,
  Target,
  DollarSign,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { calculateNetWorth } from "@/lib/utils";
import type { PlaidAccount, CollegeProfile } from "@/types";
import { DEFAULT_COLLEGE_PROFILE } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Mock data for new UI sections ────────────────────────────────────────────

const MOCK_SIX_MONTH = [
  { month: "Dec", value: 1240 },
  { month: "Jan", value: 1580 },
  { month: "Feb", value: 1820 },
  { month: "Mar", value: 2050 },
  { month: "Apr", value: 2380 },
  { month: "May", value: 2750 },
];

const QUICK_ACTIONS = [
  {
    label: "Check Spending",
    icon: ShoppingCart,
    href: "/",
    gradient: "from-[#FFB899] to-[#D98BCC]",
    bg: "bg-gradient-to-br from-[#fff3ed] to-[#fce9f8]",
  },
  {
    label: "Negotiation Sim",
    icon: MessageCircle,
    href: "/negotiate",
    gradient: "from-[#B792F0] to-[#818CF8]",
    bg: "bg-gradient-to-br from-[#f3edff] to-[#eef0ff]",
  },
  {
    label: "Set Goals",
    icon: Target,
    href: "/",
    gradient: "from-[#D98BCC] to-[#FFB899]",
    bg: "bg-gradient-to-br from-[#fce9f8] to-[#fff3ed]",
  },
  {
    label: "Invest $5",
    icon: DollarSign,
    href: "/",
    gradient: "from-[#2ECC71] to-[#0ea5e9]",
    bg: "bg-gradient-to-br from-[#e8fdf3] to-[#e0f7ff]",
  },
];

// ─── Mini 6-month chart tooltip ───────────────────────────────────────────────

function MiniTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-currency">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Landing hero (signed-out) ────────────────────────────────────────────────

function LandingHero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 space-y-10 bg-[#FCFAFA] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#B792F0]/15 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FFB899]/20 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D98BCC]/08 blur-[100px] pointer-events-none" />

      <div className="space-y-5 max-w-2xl relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-[#B792F0]/30 text-[#9b6de0] text-sm font-medium shadow-sm card-soft">
          <Sparkles className="w-3.5 h-3.5" />
          Built for first-year college women
        </div>
        <h1 className="font-heading text-5xl sm:text-7xl font-extrabold tracking-tight">
          Know Your{" "}
          <span className="gradient-brand-text">Worth</span>
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          Connect your Fidelity accounts, build your financial profile, and
          practice negotiating your first real salary — all in one place.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center relative z-10">
        <SignInButton mode="modal">
          <Button
            size="lg"
            className="gap-2 gradient-brand border-0 text-white shadow-xl shadow-[#B792F0]/30 hover:opacity-90 transition-opacity px-8 h-12 font-semibold text-base"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Button>
        </SignInButton>
        <p className="text-xs text-muted-foreground">No credit card required</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full relative z-10">
        {[
          {
            icon: TrendingUp,
            title: "Fidelity Link",
            desc: "Connect your real brokerage & debit accounts via Plaid.",
            gradient: "from-[#e8fdf3] to-[#e0f7ff]",
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
          },
          {
            icon: Sparkles,
            title: "Future-Cast Engine",
            desc: "See your money compound over 40 years by career path.",
            gradient: "from-[#f3edff] to-[#fce9f8]",
            iconColor: "text-[#9b6de0]",
            iconBg: "bg-[#f3edff]",
          },
          {
            icon: Bot,
            title: "AI Salary Coach",
            desc: "Practice negotiating with a Gemini-powered hiring manager.",
            gradient: "from-[#fce9f8] to-[#fff3ed]",
            iconColor: "text-[#c06aac]",
            iconBg: "bg-[#fce9f8]",
          },
        ].map(({ icon: Icon, title, desc, gradient, iconColor, iconBg }) => (
          <div
            key={title}
            className={`rounded-2xl bg-gradient-to-br ${gradient} border border-white/80 p-5 text-left space-y-3 card-soft hover:card-glow transition-all duration-300`}
          >
            <div className={`p-2.5 w-fit rounded-xl ${iconBg}`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className="font-heading font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard: mini 6-month chart ────────────────────────────────────────────

function ConfidenceChart() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0F5] card-soft p-5 space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <p className="font-heading font-semibold text-sm">Net Worth Trend</p>
        <Badge className="bg-[#f3edff] text-[#9b6de0] border-[#D4B8F8] border text-[10px] font-medium">
          6-month
        </Badge>
      </div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        Mock preview data
      </p>
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={MOCK_SIX_MONTH} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B792F0" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FFB899" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: "#999" }}
            />
            <YAxis hide />
            <Tooltip content={<MiniTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#B792F0"
              strokeWidth={2}
              fill="url(#trendGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#B792F0", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Dashboard: quick actions ──────────────────────────────────────────────────

function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0F5] card-soft p-5 space-y-4">
      <p className="font-heading font-semibold text-sm">Quick Actions</p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ label, icon: Icon, href, gradient, bg }) => (
          <Link key={label} href={href}>
            <div
              className={`${bg} rounded-xl border border-white/80 p-3.5 space-y-2 hover:scale-[1.02] hover:card-glow transition-all duration-200 cursor-pointer`}
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
              >
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

// ─── Dashboard: money moves ────────────────────────────────────────────────────

function MoneyMoves({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0F5] card-soft p-5 space-y-4">
      <p className="font-heading font-semibold text-sm">Money Moves</p>

      {/* Fidelity status */}
      <div
        className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${
          isConnected
            ? "bg-gradient-to-r from-[#e8fdf3] to-[#f0fef8] border border-emerald-200"
            : "bg-gradient-to-r from-[#fafafa] to-[#f5f5f5] border border-dashed border-slate-200"
        }`}
      >
        <CheckCircle2
          className={`w-4 h-4 shrink-0 ${isConnected ? "text-emerald-500" : "text-slate-300"}`}
        />
        <div>
          <p className="text-xs font-semibold text-foreground">
            {isConnected ? "Fidelity Linked" : "Link Fidelity Account"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isConnected ? "Live balance synced" : "Connect for real-time data"}
          </p>
        </div>
      </div>

      {/* Gemini tip */}
      <div className="rounded-xl bg-gradient-to-br from-[#f3edff] to-[#fce9f8] border border-[#D4B8F8] p-3.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9b6de0]">
          <Lightbulb className="w-3 h-3" /> Gemini AI Tip
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          "Mentioning specific market data — like Glassdoor ranges — can raise
          your offer by 12% on average. Try it in the Negotiation Sim!"
        </p>
      </div>

      {/* Daily budget bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold">Daily Budget</p>
          <span className="text-currency text-xs font-medium text-muted-foreground">
            $45 / $60
          </span>
        </div>
        <div className="relative h-2.5 w-full rounded-full bg-[#F0EAF8] overflow-hidden">
          <div
            className="h-full rounded-full gradient-brand transition-all duration-700"
            style={{ width: "75%" }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["Groceries $22", "Coffee $8", "Transport $15"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3EDFF] text-[#9b6de0] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Authenticated dashboard ───────────────────────────────────────────────────

function AuthenticatedDashboard() {
  const { user } = useUser();
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [profile, setProfile] = useState<CollegeProfile>(DEFAULT_COLLEGE_PROFILE);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const breakdown = calculateNetWorth(accounts, profile);
  const isConnected = !!accessToken;
  const firstName = user?.firstName ?? user?.username ?? "You";

  const handlePlaidSuccess = useCallback(async (token: string) => {
    setAccessToken(token);
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
      });
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAFA] relative">
      {/* Ambient background blobs */}
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#B792F0]/08 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-[#FFB899]/10 blur-[80px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-10 pt-8 space-y-8 relative z-10">
        {/* ── Welcome Banner ──────────────────────────────────────────── */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B792F0] mb-1">
              Your Dashboard
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
              WELCOME,{" "}
              <span className="gradient-brand-text">{firstName.toUpperCase()}!</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Your financial picture — live, compounding, and growing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PlaidLinkButton onSuccess={handlePlaidSuccess} />
          </div>
        </section>

        {loadingAccounts && (
          <div className="flex items-center gap-3 text-sm text-[#9b6de0] p-4 rounded-2xl border border-[#D4B8F8] bg-[#f3edff]/60 animate-pulse">
            <div className="w-4 h-4 border-2 border-[#B792F0] border-t-transparent rounded-full animate-spin shrink-0" />
            Fetching your account balances from Plaid…
          </div>
        )}

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3: all main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Row 1: Glow Score + Mini Chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NetWorthCard breakdown={breakdown} isConnected={isConnected} />
              <ConfidenceChart />
            </div>

            {/* Row 2: Quick Actions + Money Moves */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <QuickActions />
              <MoneyMoves isConnected={isConnected} />
            </div>

            {/* Row 3: Connected Accounts */}
            <AccountList accounts={accounts} />

            {/* Row 4: College Profile */}
            <CollegeProfileForm profile={profile} onChange={setProfile} />
          </div>

          {/* Right 1/3: AI Coach + FutureCast Panel */}
          <div className="space-y-6">
            {/* AI Coach CTA */}
            <Link href="/negotiate">
              <div className="group rounded-2xl border border-[#D4B8F8] bg-gradient-to-br from-[#f3edff] via-[#fce9f8] to-[#fff3ed] p-5 space-y-3 card-glow hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B792F0] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm">"Worth It" AI Coach</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Practice negotiating your first internship salary with a
                    Gemini-powered hiring manager. Get a live Confidence Score
                    and personalized tips.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#9b6de0]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B792F0] animate-pulse" />
                  Powered by Gemini
                </div>
              </div>
            </Link>

            {/* Future-Cast panel (compact + progressive disclosure) */}
            <FutureCastChart
              netWorth={breakdown.total}
              isConnected={isConnected}
              compact
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// ─── Page root ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  return (
    <>
      <AppHeader isSignedIn={!!isSignedIn} />
      <MobileBottomDock />
      {!isLoaded ? null : isSignedIn ? <AuthenticatedDashboard /> : <LandingHero />}
    </>
  );
}

// ─── Shared app header ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Budget", href: "/" },
  { label: "Career", href: "/" },
  { label: "Grow", href: "/" },
];

function AppHeader({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="border-b border-[#E8E0F5] bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">WorthWise</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-[#F3EDFF] transition-all font-medium"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/negotiate"
            className="px-3.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-[#F3EDFF] transition-all font-medium flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" /> AI Coach
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-xs text-[#9b6de0] border-[#D4B8F8] bg-[#f3edff] font-medium"
          >
            Sandbox
          </Badge>

          {isSignedIn && (
            <button className="w-8 h-8 rounded-lg hover:bg-[#F3EDFF] flex items-center justify-center transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full gradient-brand" />
            </button>
          )}

          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="gap-1.5 gradient-brand border-0 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                <Lock className="w-3.5 h-3.5" /> Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Mobile bottom dock (glassmorphism) ───────────────────────────────────────

const DOCK_ITEMS = [
  { icon: HomeIcon, label: "Home", href: "/" },
  { icon: BarChart2, label: "Budget", href: "/" },
  { icon: Briefcase, label: "Career", href: "/" },
  { icon: TrendingUp, label: "Grow", href: "/" },
  { icon: User, label: "Profile", href: "/" },
];

function MobileBottomDock() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-safe">
      <div className="mb-3 glass rounded-2xl border border-white/60 shadow-2xl shadow-[#B792F0]/10 overflow-hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {DOCK_ITEMS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-[#F3EDFF] transition-colors group"
            >
              <Icon className="w-5 h-5 text-muted-foreground group-hover:text-[#9b6de0] transition-colors" />
              <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-[#9b6de0] uppercase tracking-wider transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
