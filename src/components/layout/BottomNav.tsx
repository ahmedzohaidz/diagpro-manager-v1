"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, LayoutGrid, Calendar, Tag, MoreHorizontal } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Home, position: "left" },
  { href: "/services", label: "الخدمات", icon: LayoutGrid, position: "left" },
  { href: "/book", label: "الحجز", icon: Calendar, position: "center", featured: true },
  { href: "/offers", label: "العروض", icon: Tag, position: "right" },
  { href: "/more", label: "المزيد", icon: MoreHorizontal, position: "right" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // على صفحة الحجز، يبقى مرئي دائمًا
      if (pathname === "/book") {
        setIsVisible(true);
        return;
      }

      // إخفاء عند التمرير للأسفل، إظهار عند التمرير للأعلى
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, pathname]);

  // Customer-facing navigation only — keep it off the admin area.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/customer/login")) {
    return null;
  }

  const leftItems = NAV_ITEMS.filter(item => item.position === "left" && !item.featured);
  const rightItems = NAV_ITEMS.filter(item => item.position === "right" && !item.featured);
  const featuredItem = NAV_ITEMS.find(item => item.featured);

  return (
    <nav
      aria-label="التنقل السفلي"
      className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 ease-out md:hidden ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur border-t border-white/10" />

      {/* Content */}
      <div className="relative px-4 py-2">
        <div className="max-w-[430px] mx-auto flex items-end justify-between gap-2">
          {/* Left Items */}
          <div className="flex gap-3">
            {leftItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-3 px-2 text-[11px] font-bold transition-colors rounded-lg ${
                    active ? "text-brand" : "text-white/50 hover:text-white/70"
                  }`}
                >
                  <Icon size={22} className="transition-colors" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Center Featured Button - Booking */}
          {featuredItem && (
            <Link
              href={featuredItem.href}
              className={`flex flex-col items-center justify-center -translate-y-4 transition-transform hover:scale-110 ${
                pathname === featuredItem.href ? "scale-110" : ""
              }`}
            >
              <div className="bg-brand hover:bg-yellow-400 text-black rounded-full p-4 shadow-lg shadow-brand/50">
                <featuredItem.icon size={26} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-brand mt-1">
                {featuredItem.label}
              </span>
            </Link>
          )}

          {/* Right Items */}
          <div className="flex gap-3">
            {rightItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-3 px-2 text-[11px] font-bold transition-colors rounded-lg ${
                    active ? "text-brand" : "text-white/50 hover:text-white/70"
                  }`}
                >
                  <Icon size={22} className="transition-colors" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
