import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import { SERVICES } from "@/lib/services/data";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

const SPECIAL_OFFERS = [
  {
    icon: "🔑",
    title: "برمجة وفحص وحدات التحكم",
    price: "299",
    discount: "",
    features: ["فحص وحدات التحكم الإلكترونية", "برمجة وتحديث حسب الطراز"],
  },
  {
    icon: "📡",
    title: "تشخيص شامل قبل السفر",
    price: "249",
    discount: "",
    features: ["فحص شامل لأنظمة السيارة", "تقرير مفصل بالحالة العامة"],
  },
  {
    icon: "🚗",
    title: "باقة فحص ودسمة البطارية",
    price: "199",
    discount: "",
    features: ["فحص البطارية والتيار والفولتية", "ورسمة وتحديث حسب الطراز"],
  },
  {
    icon: "🔐",
    title: "برمجة المفاتيح والريموت",
    price: "199",
    discount: "خصم 30%",
    features: ["برمجة جميع أنواع المفاتيح", "إضافة مفاتيح جديدة"],
  },
];

const BENEFITS = [
  { icon: "⏱️", title: "توفير الوقت", desc: "فحص سريع ودقيق" },
  { icon: "💰", title: "توفير المال", desc: "أسعار تنافسية وعروض حصرية" },
  { icon: "🖥️", title: "أجهزة متطورة", desc: "أحدث أجهزة الفحص والورشة" },
  { icon: "👨‍🔧", title: "خبرة واحترافية", desc: "فنيون متخصصون ومدربون" },
  { icon: "📋", title: "تقرير موثوق", desc: "تقرير شامل وموثوق" },
];

const TRUST_STATS = [
  { icon: "⭐", value: "+10", label: "سنوات خبرة" },
  { icon: "🚗", value: "+25,000", label: "سيارة تم فحصها" },
  { icon: "👥", value: "+15,000", label: "عميل راضٍ" },
  { icon: "🛡️", value: "98%", label: "نسبة رضا العملاء" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative w-full h-screen md:h-96 bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />

        {/* Background Image Area */}
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-600">
          <div className="text-6xl opacity-30">🏭 صورة الورشة والسيارة</div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-end px-4 sm:px-8">
          <div className="max-w-2xl text-right space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              عروضنا الحالية
            </h1>

            {/* Offer Badge */}
            <div className="inline-block bg-brand/90 rounded-full px-6 py-3 text-black font-bold text-lg">
              ⏰ عروض حصرية لفترة محدودة - لا تفوتها!
            </div>

            {/* Main Offer Box */}
            <div className="border-2 border-brand rounded-2xl bg-black/60 p-8 space-y-4">
              <div className="flex justify-end items-baseline gap-3 text-right">
                <span className="text-base text-gray-400">فحص ذكي خلال</span>
                <span className="text-6xl font-extrabold text-brand">15</span>
                <div className="text-right">
                  <p className="text-2xl font-bold">دقيقة</p>
                  <p className="text-sm text-gray-400">⏱️</p>
                </div>
              </div>

              <div className="flex justify-end items-baseline gap-3 text-right border-t border-brand/30 pt-4">
                <span className="text-base text-gray-400">بـ</span>
                <span className="text-6xl font-extrabold text-brand">99</span>
                <span className="text-2xl font-bold">ريال</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-end">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg min-h-[56px]">
                  💬 واتساب
                </Button>
              </a>
              <Link href="/book">
                <Button className="bg-brand hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg min-h-[56px]">
                  📅 احجز الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="w-full px-4 sm:px-8 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-right">
            عروض مميزة لفترة محدودة
          </h2>
          <p className="text-gray-400 mb-12 text-right">
            تصفح جميع عروضنا الخاصة والحصرية
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPECIAL_OFFERS.map((offer, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-brand/50 transition-all"
              >
                {/* Image Placeholder */}
                <div className="w-full h-40 bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-4xl opacity-50">
                  {offer.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-right mb-2">
                  {offer.title}
                </h3>

                {/* Discount Badge */}
                {offer.discount && (
                  <div className="inline-block bg-brand text-black px-3 py-1 rounded-full text-sm font-bold mb-3">
                    خصم {offer.discount}
                  </div>
                )}

                {/* Price */}
                <div className="text-right mb-4">
                  <span className="text-3xl font-extrabold text-brand">
                    {offer.price}
                  </span>
                  <span className="text-gray-400"> ريال</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 text-right">
                  {offer.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-center justify-end gap-2">
                      <span>{feature}</span>
                      <span className="text-brand">✓</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link href="/book" className="w-full block">
                  <button className="w-full bg-brand/20 hover:bg-brand/40 text-brand border border-brand rounded-lg py-3 font-bold transition-all">
                    احجز
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Terms Section */}
      <section className="w-full px-4 sm:px-8 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quality Guarantee */}
            <div className="bg-black/50 border-r-4 border-brand p-6 rounded-lg text-right">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-end gap-3">
                🛡️ ضمان الجودة
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ أجهزة فحص معتمدة</li>
                <li>✓ ضمان 100% عودة المال</li>
              </ul>
            </div>

            {/* Simple Terms */}
            <div className="bg-black/50 border-r-4 border-brand p-6 rounded-lg text-right">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-end gap-3">
                📋 شروط بسيطة
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ العروض لا تشمل قطع</li>
                <li>✓ يمكن دمج العروض مع أخرى</li>
              </ul>
            </div>

            {/* Duration */}
            <div className="bg-black/50 border-r-4 border-brand p-6 rounded-lg text-right">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-end gap-3">
                📅 مدة العروض
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ تنسري حتي 30 يونيو 2025</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Benefits Section */}
      <section className="w-full px-4 sm:px-8 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-right">
            لماذا تستفيد من العرض؟
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center hover:border-brand/50 transition-all"
              >
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h4 className="font-bold text-lg mb-2 text-right">{benefit.title}</h4>
                <p className="text-sm text-gray-400 text-right">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full px-4 sm:px-8 py-16 bg-gradient-to-r from-black via-gray-900 to-black border-b-8 border-brand">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Image */}
          <div className="w-full md:w-1/3 h-64 bg-gray-800 rounded-lg flex items-center justify-center opacity-50">
            <div className="text-6xl">🚗</div>
          </div>

          {/* Content */}
          <div className="w-full md:w-2/3 text-right space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              احجز عرضك الآن
            </h2>
            <p className="text-gray-300 text-lg">
              واستفد من أفضل الأسعار قبل انتهاء العروض
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg min-h-[56px]">
                  💬 واتساب
                </Button>
              </a>
              <Link href="/book">
                <Button className="bg-brand hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg min-h-[56px]">
                  📅 احجز الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="w-full px-4 sm:px-8 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-right">
            ثقة عملائنا هي نجاحنا
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-8 text-center"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-extrabold text-brand mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="w-full px-4 sm:px-8 py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          {/* Location */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-brand">📍 موقعنا</h3>
            <p className="text-sm text-gray-400">
              جدة - حي الجميرة - شارع الأمير محمد بن سلمان
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-brand">📞 تواصل معنا</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>☎️ 055 123 4567</p>
              <a href={WHATSAPP_LINK} className="text-green-500 hover:text-green-400">
                💬 واتساب
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-brand">⏰ ساعات العمل</h3>
            <p className="text-sm text-gray-400">
              السبت - الخميس: 9:00 - 21:00
              <br />
              الجمعة: 13:00 - 21:00
            </p>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="w-full px-4 sm:px-8 py-6 bg-black border-t border-gray-800 text-center text-sm text-gray-500">
        <p>© 2025 مركز التشخيص الاحترافي. جميع الحقوق محفوظة.</p>
      </section>
    </div>
  );
}
