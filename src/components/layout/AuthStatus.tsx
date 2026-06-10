"use client";

import { useEffect, useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";

/**
 * Shows the logged-in staff email + a logout button. Renders nothing when no
 * one is logged in, so public pages (/, /book) are unaffected.
 */
export function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createAuthBrowserClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!email) return null;

  async function handleLogout() {
    const supabase = createAuthBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/admin/login");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-ink-soft sm:inline" dir="ltr">
        {email}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border-2 border-ink/20 bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-ink hover:bg-brand"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
