"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import type { PlaidAccount, CategorySummary } from "@/types";
import { getUserProfile, savePlaidToken } from "@/lib/db";

interface PlaidContextValue {
  accounts: PlaidAccount[];
  accessToken: string | null;
  transactionSummary: CategorySummary[];
  isConnected: boolean;
  isLoadingPlaid: boolean;
  handlePlaidSuccess: (token: string, summary: CategorySummary[]) => Promise<void>;
}

const PlaidContext = createContext<PlaidContextValue | null>(null);

export function PlaidProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();

  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [transactionSummary, setTransactionSummary] = useState<CategorySummary[]>([]);
  const [isLoadingPlaid, setIsLoadingPlaid] = useState(false);

  // ── Auto-restore Plaid connection from Supabase on sign-in ───────────────
  useEffect(() => {
    if (!isLoaded || !user) return;

    const restore = async () => {
      setIsLoadingPlaid(true);
      try {
        const db = await getUserProfile(user.id);
        if (!db?.plaid_access_token) return;

        const token = db.plaid_access_token;
        setAccessToken(token);

        // Fetch accounts
        const accountsRes = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token }),
        });
        const accountsData = await accountsRes.json();
        if (accountsData.accounts) setAccounts(accountsData.accounts);

        // Fetch transaction summary
        const txRes = await fetch("/api/plaid/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token }),
        });
        const txData = await txRes.json();
        if (txData.summary) setTransactionSummary(txData.summary);
      } catch (err) {
        console.error("[PlaidContext] restore error:", err);
      } finally {
        setIsLoadingPlaid(false);
      }
    };

    restore();
  }, [isLoaded, user]);

  // ── Called by PlaidLinkButton after a fresh link ──────────────────────────
  const handlePlaidSuccess = useCallback(
    async (token: string, summary: CategorySummary[]) => {
      setAccessToken(token);
      setTransactionSummary(summary);

      // Persist to Supabase immediately
      if (user) {
        await savePlaidToken(user.id, token).catch(console.error);
      }

      // Fetch accounts
      setIsLoadingPlaid(true);
      try {
        const res = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token }),
        });
        const data = await res.json();
        if (data.accounts) setAccounts(data.accounts);
      } catch (err) {
        console.error("[PlaidContext] account fetch error:", err);
      } finally {
        setIsLoadingPlaid(false);
      }
    },
    [user]
  );

  return (
    <PlaidContext.Provider
      value={{
        accounts,
        accessToken,
        transactionSummary,
        isConnected: !!accessToken,
        isLoadingPlaid,
        handlePlaidSuccess,
      }}
    >
      {children}
    </PlaidContext.Provider>
  );
}

export function usePlaid(): PlaidContextValue {
  const ctx = useContext(PlaidContext);
  if (!ctx) throw new Error("usePlaid must be used inside <PlaidProvider>");
  return ctx;
}
