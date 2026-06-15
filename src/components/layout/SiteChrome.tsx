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

  // Skip SiteHeader on home page (/)
  const skipHeader = pathname === "/";

  return (
    <>
      {!skipHeader && <SiteHeader />}
      <main className={skipHeader ? "w-full pb-[120px]" : "mx-auto w-full max-w-[430px] px-4 py-6 pb-[120px]"}>
        {children}
      </main>
      <BottomNav />
    </>
  );
}
