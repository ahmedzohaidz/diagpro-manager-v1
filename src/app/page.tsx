import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import { SERVICES } from "@/lib/services/data";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

const CURRENT_OFFERS = [
  {
    icon: "🔧",
    title: "فحص ذكي خلال 15 دقيقة",
    price: "99",
    badge: "العرض الأساسي",
  },
];

const SPECIAL_OFFERS = [
  {
    icon: "🔑",
    title: "برمجة وفحص وحدات التحكم ECU",
    desc: "برمجة وحدات التحكم الإلكترونية",
    price: "299",
    features: ["فحص وحدات التحكم الإلكترونية", "برمجة وتحديث حسب الطراز"],
  },
  {
    icon: "🚗",
    title: "تشخيص شامل قبل السفر",
    desc: "فحص شامل لجميع أنظمة السيارة",
    price: "249",
    features: ["فحص شامل لأنظمة السيارة", "تقرير مفصل بالحالة العامة"],
  },
  {
    icon: "📡",
    title: "باقة فحص ودسمة البطارية",
    desc: "فحص كامل مع خدمات إضافية",
    price: "199",
    features: ["فحص البطارية والتيار والفولتية", "ورسمة وتحديث حسب الطراز"],
  },
  {
    icon: "🔐",
    title: "برمجة المفاتيح والريموت",
    desc: "برمجة وحدات التحكم والمفاتيح",
    price: "199",
    features: ["برمجة جميع أنواع المفاتيح", "إضافة مفاتيح جديدة"],
  },
];

const BENEFITS = [
  {
    icon: "⏱️",
    title: "توفير الوقت",
    desc: "فحص سريع ودقيق",
  },
  {
    icon: "💰",
    title: "توفير المال",
    desc: "أسعار تنافسية وعروض حصرية",
  },
  {
    icon: "🖥️",
    title: "أجهزة متطورة",
    desc: "أحدث أجهزة الفحص والورشة",
  },
  {
    icon: "👨‍🔧",
    title: "خبرة واحترافية",
    desc: "فنيون متخصصون ومدربون",
  },
  {
    icon: "📋",
    title: "تقرير موثوق",
    desc: "تقرير شامل وموثوق",
  },
];

const TRUST_STATS = [
  { value: "+10", label: "سنوات خبرة" },
  { value: "+25,000", label: "سيارة تم فحصها" },
  { value: "+15,000", label: "عميل راضٍ" },
  { value: "98%", label: "نسبة رضا العملاء" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Hero Banner */}
      <section className="relative w-full px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                  عروضنا الحالية
                </h1>
                <div className="inline-block bg-brand/20 border-2 border-brand rounded-full px-4 py-2">
                  <p className="text-sm sm:text-base font-bold text-brand">
                    ⏰ عروض حصرية لفترة محدودة - لا تفوتها!
                  </p>
                </div>
              </div>

              {/* Main Offer */}
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-2 border-brand rounded-lg p-6 sm:p-8">
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-gray-300">فحص ذكي خلال</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl sm:text-6xl font-extrabold text-brand">15</span>
                    <span className="text-xl sm:text-2xl text-gray-300">دقيقة</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl sm:text-6xl font-extrabold text-brand">99</span>
                    <span className="text-xl sm:text-2xl text-gray-300">ريال فقط ✓</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/book" className="flex-1">
                  <Button className="w-full py-4 px-6 text-base sm:text-lg font-bold min-h-[56px]">
                    📅 احجز الآن
                  </Button>
                </Link>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full py-4 px-6 text-base sm:text-lg font-bold min-h-[56px]">
                    💬 واتساب
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Car Image Placeholder */}
            <div className="relative h-80 sm:h-96 lg:h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🚗</div>
                <p>صورة السيارة</p>
                <p className="text-sm text-gray-600">سيتم إضافة صورة احترافية</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="w-full px-4 py-8 sm:px-6 sm:py-12 bg-black/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">عروض مميزة لفترة محدودة</h2>
            <p className="text-gray-400 text-sm sm:text-base">تصفح جميع عروضنا الخاصة والحصرية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SPECIAL_OFFERS.map((offer, idx) => (
              <div
                key={idx}
                className="group rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 hover:border-brand/50 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 transition-all min-h-[280px] flex flex-col"
              >
                <div className="text-4xl mb-3">{offer.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{offer.desc}</p>

                <div className="my-4 flex-1">
                  <div className="text-3xl font-extrabold text-brand mb-2">
                    {offer.price} <span className="text-lg text-gray-400">ريال</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm text-gray-300">
                  {offer.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-brand mt-1">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/book" className="w-full">
                  <Button variant="secondary" className="w-full py-3 text-sm font-bold hover:bg-brand hover:text-black">
                    احجز
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Quality */}
      <section className="w-full px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {/* Quality Guarantee */}
            <div className="border-l-4 border-brand pl-6 py-4">
              <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">🛡️</span> ضمان الجودة
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ أجهزة فحص معتمدة</li>
                <li>✓ ضمان 100% عودة المال</li>
              </ul>
            </div>

            {/* Simple Terms */}
            <div className="border-l-4 border-brand pl-6 py-4">
              <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">📋</span> شروط بسيطة
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ العروض لا تشمل قطع</li>
                <li>✓ يمكن دمج العروض مع أخري</li>
              </ul>
            </div>

            {/* Offer Duration */}
            <div className="border-l-4 border-brand pl-6 py-4">
              <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">📅</span> مدة العروض
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ تنسري حتي 30 يونيو 2025</li>
              </ul>
            </div>
          </div>

          {/* Why Benefits */}
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">لماذا تستفيد من العرض؟</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {BENEFITS.map((benefit, idx) => (
                <div
                  key={idx}
                  className="text-center p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:border-brand/40 transition-all"
                >
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h4 className="font-bold text-sm sm:text-base mb-2">{benefit.title}</h4>
                  <p className="text-xs text-gray-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-gray-800/30 border border-gray-700 rounded-lg p-6 sm:p-8">
            {TRUST_STATS.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-brand mb-2">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full px-4 py-8 sm:px-6 sm:py-12 bg-black/50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6">
            احجز عرضك الآن
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            واستفد من أفضل الأسعار قبل انتهاء العروض
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="flex-1 sm:flex-none">
              <Button className="w-full py-4 px-8 text-base sm:text-lg font-bold min-h-[56px]">
                📅 احجز الآن
              </Button>
            </Link>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button variant="secondary" className="w-full py-4 px-8 text-base sm:text-lg font-bold min-h-[56px]">
                💬 واتساب
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
