import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

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
 * Phase 14B: this client is session-aware (createBrowserClient from
 * @supabase/ssr), so it shares the cookie-based session with
 * src/lib/supabase/authBrowserClient.ts. Authenticated admin requests are sent
 * as the `authenticated` role (subject to RLS + is_admin()), while requests
 * from a logged-out visitor (e.g. /book) run as `anon`, which can only call
 * the public.create_public_booking() RPC.
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

  client = createBrowserClient(url, key);
  return client;
}
