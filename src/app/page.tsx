"use client";

import { useState, useCallback } from "react";
import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton";
import { NetWorthCard } from "@/components/NetWorthCard";
import { ManualCashForm } from "@/components/ManualCashForm";
import { AccountList } from "@/components/AccountList";
import { FutureCastChart } from "@/components/FutureCastChart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, MessageCircle, ChevronRight } from "lucide-react";
import { calculateNetWorth } from "@/lib/utils";
import type { PlaidAccount, ManualCashEntry } from "@/types";

export default function Dashboard() {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [manualEntries, setManualEntries] = useState<ManualCashEntry[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const breakdown = calculateNetWorth(accounts, manualEntries);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-violet-950/20 dark:to-indigo-950/20">
      {/* Header */}
      <header className="border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">WorthWise</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="text-foreground font-medium">Dashboard</a>
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
              Future-Cast <ChevronRight className="w-3 h-3" />
            </a>
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
              Worth It AI <ChevronRight className="w-3 h-3" />
            </a>
          </nav>
          <Badge variant="outline" className="text-xs text-violet-600 border-violet-300 bg-violet-50">
            Sandbox Mode
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Hero section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Your financial confidence starts here
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Know Your{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Worth
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Connect your Fidelity accounts, add any extra cash, and watch your net worth come to life — then project it into your future.
          </p>

          {!isConnected && (
            <div className="pt-2">
              <PlaidLinkButton onSuccess={handlePlaidSuccess} />
            </div>
          )}
        </section>

        <Separator />

        {/* Dashboard grid */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Net Worth Card + Accounts */}
          <div className="lg:col-span-3 space-y-6">
            <NetWorthCard breakdown={breakdown} isConnected={isConnected} />

            {loadingAccounts && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground p-4 rounded-lg border bg-muted/30 animate-pulse">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Fetching your account balances from Plaid…
              </div>
            )}

            <AccountList accounts={accounts} />

            {isConnected && (
              <div className="flex justify-center">
                <PlaidLinkButton onSuccess={handlePlaidSuccess} />
              </div>
            )}
          </div>

          {/* Right: Manual Cash + AI teaser */}
          <div className="lg:col-span-2 space-y-6">
            <ManualCashForm entries={manualEntries} onChange={setManualEntries} />

            {/* AI Simulator teaser */}
            <div className="rounded-xl border border-dashed border-violet-300 dark:border-violet-700 p-6 bg-violet-50/50 dark:bg-violet-950/20 space-y-2">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm">
                <MessageCircle className="w-4 h-4" />
                "Worth It" AI Negotiation Coach
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Practice asking for more — our Gemini-powered manager will score your confidence and give personalized tips. Coming in Phase 4.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Future-Cast full-width section */}
        <FutureCastChart netWorth={breakdown.total} isConnected={isConnected} />
      </main>

      <footer className="border-t mt-20 py-8 text-center text-xs text-muted-foreground">
        WorthWise · Built for the Fidelity Fintech Hackathon · Plaid Sandbox Mode
      </footer>
    </div>
  );
}
