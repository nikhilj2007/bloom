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

export interface ManualCashEntry {
  id: string;
  label: string;
  amount: number;
}

export interface NetWorthBreakdown {
  fidelityBrokerage: number;
  fidelityDebit: number;
  otherCash: number;
  creditCardDebt: number;
  total: number;
}

export interface WealthDataPoint {
  year: number;
  wealth: number;
}

export type CareerPath = "starting_out" | "tech_engineering" | "business_finance";
export type InvestmentStrategy = "conservative" | "moderate" | "aggressive";
