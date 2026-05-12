import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — defers client creation until first use so that
// Next.js has had a chance to populate process.env on the server.
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `[supabaseClient] Missing env vars — ` +
        `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl ?? "undefined"}, ` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? "<set>" : "undefined"}`
    );
  }

  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

// Backwards-compat named export used by the rest of the codebase.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
