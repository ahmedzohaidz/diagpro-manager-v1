"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client used ONLY for authentication (login/logout/session).
 *
 * It stores the session in cookies (via @supabase/ssr) so the middleware and
 * server can read it. It is intentionally separate from the data client in
 * `src/lib/supabaseClient.ts`, which stays a pure `anon` client so that existing
 * data reads/writes keep working under the temporary 003 anon grants (no RLS).
 */
export function createAuthBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
  );
}
