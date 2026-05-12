import type { CategorySummary } from "@/types";

const MOCK_MONTHLY_INCOME = 1200;

// Maps Plaid's primary category keys to campus-reality labels
const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DRINK: "Food & Drink",
  TRANSPORTATION: "Safe Transit (Uber/Lyft)",
  TRAVEL: "Travel",
  ENTERTAINMENT: "Social & Campus Life",
  PERSONAL_CARE: "Essentials & Self-Care",
  GENERAL_MERCHANDISE: "Shopping",
  HOME_IMPROVEMENT: "Home",
  MEDICAL: "Medical",
  EDUCATION: "Education",
  RENT_AND_UTILITIES: "Rent & Utilities",
  LOAN_PAYMENTS: "Loan Payments",
  BANK_FEES: "Bank Fees",
  INCOME: "Income",
  TRANSFER_IN: "Transfer In",
  TRANSFER_OUT: "Transfer Out",
  OTHER: "Other",
};

function toLabel(category: string): string {
  return (
    CATEGORY_LABELS[category] ??
    category
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Takes raw Plaid transactions and returns per-category spend aggregated
 * over the last 30 days, with each category's percentage of a $1,200/mo
 * mock income for hackathon demo purposes.
 *
 * Plaid amounts: positive = money leaving the account (a debit/spend).
 * Negative amounts (credits/refunds) are excluded.
 */
export function aggregateTransactions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[]
): CategorySummary[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const tx of transactions) {
    // Skip credits/refunds and transfers into the account
    if (tx.amount <= 0) continue;

    const txDate = new Date(tx.date);
    if (txDate < cutoff) continue;

    const category: string =
      tx.personal_finance_category?.primary ??
      tx.category?.[0] ??
      "OTHER";

    totals[category] = (totals[category] ?? 0) + tx.amount;
    counts[category] = (counts[category] ?? 0) + 1;
  }

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      label: toLabel(category),
      total: Math.round(total * 100) / 100,
      percentage: Math.round((total / MOCK_MONTHLY_INCOME) * 1000) / 10,
      transactionCount: counts[category],
    }))
    .sort((a, b) => b.total - a.total);
}
