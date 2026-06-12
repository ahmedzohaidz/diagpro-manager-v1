"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * Switches the top-level chrome based on the route.
 *
 * Admin routes (/admin/*) render full-bleed so the admin layout
 * (src/app/admin/layout.tsx) can paint its own dark dashboard shell. Public
 * routes keep the marketing SiteHeader, a centered light content area, and the
 * mobile BottomNav.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Skip SiteChrome for admin and customer portal routes (they have their own layouts)
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/customer")) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
