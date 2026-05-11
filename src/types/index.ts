export interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
    iso_currency_code: string | null;
  };
  mask: string | null;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  category: string[] | null;
  merchant_name: string | null;
  payment_channel: string;
}

/** Financial snapshot for a first-year college student */
export interface CollegeProfile {
  // ── Income / Assets ──────────────────────────────────────
  monthlyIncome: number;       // part-time job, work-study, etc.
  financialAid: number;        // annual grants / scholarships (not loans)
  otherCash: number;           // Venmo, cash, other savings accounts

  // ── Expenses (for context / budgeting only) ───────────────
  monthlyRent: number;
  monthlyTuition: number;

  // ── Liabilities ───────────────────────────────────────────
  studentLoanBalance: number;
  creditCardDebt: number;      // manual CC balance (supplements Plaid data)
}

export const DEFAULT_COLLEGE_PROFILE: CollegeProfile = {
  monthlyIncome: 0,
  financialAid: 0,
  otherCash: 0,
  monthlyRent: 0,
  monthlyTuition: 0,
  studentLoanBalance: 0,
  creditCardDebt: 0,
};

export interface NetWorthBreakdown {
  // Assets
  fidelityBrokerage: number;
  fidelityDebit: number;
  otherCash: number;
  financialAid: number;
  totalAssets: number;

  // Liabilities
  studentLoans: number;
  creditCardDebt: number;      // combined: Plaid cards + manual
  totalLiabilities: number;

  // Summary
  total: number;               // totalAssets - totalLiabilities
}

export interface WealthDataPoint {
  year: number;
  wealth: number;
}

export type CareerPath = "starting_out" | "tech_engineering" | "business_finance";
export type InvestmentStrategy = "conservative" | "moderate" | "aggressive";

// ── Chat / Negotiation types ──────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  confidence_score?: number;
  feedback?: string[];
  timestamp: Date;
}

export interface GeminiNegotiationResponse {
  reply: string;
  confidence_score: number;    // 1–10
  feedback: string[];          // 1–2 actionable tips
}
