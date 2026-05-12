import { NextRequest, NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { aggregateTransactions } from "@/lib/aggregateTransactions";

const plaidConfig = new Configuration({
  basePath:
    PlaidEnvironments[
      (process.env.PLAID_ENV as keyof typeof PlaidEnvironments) ?? "sandbox"
    ],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json(
        { error: "Missing access_token" },
        { status: 400 }
      );
    }

    // Paginate through all available transactions using transactionsSync.
    // For a fresh item this returns all historical data; for returning calls
    // a stored cursor would be passed in to get only deltas.
    let cursor: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allAdded: any[] = [];

    do {
      const response = await plaidClient.transactionsSync({
        access_token,
        ...(cursor ? { cursor } : {}),
      });

      allAdded.push(...response.data.added);
      cursor = response.data.next_cursor;

      if (!response.data.has_more) break;
    } while (true);

    const summary = aggregateTransactions(allAdded);

    return NextResponse.json({ summary, total_transactions: allAdded.length });
  } catch (error) {
    console.error("Plaid transactions sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync transactions" },
      { status: 500 }
    );
  }
}
