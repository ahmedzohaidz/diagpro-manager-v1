import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy Supabase browser client for DiagPro Manager V1.
 *
 * Reads configuration from public environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * The client is created on first use (not at import time) so that local mode
 * and the build never instantiate it with missing config. It is only ever
 * called when NEXT_PUBLIC_DATA_MODE=supabase.
 *
 * Set these in a local `.env.local` file (see `.env.example`). Never commit
 * real keys.
 */

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "لم يتم ضبط إعدادات Supabase. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  // Pure anon data client: it must NOT adopt the auth session, so data
  // requests always use the `anon` role (which has the temporary 003 grants).
  // Auth/session is handled separately in src/lib/supabase/* via @supabase/ssr.
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
