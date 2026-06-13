import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import { SERVICES } from "@/lib/services/data";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

const FEATURES = [
  { icon: "🛡️", title: "شفافية", desc: "تقرير واضح وأسعار عادلة" },
  { icon: "🧰", title: "أحدث الأجهزة", desc: "تقنيات فحص وبرمجة حديثة" },
  { icon: "📋", title: "تقرير رقمي", desc: "تقرير شامل وفوري وآمن" },
  { icon: "⭐", title: "خبرة عالية", desc: "فنيون متخصصون ومدربون" },
];

const JOURNEY_STEPS = [
  "احجز موعدك",
  "نراجع الطلب",
  "نستقبل السيارة",
  "نشخص بدقة",
  "نرسل التوصية",
  "تستلم سيارتك",
];

const PWA_FEATURES = [
  { icon: "➕", title: "إضافة للشاشة الرئيسية" },
  { icon: "🔔", title: "إشعارات مستقبلية" },
  { icon: "💬", title: "تحديثات واتساب" },
  { icon: "🚗", title: "متابعة حالة السيارة" },
];

const TRUST_STATS = [
  { value: "+10", label: "سنوات خبرة" },
  { value: "+25,000", label: "سيارة تم فحصها" },
  { value: "+15,000", label: "عميل راضٍ" },
  { value: "98%", label: "نسبة رضا العملاء" },
];

export default function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-12 rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 sm:px-6 py-6 sm:py-8 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rotate-45 bg-brand/20"
          aria-hidden
        />
        <span className="relative inline-block rounded-full bg-brand/20 px-4 py-2 text-sm font-bold text-brand">
          مركز التشخيص الاحترافي
        </span>
        <h1 className="relative mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-white">
          تشخيص دقيق <span className="text-brand">وبرمجة احترافية</span> لكهرباء
          السيارات الحديثة
        </h1>
        <p className="relative mt-4 text-sm sm:text-base leading-relaxed text-gray-300">
          مركز متخصص في تشخيص وبرمجة وصيانة كهرباء السيارات الحديثة بأجهزة
          متقدمة وتقرير واضح.
        </p>
        <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border-2 border-brand/40 bg-brand/10 px-4 py-2 text-sm font-bold text-brand">
          <span aria-hidden>⏱️</span>
          فحص ذكي خلال 15 دقيقة
        </div>
        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href="/book" className="block sm:inline-block flex-1 sm:flex-none">
            <Button className="w-full py-5 px-4 text-base sm:text-lg font-bold min-h-[56px] sm:min-h-[48px]">
              ✅ احجز الآن
            </Button>
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block sm:inline-block flex-1 sm:flex-none"
          >
            <Button
              variant="secondary"
              className="w-full py-5 px-4 text-base sm:text-lg font-bold min-h-[56px] sm:min-h-[48px]"
            >
              💬 واتساب
            </Button>
          </a>
        </div>
      </section>

      {/* Trust stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-5 sm:p-6 text-center sm:grid-cols-4">
        {TRUST_STATS.map((stat) => (
          <div key={stat.label} className="space-y-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm md:text-base leading-tight text-gray-400 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Feature highlights */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg sm:rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 sm:p-5 md:p-6 text-center shadow-sm hover:shadow-md hover:border-brand/40 transition-all min-h-[200px] sm:min-h-[220px] flex flex-col justify-center"
          >
            <div
              className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-brand/20 text-2xl sm:text-3xl"
              aria-hidden
            >
              {f.icon}
            </div>
            <div className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-bold text-white">
              {f.title}
            </div>
            <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-gray-400">
              {f.desc}
            </div>
          </div>
        ))}
      </section>

      {/* Main services */}
      <section>
        <div className="mb-6 flex items-center justify-between border-b-2 border-gray-700 pb-4">
          <h2 className="text-2xl font-extrabold text-white">خدماتنا الرئيسية</h2>
          <Link href="/services" className="text-sm font-bold text-brand hover:text-brand/80">
            عرض الكل ›
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {SERVICES.slice(0, 4).map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-lg sm:rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md hover:border-brand/40 transition-all min-h-[220px] justify-between"
            >
              <div>
                <span className="text-3xl sm:text-4xl block mb-3" aria-hidden>
                  {service.icon}
                </span>
                <span className="text-sm sm:text-base md:text-lg font-bold leading-snug text-white block">
                  {service.title}
                </span>
              </div>
              <Link href="/book" className="mt-4 block">
                <span className="block rounded-lg bg-brand px-4 py-3 sm:py-4 text-center text-xs sm:text-sm font-extrabold text-ink hover:bg-brand/90 transition-colors min-h-[48px] flex items-center justify-center">
                  احجز
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Journey steps */}
      <section>
        <div className="mb-6 border-b-2 border-gray-700 pb-4">
          <h2 className="text-2xl font-extrabold text-white">رحلة الخدمة معنا</h2>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3">
          {JOURNEY_STEPS.map((step, i) => (
            <div
              key={step}
              className="flex min-w-[140px] sm:min-w-[150px] flex-col items-center gap-3 rounded-lg sm:rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 sm:p-5 text-center shadow-sm hover:shadow-md hover:border-brand/40 transition-all"
            >
              <span className="flex h-12 w-12 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg sm:text-base font-extrabold text-ink shadow-lg">
                {i + 1}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Digital experience */}
      <section className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-white">تجربة رقمية أسرع</h2>
        <p className="mt-2 text-base text-gray-400">
          مزايا تسهّل متابعة حجزك والتواصل مع المركز.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
          {PWA_FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/40 p-4 text-center shadow-sm hover:shadow-md hover:border-brand/40 transition-all"
            >
              <span className="text-3xl" aria-hidden>
                {f.icon}
              </span>
              <span className="text-sm font-bold text-white">
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-lg sm:rounded-xl border-2 border-brand bg-gradient-to-br from-brand/20 to-brand/10 p-5 sm:p-6 md:p-8 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">جاهز تبدأ؟ احجز فحصك الآن</h2>
        <p className="mt-2 text-sm sm:text-base text-gray-300">اختر الوقت المناسب لك</p>
        <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/book" className="block sm:inline-block flex-1 sm:flex-none">
            <Button className="w-full py-5 px-4 text-base sm:text-lg font-bold min-h-[56px] sm:min-h-[48px]">
              ✅ احجز الآن
            </Button>
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block sm:inline-block flex-1 sm:flex-none"
          >
            <Button
              variant="secondary"
              className="w-full py-5 px-4 text-base sm:text-lg font-bold min-h-[56px] sm:min-h-[48px]"
            >
              💬 واتساب
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
