"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";

/**
 * Admin dashboard shell (Phase 16 UI).
 *
 * Provides the dark charcoal + brand-yellow workspace chrome for every
 * /admin/* page: a branded header, admin navigation, and the signed-in
 * staff email with a logout control. Full RTL. The login page renders inside
 * a minimal centered variant (no nav) since no session exists yet.
 *
 * This layout owns the full viewport — SiteChrome skips the public marketing
 * header/bottom-nav on /admin routes.
 */

const ADMIN_NAV = [
  { href: "/admin/bookings", label: "الحجوزات" },
  { href: "/admin/booking-follow-up", label: "متابعة الحجز" },
  { href: "/admin/booking-supervisor", label: "مشرف الحجز" },
  { href: "/admin/work-orders", label: "أوامر العمل" },
];

function AdminLogout() {
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/admin/login");
  // The Phase 16 bookings dashboard is themed dark; other admin pages keep a
  // light content canvas so their existing styling stays readable unchanged.
  const isBookings = pathname?.startsWith("/admin/bookings");

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
            <span className="text-sm font-bold text-white/60">لوحة الإدارة</span>
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
            <Link href="/admin/bookings" className="flex items-center gap-2">
              <span className="inline-flex h-8 items-center rounded-md bg-brand px-2.5 text-base font-extrabold text-ink">
                DiagPro
              </span>
              <span className="text-sm font-bold text-white/60">لوحة الإدارة</span>
            </Link>
            <div className="sm:hidden">
              <AdminLogout />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="تنقل الإدارة">
              <ul className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
                {ADMIN_NAV.map((item) => {
                  const active = pathname?.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`rounded-md px-3 py-2 transition-colors ${
                          active
                            ? "bg-brand text-ink"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="hidden sm:block">
              <AdminLogout />
            </div>
          </div>
        </div>
      </header>

      {isBookings ? (
        <main className="mx-auto w-full max-w-6xl px-4 py-6 text-white">
          {children}
        </main>
      ) : (
        <main className="min-h-[calc(100vh-57px)] bg-neutral-50 text-ink">
          <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
        </main>
      )}
    </div>
  );
}
