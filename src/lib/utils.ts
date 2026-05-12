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

export const CAREER_PATHS: Record<
  CareerPath,
  { label: string; bonusPerMonth: number; bonusStartYear: number }
> = {
  starting_out:      { label: "Starting Out",         bonusPerMonth: 0,   bonusStartYear: 0 },
  tech_engineering:  { label: "Tech / Engineering",   bonusPerMonth: 500, bonusStartYear: 4 },
  business_finance:  { label: "Business / Finance",   bonusPerMonth: 300, bonusStartYear: 4 },
  nursing_healthcare:{ label: "Nursing / Healthcare", bonusPerMonth: 250, bonusStartYear: 3 },
};

// ── Post-graduation salary projections ───────────────────────────────────────

export const POST_GRAD_SALARIES: Record<
  CareerPath,
  { annualGross: number; monthlyNet: number; label: string }
> = {
  starting_out:      { annualGross:  50_000, monthlyNet: 3_200, label: "Starting Out"         },
  tech_engineering:  { annualGross:  85_000, monthlyNet: 5_300, label: "Tech / Engineering"   },
  business_finance:  { annualGross:  75_000, monthlyNet: 4_800, label: "Business / Finance"   },
  nursing_healthcare:{ annualGross:  70_000, monthlyNet: 4_500, label: "Nursing / Healthcare" },
};

// ── Debt payment math ─────────────────────────────────────────────────────────

/**
 * Standard 10-year student-loan minimum payment at a 5 % federal rate.
 * Formula: PMT = P × r(1+r)^n / ((1+r)^n − 1)
 */
export function calcLoanMinimumPayment(balance: number): number {
  if (balance <= 0) return 0;
  const r = 0.05 / 12;
  const n = 120;
  return (balance * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

/** Credit-card minimum: 2 % of balance or $25, whichever is higher. */
export function calcCCMinimumPayment(balance: number): number {
  if (balance <= 0) return 0;
  return Math.max(25, balance * 0.02);
}

/**
 * Estimates total interest paid on a credit-card balance at 24 % APR if the
 * user only ever makes minimum payments. Runs a month-by-month loop.
 */
export function calcCCTotalInterest(balance: number): {
  totalInterest: number;
  months: number;
} {
  if (balance <= 0) return { totalInterest: 0, months: 0 };
  const monthlyRate = 0.24 / 12;
  let b = balance;
  let totalInterest = 0;
  let months = 0;
  while (b > 0.01 && months < 600) {
    const interest = b * monthlyRate;
    const min = Math.max(25, b * 0.02);
    totalInterest += interest;
    b = b + interest - min;
    months++;
  }
  return { totalInterest, months };
}

export const INVESTMENT_STRATEGIES: Record<InvestmentStrategy, { label: string; annualRate: number }> = {
  conservative: { label: "Conservative (4%)", annualRate: 0.04 },
  moderate: { label: "Moderate (7%)", annualRate: 0.07 },
  aggressive: { label: "Aggressive (10%)", annualRate: 0.10 },
};

/**
 * Calculates the WorthWise "Glow Score" on a 1–100 scale tailored for
 * college students. Score starts at 50 and gains up to 25 points from
 * each of two pillars:
 *
 * 1. Cash-flow ratio  — (monthly income + monthly aid) ÷ (rent + tuition)
 * 2. Asset coverage   — (Plaid balances + other cash) ÷ student-loan balance
 *
 * Final score is clamped to [1, 100].
 */
export function calculateGlowScore(
  accounts: PlaidAccount[],
  profile: CollegeProfile
): number {
  let score = 50;

  // ── Pillar 1: cash-flow ratio (0–25 pts) ─────────────────────────────────
  const monthlyIncome = profile.monthlyIncome + profile.financialAid / 12;
  const monthlyExpenses = profile.monthlyRent + profile.monthlyTuition;

  if (monthlyExpenses > 0) {
    // ratio ≥ 2 (income is double expenses) → full 25 pts
    const cashFlowPts = Math.min(25, (monthlyIncome / monthlyExpenses / 2) * 25);
    score += cashFlowPts;
  } else if (monthlyIncome > 0) {
    // No expenses but there IS income → maximum cash-flow health
    score += 25;
  }

  // ── Pillar 2: asset coverage ratio (0–25 pts) ─────────────────────────────
  let plaidLiquid = 0;
  for (const acct of accounts) {
    if (isFidelityBrokerage(acct) || isFidelityDebit(acct)) {
      plaidLiquid += acct.balances.current ?? 0;
    }
  }
  const totalLiquid = plaidLiquid + profile.otherCash;
  const loans = profile.studentLoanBalance;

  if (loans > 0) {
    // ratio ≥ 1 (assets fully cover loans) → full 25 pts
    const coveragePts = Math.min(25, (totalLiquid / loans) * 25);
    score += coveragePts;
  } else if (totalLiquid > 0) {
    score += 25;
  }

  return Math.max(1, Math.min(100, Math.round(score)));
}

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
