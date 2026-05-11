"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, CreditCard, Building2 } from "lucide-react";
import { formatCurrency, isFidelityBrokerage, isFidelityDebit, isCreditCard } from "@/lib/utils";
import type { PlaidAccount } from "@/types";

interface AccountListProps {
  accounts: PlaidAccount[];
}

function AccountIcon({ account }: { account: PlaidAccount }) {
  if (isFidelityBrokerage(account)) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (isFidelityDebit(account)) return <Wallet className="w-4 h-4 text-sky-500" />;
  if (isCreditCard(account)) return <CreditCard className="w-4 h-4 text-rose-500" />;
  return <Building2 className="w-4 h-4 text-slate-500" />;
}

function accountBadge(account: PlaidAccount) {
  if (isFidelityBrokerage(account))
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-xs">Brokerage</Badge>;
  if (isFidelityDebit(account))
    return <Badge className="bg-sky-100 text-sky-700 border-sky-200 border text-xs">Debit / Cash</Badge>;
  if (isCreditCard(account))
    return <Badge className="bg-rose-100 text-rose-700 border-rose-200 border text-xs">Credit</Badge>;
  return <Badge variant="secondary" className="text-xs">{account.subtype ?? account.type}</Badge>;
}

export function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {accounts.map((acct) => (
            <li key={acct.account_id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <AccountIcon account={acct} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{acct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {acct.official_name ?? `•••• ${acct.mask}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${isCreditCard(acct) ? "text-rose-500" : "text-foreground"}`}>
                  {formatCurrency(acct.balances.current ?? 0)}
                </p>
                {accountBadge(acct)}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
