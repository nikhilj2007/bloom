import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  PlaidAccount,
  NetWorthBreakdown,
  CollegeProfile,
  WealthDataPoint,
  CareerPath,
  InvestmentStrategy,
} from "@/types";

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

/**
 * Calculates a college student's net worth from Plaid account data and
 * a manually-entered financial profile.
 *
 * Net Worth = Total Assets − Total Liabilities
 */
export function calculateNetWorth(
  accounts: PlaidAccount[],
  profile: CollegeProfile
): NetWorthBreakdown {
  let fidelityBrokerage = 0;
  let fidelityDebit = 0;
  let plaidCreditCardDebt = 0;

  for (const acct of accounts) {
    const balance = acct.balances.current ?? 0;
    if (isFidelityBrokerage(acct)) {
      fidelityBrokerage += balance;
    } else if (isFidelityDebit(acct)) {
      fidelityDebit += balance;
    } else if (isCreditCard(acct)) {
      plaidCreditCardDebt += balance;
    }
  }

  // Assets
  const otherCash = profile.otherCash;
  const financialAid = profile.financialAid;
  const totalAssets = fidelityBrokerage + fidelityDebit + otherCash + financialAid;

  // Liabilities
  const studentLoans = profile.studentLoanBalance;
  const creditCardDebt = plaidCreditCardDebt + profile.creditCardDebt;
  const totalLiabilities = studentLoans + creditCardDebt;

  const total = totalAssets - totalLiabilities;

  return {
    fidelityBrokerage,
    fidelityDebit,
    otherCash,
    financialAid,
    totalAssets,
    studentLoans,
    creditCardDebt,
    totalLiabilities,
    total,
  };
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
