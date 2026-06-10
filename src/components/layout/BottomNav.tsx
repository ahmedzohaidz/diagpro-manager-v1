"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: "🏠" },
  { href: "/services", label: "الخدمات", icon: "🛠️" },
  { href: "/book", label: "الحجز", icon: "📅" },
];

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

export function BottomNav() {
  const pathname = usePathname();

  // Customer-facing navigation only — keep it off the admin area.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0d0d0f] [padding-bottom:env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-brand/40 to-transparent" />
      <div className="mx-auto grid max-w-5xl grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] font-bold transition-colors ${
                active ? "text-brand" : "text-white/50"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-colors ${
                  active ? "bg-brand text-ink" : "text-white/60"
                }`}
                aria-hidden
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2 text-[11px] font-bold text-white/50 transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-base text-white/60" aria-hidden>
            💬
          </span>
          تواصل
        </a>
      </div>
    </nav>
  );
}
