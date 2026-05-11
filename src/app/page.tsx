"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton";
import { NetWorthCard } from "@/components/NetWorthCard";
import { CollegeProfileForm } from "@/components/CollegeProfileForm";
import { AccountList } from "@/components/AccountList";
import { FutureCastChart } from "@/components/FutureCastChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  Lock,
  TrendingUp,
  Bot,
} from "lucide-react";
import { calculateNetWorth } from "@/lib/utils";
import type { PlaidAccount, CollegeProfile } from "@/types";
import { DEFAULT_COLLEGE_PROFILE } from "@/types";

// ─── Landing hero shown to signed-out users ───────────────────────────────────

function LandingHero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 space-y-8 bg-gradient-to-br from-slate-50 via-violet-50/40 to-indigo-50/40">
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Built for first-year college women
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          Know Your{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Worth
          </span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-xl mx-auto">
          Connect your Fidelity accounts, build your financial profile, and
          practice negotiating your first real salary — all in one place.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SignInButton mode="modal">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Button>
        </SignInButton>
        <p className="text-xs text-muted-foreground">No credit card required</p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full pt-4">
        {[
          { icon: TrendingUp, title: "Fidelity Link", desc: "Connect your real brokerage & debit accounts via Plaid." },
          { icon: Sparkles, title: "Future-Cast Engine", desc: "See your money compound over 40 years by career path." },
          { icon: Bot, title: "AI Salary Coach", desc: "Practice negotiating with a Gemini-powered hiring manager." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-white/60 backdrop-blur-sm p-5 text-left space-y-2">
            <div className="p-2 w-fit rounded-lg bg-violet-100">
              <Icon className="w-4 h-4 text-violet-600" />
            </div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main authenticated dashboard ─────────────────────────────────────────────

function AuthenticatedDashboard() {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [profile, setProfile] = useState<CollegeProfile>(DEFAULT_COLLEGE_PROFILE);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const breakdown = calculateNetWorth(accounts, profile);
  const isConnected = !!accessToken;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Page header */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Confidence{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your complete financial picture — updated in real time.
            </p>
          </div>
          <PlaidLinkButton onSuccess={handlePlaidSuccess} />
        </section>

        {loadingAccounts && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground p-4 rounded-lg border bg-muted/30 animate-pulse">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            Fetching your account balances from Plaid…
          </div>
        )}

        {/* Dashboard grid */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Net Worth Card + Connected Accounts */}
          <div className="lg:col-span-3 space-y-6">
            <NetWorthCard breakdown={breakdown} isConnected={isConnected} />
            <AccountList accounts={accounts} />
          </div>

          {/* Right: College Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <CollegeProfileForm profile={profile} onChange={setProfile} />

            {/* Navigate to AI Simulator */}
            <Link href="/negotiate">
              <div className="group rounded-xl border border-violet-300 dark:border-violet-700 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 hover:shadow-md hover:border-violet-400 transition-all cursor-pointer space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm">
                    <MessageCircle className="w-4 h-4" />
                    "Worth It" AI Coach
                  </div>
                  <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Practice negotiating your first internship salary with a
                  Gemini-powered hiring manager. Get a live Confidence Score
                  and personalized tips.
                </p>
              </div>
            </Link>
          </div>
        </section>

        <Separator />

        {/* Future-Cast full-width */}
        <FutureCastChart netWorth={breakdown.total} isConnected={isConnected} />
      </main>
    </div>
  );
}

// ─── Page root — switches between landing and dashboard ───────────────────────

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <>
      <AppHeader isSignedIn={!!isSignedIn} />
      {!isLoaded ? null : isSignedIn ? <AuthenticatedDashboard /> : <LandingHero />}
    </>
  );
}

// ─── Shared app header ────────────────────────────────────────────────────────

function AppHeader({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">WorthWise</span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors font-medium">
            Dashboard
          </Link>
          <Link
            href="/negotiate"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Bot className="w-3.5 h-3.5" /> Worth It AI
          </Link>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex text-xs text-violet-600 border-violet-300 bg-violet-50">
            Sandbox Mode
          </Badge>
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
