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

function SectionEyebrow() {
  return (
    <div
      className="mb-2 h-px w-full bg-gradient-to-l from-brand/50 via-brand/10 to-transparent"
      aria-hidden
    />
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8 rounded-2xl border border-white/10 bg-[#0d0d0f] p-4 text-white sm:p-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1c1c1f] to-[#0d0d0f] p-5">
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rotate-45 bg-brand/15"
          aria-hidden
        />
        <span className="relative inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold text-ink">
          مركز التشخيص الاحترافي
        </span>
        <h1 className="relative mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">
          تشخيص دقيق <span className="text-brand">وبرمجة احترافية</span> لكهرباء
          السيارات الحديثة
        </h1>
        <p className="relative mt-3 text-sm leading-relaxed text-white/70">
          مركز متخصص في تشخيص وبرمجة وصيانة كهرباء السيارات الحديثة بأجهزة
          متقدمة وتقرير واضح.
        </p>
        <div className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand">
          <span aria-hidden>⏱️</span>
          فحص ذكي خلال 15 دقيقة
        </div>
        <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/book" className="block sm:inline-block">
            <Button className="w-full py-3.5 text-base sm:w-auto">
              احجز الآن
            </Button>
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block sm:inline-block"
          >
            <Button
              variant="secondary"
              className="w-full py-3.5 text-base sm:w-auto"
            >
              واتساب
            </Button>
          </a>
        </div>
      </section>

      {/* Trust stats */}
      <section className="grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-[#18181b] p-3 text-center">
        {TRUST_STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-sm font-extrabold text-brand sm:text-base">
              {stat.value}
            </div>
            <div className="mt-1 text-[10px] leading-tight text-white/60">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Feature highlights */}
      <section className="grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-white/10 bg-[#18181b] p-4 text-center"
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-xl"
              aria-hidden
            >
              {f.icon}
            </div>
            <div className="mt-2 text-sm font-extrabold text-brand">
              {f.title}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-white/60">
              {f.desc}
            </div>
          </div>
        ))}
      </section>

      {/* Main services */}
      <section>
        <SectionEyebrow />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">خدماتنا الرئيسية</h2>
          <Link href="/services" className="text-xs font-bold text-brand">
            عرض الكل ‹
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SERVICES.slice(0, 4).map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-xl border border-white/10 bg-[#18181b] p-3"
            >
              <span className="text-2xl" aria-hidden>
                {service.icon}
              </span>
              <span className="mt-2 text-sm font-bold leading-snug">
                {service.title}
              </span>
              <Link href="/book" className="mt-3 block">
                <span className="block rounded-md bg-brand px-3 py-2 text-center text-xs font-extrabold text-ink">
                  احجز
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Journey steps */}
      <section>
        <SectionEyebrow />
        <h2 className="mb-3 text-lg font-extrabold">رحلة الخدمة معنا</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {JOURNEY_STEPS.map((step, i) => (
            <div
              key={step}
              className="flex min-w-[110px] flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#18181b] p-3 text-center"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-ink shadow-[0_0_0_4px_rgba(255,209,0,0.12)]">
                {i + 1}
              </span>
              <span className="text-xs font-bold text-white/80">{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Digital experience */}
      <section className="rounded-xl border border-white/10 bg-[#18181b] p-4">
        <SectionEyebrow />
        <h2 className="text-lg font-extrabold">تجربة رقمية أسرع</h2>
        <p className="mt-1 text-xs text-white/60">
          مزايا تسهّل متابعة حجزك والتواصل مع المركز.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {PWA_FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-[#0d0d0f] p-3 text-center"
            >
              <span className="text-xl" aria-hidden>
                {f.icon}
              </span>
              <span className="text-xs font-bold text-white/80">
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-xl border-2 border-brand bg-gradient-to-br from-brand/15 to-transparent p-5 text-center">
        <h2 className="text-xl font-extrabold">جاهز تبدأ؟ احجز فحصك الآن</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/book" className="block sm:inline-block">
            <Button className="w-full py-3.5 text-base sm:w-auto">
              احجز الآن
            </Button>
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block sm:inline-block"
          >
            <Button
              variant="secondary"
              className="w-full py-3.5 text-base sm:w-auto"
            >
              واتساب
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
