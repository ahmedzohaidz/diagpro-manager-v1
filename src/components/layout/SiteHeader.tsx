import Link from "next/link";
import { AuthStatus } from "@/components/layout/AuthStatus";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/book", label: "حجز موعد" },
  { href: "/admin/bookings", label: "الحجوزات" },
  { href: "/admin/booking-follow-up", label: "متابعة الحجز" },
  { href: "/admin/booking-supervisor", label: "مشرف الحجز" },
  { href: "/admin/work-orders", label: "أوامر العمل" },
];

export function SiteHeader() {
  return (
    <header className="border-b-2 border-ink bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-lg font-extrabold text-ink">
            DiagPro
          </span>
          <span className="text-sm font-bold text-ink-soft">إدارة الورشة</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav>
            <ul className="flex flex-wrap items-center gap-2 text-sm font-bold">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-md px-3 py-2 text-ink transition-colors hover:bg-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
