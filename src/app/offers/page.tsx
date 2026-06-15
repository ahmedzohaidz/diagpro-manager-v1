'use client';

import Link from "next/link";
import { useState } from "react";
import { NavigationDrawer } from "@/components/layout/NavigationDrawer";
import {
  Zap,
  KeyRound,
  Radar,
  Cpu,
  CheckCircle,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Calendar,
  Gauge,
  Clock,
  Award,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن العروض المتاحة."
);

const FEATURED_OFFERS = [
  {
    id: 1,
    title: "عرض التشخيص الشامل",
    badge: "الأكثر طلبًا",
    oldPrice: 350,
    newPrice: 249,
    discount: "خصم 30%",
    description: "فحص كمبيوتر شامل + قراءة الأعطال + تقرير مبدئي واضح.",
    icon: Cpu,
    benefits: ["لمبة المكينة", "ضعف العزم", "صرفية البنزين"],
    slug: "diagnostic",
  },
  {
    id: 2,
    title: "عرض برمجة المفاتيح",
    badge: "مناسب للسيارات الحديثة",
    oldPrice: 400,
    newPrice: 299,
    discount: "وفر 25%",
    description: "برمجة مفتاح أو ريموت حسب نوع السيارة والنظام.",
    icon: KeyRound,
    benefits: ["مفتاح جديد", "ريموت لا يعمل", "إضافة مفتاح احتياطي"],
    slug: "key-programming",
  },
  {
    id: 3,
    title: "فحص كهرباء شامل",
    badge: "للأعطال المتقطعة",
    oldPrice: 400,
    newPrice: 319,
    discount: "خصم خاص",
    description: "تشخيص أعطال الكهرباء والحساسات والأنظمة الإلكترونية بدقة.",
    icon: Zap,
    benefits: ["أعطال متقطعة", "مشاكل تشغيل", "لمبات تحذير"],
    slug: "electrical-diagnosis",
  },
];

const ALL_OFFERS = [
  {
    id: 1,
    category: "تشخيص",
    title: "عرض التشخيص الشامل",
    oldPrice: 350,
    newPrice: 249,
    duration: "30-60 دقيقة",
    includes: "فحص كمبيوتر + قراءة أعطال + تقرير مبدئي",
    slug: "diagnostic",
  },
  {
    id: 2,
    category: "برمجة",
    title: "عرض برمجة المفاتيح",
    oldPrice: 400,
    newPrice: 299,
    duration: "20-60 دقيقة",
    includes: "برمجة مفتاح أو ريموت حسب نوع السيارة",
    slug: "key-programming",
  },
  {
    id: 3,
    category: "كهرباء",
    title: "فحص كهرباء شامل",
    oldPrice: 400,
    newPrice: 319,
    duration: "45-90 دقيقة",
    includes: "فحص كهرباء + حساسات + أنظمة إلكترونية",
    slug: "electrical-diagnosis",
  },
  {
    id: 4,
    category: "قبل السفر",
    title: "فحص قبل السفر",
    newPrice: 199,
    duration: "30-45 دقيقة",
    includes: "فحص كمبيوتر + بطارية + شحن + مؤشرات أعطال",
    slug: "travel-check",
  },
  {
    id: 5,
    category: "صيانة",
    title: "عرض التصفية الذكية",
    newPrice: "يبدأ من 250",
    duration: "حسب الحالة",
    includes: "فحص + تنظيف/تهيئة حسب حالة السيارة",
    slug: "smart-tuneup",
  },
  {
    id: 6,
    category: "تشخيص",
    title: "فحص ناقل الحركة الأوتوماتيكي",
    newPrice: 299,
    duration: "45-90 دقيقة",
    includes: "تشخيص النتعة، التأخير، الحرارة، لمبة القير",
    slug: "transmission-check",
  },
];

const CATEGORIES = ["الكل", "تشخيص", "برمجة", "كهرباء", "صيانة", "قبل السفر"];

const WHY_DIFFERENT = [
  {
    icon: Cpu,
    title: "تشخيص قبل الإصلاح",
    description: "نبدأ بفحص واضح قبل أي قرار تغيير قطع.",
  },
  {
    icon: CheckCircle,
    title: "تقرير واضح",
    description: "نعطيك نتيجة مفهومة وتوصية مباشرة.",
  },
  {
    icon: Award,
    title: "موافقة قبل التنفيذ",
    description: "لا يتم أي إصلاح إلا بعد موافقتك.",
  },
  {
    icon: Gauge,
    title: "أسعار واضحة",
    description: "أي تكلفة إضافية توضّح لك مسبقًا.",
  },
];

const BOOKING_STEPS = [
  { number: 1, title: "اختر العرض المناسب" },
  { number: 2, title: "اضغط احجز العرض" },
  { number: 3, title: "حدد بياناتك وموعدك" },
  { number: 4, title: "نؤكد حجزك عبر واتساب" },
];

const FAQS = [
  {
    q: "هل العرض يشمل الإصلاح؟",
    a: "العرض يشمل التشخيص أو الخدمة المذكورة فقط. الإصلاح أو القطع يتم توضيحها بعد الفحص وبموافقة العميل.",
  },
  {
    q: "هل السعر ثابت لكل السيارات؟",
    a: "السعر تقديري وقد يختلف حسب نوع السيارة والنظام وحالة العطل.",
  },
  {
    q: "هل أحتاج حجز موعد؟",
    a: "نعم، الحجز يساعدنا نخدمك أسرع ونجهز الفني والجهاز المناسب.",
  },
  {
    q: "هل يتم تغيير قطع بدون موافقة؟",
    a: "لا. لا يتم تغيير أي قطعة أو تنفيذ إصلاح إلا بعد توضيح السبب والتكلفة وموافقتك.",
  },
  {
    q: "هل أحصل على تقرير؟",
    a: "نعم، حسب نوع العرض يتم توضيح نتيجة الفحص والتوصية بشكل واضح.",
  },
];

export default function OffersPage() {
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filteredOffers =
    activeCategory === "الكل"
      ? ALL_OFFERS
      : ALL_OFFERS.filter((offer) => offer.category === activeCategory);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 py-4 h-16 max-w-[430px] mx-auto w-full">
          <div className="flex-1 flex justify-end">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
              <Stethoscope size={20} className="text-black" />
            </div>
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-right">العروض</h1>
          </div>
          <div className="flex-1 flex justify-start">
            <NavigationDrawer />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-32">
        {/* Hero Section */}
        <section className="px-4 py-6 bg-black relative">
          <div className="max-w-[430px] mx-auto text-center">
            <h2 className="text-2xl font-extrabold mb-3 leading-tight">
              عروض تشخيص وبرمجة ذكية
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              وفّر تكلفة الإصلاح العشوائي وابدأ بتشخيص واضح قبل تغيير أي قطعة.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <Link href="/book" className="w-full">
                <button className="w-full bg-brand hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Calendar size={20} />
                  احجز عرض الآن
                </button>
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={20} />
                  واتساب
                </button>
              </a>
            </div>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <span className="inline-block bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
                عروض لفترة محدودة
              </span>
              <span className="inline-block bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
                بدون تغيير قطع بالتخمين
              </span>
            </div>
          </div>
        </section>

        {/* Featured Offers */}
        <section className="px-4 py-6 bg-black">
          <div className="max-w-[430px] mx-auto">
            <h3 className="text-lg font-bold mb-4 text-right">العروض المميزة</h3>
            <div className="space-y-4">
              {FEATURED_OFFERS.map((offer) => {
                const Icon = offer.icon;
                return (
                  <div key={offer.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon size={28} className="text-brand flex-shrink-0 mt-1" />
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs bg-brand text-black px-2 py-1 rounded font-bold">
                            {offer.badge}
                          </span>
                          <h4 className="font-bold text-sm">{offer.title}</h4>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{offer.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded">
                        {offer.discount}
                      </span>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 line-through">{offer.oldPrice} ر.س</span>
                        <p className="text-lg font-bold text-brand">{offer.newPrice} ر.س</p>
                      </div>
                    </div>
                    <ul className="text-xs text-gray-300 mb-3 text-right space-y-1">
                      {offer.benefits.map((benefit, idx) => (
                        <li key={idx}>✓ {benefit}</li>
                      ))}
                    </ul>
                    <Link href={`/book?offer=${offer.slug}`} className="w-full">
                      <button className="w-full bg-brand hover:bg-yellow-500 text-black font-bold py-2 rounded text-sm transition-colors">
                        احجز العرض
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 py-4 bg-black">
          <div className="max-w-[430px] mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? "bg-brand text-black"
                      : "bg-gray-900 text-gray-400 border border-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All Offers Grid */}
        <section className="px-4 py-6 bg-black">
          <div className="max-w-[430px] mx-auto">
            <div className="grid grid-cols-1 gap-4">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-right mb-3">
                    <span className="text-xs text-brand font-bold">{offer.category}</span>
                    <h4 className="font-bold text-sm mt-1">{offer.title}</h4>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    {offer.oldPrice && (
                      <span className="text-xs text-gray-500 line-through">{offer.oldPrice} ر.س</span>
                    )}
                    <p className="text-lg font-bold text-brand">{offer.newPrice} ر.س</p>
                  </div>
                  <div className="text-xs text-gray-400 mb-3 space-y-1">
                    <p>⏱️ {offer.duration}</p>
                    <p>✓ {offer.includes}</p>
                  </div>
                  <Link href={`/book?offer=${offer.slug}`} className="w-full">
                    <button className="w-full bg-brand hover:bg-yellow-500 text-black font-bold py-2 rounded text-sm transition-colors">
                      احجز العرض
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Different */}
        <section className="px-4 py-6 bg-black">
          <div className="max-w-[430px] mx-auto">
            <h3 className="text-lg font-bold mb-4 text-right">لماذا عروضنا مختلفة؟</h3>
            <div className="grid grid-cols-2 gap-3">
              {WHY_DIFFERENT.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <Icon size={24} className="text-brand mb-2" />
                    <h4 className="font-bold text-sm text-right mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-400 text-right">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Booking Steps */}
        <section className="px-4 py-6 bg-black">
          <div className="max-w-[430px] mx-auto">
            <h3 className="text-lg font-bold mb-4 text-right">كيف تحجز العرض؟</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="space-y-3">
                {BOOKING_STEPS.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-right">
                    <span className="w-8 h-8 bg-brand text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {step.number}
                    </span>
                    <p className="text-sm text-gray-300">{step.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="px-4 py-6 bg-black">
          <div className="max-w-[430px] mx-auto">
            <h3 className="text-lg font-bold mb-4 text-right flex items-center gap-2 justify-end">
              <AlertCircle size={20} className="text-brand" />
              ملاحظات مهمة قبل الحجز
            </h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <ul className="space-y-2 text-right text-sm text-gray-300">
                <li>• الأسعار تقديرية وقد تختلف حسب نوع السيارة وحالة العطل.</li>
                <li>• العروض لا تشمل قطع الغيار إلا إذا ذُكر ذلك صراحة.</li>
                <li>• لا يتم تنفيذ أي إصلاح إلا بعد التشخيص وموافقة العميل.</li>
                <li>• بعض خدمات البرمجة تعتمد على توفر النظام والدعم الفني.</li>
                <li>• مدة الفحص تقديرية وقد تزيد حسب صعوبة العطل.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="px-4 py-6 bg-black">
          <div className="max-w-[430px] mx-auto">
            <h3 className="text-lg font-bold mb-4 text-right flex items-center gap-2 justify-end">
              <HelpCircle size={20} className="text-brand" />
              الأسئلة الشائعة
            </h3>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-4 group cursor-pointer">
                  <summary className="font-bold text-sm text-right flex items-center justify-between gap-2">
                    {faq.q}
                    <span className="text-brand group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-xs text-gray-400 mt-2 text-right">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 bg-black">
        <div className="max-w-[430px] mx-auto">
          <Link href="/book" className="block w-full">
            <button className="w-full bg-brand hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Calendar size={20} />
              احجز عرضك الآن
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
