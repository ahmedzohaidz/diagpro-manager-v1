import Link from "next/link";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

const QUICK_LINKS = [
  { href: "/", label: "الرئيسية", icon: "🏠", desc: "العودة للصفحة الرئيسية" },
  { href: "/services", label: "الخدمات", icon: "🛠️", desc: "تصفح جميع خدماتنا" },
  { href: "/book", label: "حجز موعد", icon: "📅", desc: "احجز موعد فحص أو صيانة" },
];

const ABOUT_POINTS = [
  { icon: "🛡️", text: "تشخيص دقيق بأحدث الأجهزة والبرمجيات" },
  { icon: "📋", text: "تقرير رقمي واضح لكل سيارة" },
  { icon: "⭐", text: "فنيون متخصصون في كهرباء السيارات الحديثة" },
];

const WORK_HOURS = [
  { day: "السبت - الخميس", time: "9:00 ص - 9:00 م" },
  { day: "الجمعة", time: "إجازة" },
];

export default function MorePage() {
  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0d0f] p-4 text-white sm:p-6">
      <header>
        <h1 className="text-2xl font-extrabold">المزيد</h1>
        <p className="mt-1 text-sm leading-relaxed text-white/60">
          روابط سريعة ومعلومات عن مركز التشخيص الاحترافي.
        </p>
      </header>

      {/* Quick links */}
      <section className="space-y-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#18181b] p-4 transition-colors hover:border-brand/40"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl"
              aria-hidden
            >
              {link.icon}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-extrabold">{link.label}</span>
              <span className="mt-0.5 block text-xs text-white/60">
                {link.desc}
              </span>
            </span>
            <span className="text-white/40" aria-hidden>
              ‹
            </span>
          </Link>
        ))}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/10 p-4 transition-colors hover:border-brand"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/20 text-2xl"
            aria-hidden
          >
            💬
          </span>
          <span className="flex-1">
            <span className="block text-sm font-extrabold text-brand">
              تواصل عبر واتساب
            </span>
            <span className="mt-0.5 block text-xs text-white/60">
              للاستفسارات السريعة والرد المباشر
            </span>
          </span>
          <span className="text-brand" aria-hidden>
            ‹
          </span>
        </a>
      </section>

      {/* About */}
      <section className="rounded-xl border border-white/10 bg-[#18181b] p-4">
        <h2 className="text-lg font-extrabold">عن المركز</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/60">
          مركز متخصص في تشخيص وبرمجة وصيانة كهرباء السيارات الحديثة، نهدف إلى
          تقديم تجربة موثوقة وشفافة لكل عميل.
        </p>
        <div className="mt-4 space-y-3">
          {ABOUT_POINTS.map((point) => (
            <div key={point.text} className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-base"
                aria-hidden
              >
                {point.icon}
              </span>
              <span className="text-xs font-bold text-white/80">
                {point.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Working hours */}
      <section className="rounded-xl border border-white/10 bg-[#18181b] p-4">
        <h2 className="text-lg font-extrabold">ساعات العمل</h2>
        <div className="mt-3 space-y-2">
          {WORK_HOURS.map((row) => (
            <div
              key={row.day}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0d0d0f] px-3 py-2 text-sm"
            >
              <span className="font-bold text-white/80">{row.day}</span>
              <span className="font-extrabold text-brand">{row.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
