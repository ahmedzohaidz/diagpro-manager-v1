"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";

/**
 * Customer portal shell (Phase 20A).
 *
 * Provides a minimal RTL-ready layout for /customer/* routes.
 * Full viewport control — SiteChrome skips this on /customer routes.
 * Login page renders centered; authenticated pages have header + logout.
 */

function CustomerLogout() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createAuthBrowserClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setEmail(session?.user?.email ?? null);
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
    window.location.assign("/customer/login");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-white/50 sm:inline" dir="ltr">
        {email}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-brand hover:bg-brand hover:text-ink"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/customer/login");

  if (isLogin) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0d0d0f] px-4 py-10 text-white"
      >
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-lg font-extrabold text-ink">
              DiagPro
            </span>
            <span className="text-sm font-bold text-white/60">بوابة العميل</span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d0d0f] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0d0f]/95 backdrop-blur">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-brand/40 to-transparent" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Link href="/customer" className="flex items-center gap-2">
              <span className="inline-flex h-8 items-center rounded-md bg-brand px-2.5 text-base font-extrabold text-ink">
                DiagPro
              </span>
              <span className="text-sm font-bold text-white/60">بوابة العميل</span>
            </Link>
            <div className="sm:hidden">
              <CustomerLogout />
            </div>
          </div>

          <div className="hidden sm:block">
            <CustomerLogout />
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-57px)] bg-neutral-50 text-ink">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
