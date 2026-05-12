import { supabase } from "./supabaseClient";

// Verify the Supabase URL is present at runtime (first 10 chars only).
console.log(
  "[db] NEXT_PUBLIC_SUPABASE_URL prefix:",
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").slice(0, 10) || "(empty)"
);

// ── Row shape matching the user_profiles table ───────────────────────────────

export interface DbUserProfile {
  clerk_user_id: string;
  plaid_access_token: string | null;
  monthly_income: number;
  liquid_savings: number;
  student_loan_debt: number;
  credit_card_debt: number;
  expected_career: string | null;
}

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getUserProfile(
  clerkUserId: string
): Promise<DbUserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error) {
      // PGRST116 = row not found — that's OK, user just hasn't saved yet
      if (error.code === "PGRST116") return null;
      console.error("[db] getUserProfile error:", error.message);
      return null;
    }
    return data as DbUserProfile;
  } catch (err) {
    console.error("[db] getUserProfile threw:", err);
    return null;
  }
}

// ── Write ────────────────────────────────────────────────────────────────────

export async function upsertUserProfile(
  clerkUserId: string,
  updates: Partial<Omit<DbUserProfile, "clerk_user_id">>
): Promise<void> {
  try {
    const { error } = await supabase.from("user_profiles").upsert(
      { clerk_user_id: clerkUserId, ...updates },
      { onConflict: "clerk_user_id" }
    );
    if (error) console.error("[db] upsertUserProfile error:", error.message);
  } catch (err) {
    console.error("[db] upsertUserProfile threw:", err);
  }
}

export async function savePlaidToken(
  clerkUserId: string,
  accessToken: string
): Promise<void> {
  await upsertUserProfile(clerkUserId, { plaid_access_token: accessToken });
}
