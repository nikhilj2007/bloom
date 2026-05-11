import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PlaidAccount, NetWorthBreakdown, ManualCashEntry, WealthDataPoint, CareerPath, InvestmentStrategy } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isFidelityBrokerage(account: PlaidAccount): boolean {
  return (
    account.type === "investment" ||
    account.subtype === "brokerage" ||
    account.name.toLowerCase().includes("fidelity")
  );
}

export function isFidelityDebit(account: PlaidAccount): boolean {
  return (
    (account.type === "depository" &&
      (account.subtype === "checking" || account.subtype === "savings")) ||
    account.name.toLowerCase().includes("cash management")
  );
}

export function isCreditCard(account: PlaidAccount): boolean {
  return account.type === "credit";
}

export function calculateNetWorth(
  accounts: PlaidAccount[],
  manualEntries: ManualCashEntry[]
): NetWorthBreakdown {
  let fidelityBrokerage = 0;
  let fidelityDebit = 0;
  let creditCardDebt = 0;

  for (const acct of accounts) {
    const balance = acct.balances.current ?? 0;
    if (isFidelityBrokerage(acct)) {
      fidelityBrokerage += balance;
    } else if (isFidelityDebit(acct)) {
      fidelityDebit += balance;
    } else if (isCreditCard(acct)) {
      creditCardDebt += balance;
    }
  }

  const otherCash = manualEntries.reduce((sum, e) => sum + e.amount, 0);
  const total = fidelityBrokerage + fidelityDebit + otherCash - creditCardDebt;

  return { fidelityBrokerage, fidelityDebit, otherCash, creditCardDebt, total };
}

// ─── Compounding Engine ───────────────────────────────────────────────────────

export const CAREER_PATHS: Record<CareerPath, { label: string; bonusPerMonth: number; bonusStartYear: number }> = {
  starting_out: { label: "Starting Out", bonusPerMonth: 0, bonusStartYear: 0 },
  tech_engineering: { label: "Tech / Engineering", bonusPerMonth: 500, bonusStartYear: 4 },
  business_finance: { label: "Business / Finance", bonusPerMonth: 300, bonusStartYear: 4 },
};

export const INVESTMENT_STRATEGIES: Record<InvestmentStrategy, { label: string; annualRate: number }> = {
  conservative: { label: "Conservative (4%)", annualRate: 0.04 },
  moderate: { label: "Moderate (7%)", annualRate: 0.07 },
  aggressive: { label: "Aggressive (10%)", annualRate: 0.10 },
};

/**
 * Projects wealth over `years` years using monthly compounding.
 * Career path bonuses kick in after `bonusStartYear` years.
 * Returns one data point per year (year 0 = starting principal).
 */
export function projectWealth(
  principal: number,
  monthlyContribution: number,
  strategy: InvestmentStrategy,
  career: CareerPath,
  years: number = 40
): WealthDataPoint[] {
  const { annualRate } = INVESTMENT_STRATEGIES[strategy];
  const { bonusPerMonth, bonusStartYear } = CAREER_PATHS[career];
  const monthlyRate = annualRate / 12;

  const dataPoints: WealthDataPoint[] = [];
  let balance = Math.max(principal, 0);

  dataPoints.push({ year: 0, wealth: Math.round(balance) });

  for (let year = 1; year <= years; year++) {
    const contribution = monthlyContribution + (year > bonusStartYear ? bonusPerMonth : 0);
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + contribution;
    }
    dataPoints.push({ year, wealth: Math.round(balance) });
  }

  return dataPoints;
}
