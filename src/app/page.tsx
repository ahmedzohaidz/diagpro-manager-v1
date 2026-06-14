'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import { SERVICES } from "@/lib/services/data";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

const HERO_CARDS = [
  {
    icon: "🔧",
    title: "فحص ذكي",
    description: "15 دقيقة",
    price: "99",
    image: "🚗",
    discount: "",
  },
  {
    icon: "🔑",
    title: "برمجة ECU",
    description: "وحدات التحكم",
    price: "299",
    image: "💻",
    discount: "",
  },
  {
    icon: "📡",
    title: "فحص شامل",
    description: "قبل السفر",
    price: "249",
    image: "🛠️",
    discount: "",
  },
  {
    icon: "🚗",
    title: "فحص البطارية",
    description: "والدسمة",
    price: "199",
    image: "🔋",
    discount: "",
  },
  {
    icon: "🔐",
    title: "برمجة المفاتيح",
    description: "والريموت",
    price: "199",
    image: "🔑",
    discount: "30%",
  },
  {
    icon: "⚙️",
    title: "فحص المحرك",
    description: "تشخيص شامل",
    price: "179",
    image: "⚙️",
    discount: "",
  },
  {
    icon: "🔋",
    title: "فحص الأنظمة",
    description: "جميع الأنظمة",
    price: "159",
    image: "📊",
    discount: "",
  },
  {
    icon: "📊",
    title: "تقرير مفصل",
    description: "رقمي وآمن",
    price: "مجاني",
    image: "📋",
    discount: "",
  },
];

const TESTIMONIALS = [
  {
    name: "أحمد السعيدي",
    rating: 5,
    text: "خدمة احترافية جداً وسعر مناسب جداً",
    car: "BMW X5",
  },
  {
    name: "فاطمة الزهراني",
    rating: 5,
    text: "فريق عمل رائع وخدمة سريعة",
    car: "Mercedes C-Class",
  },
  {
    name: "محمد العتيبي",
    rating: 5,
    text: "أفضل مركز تشخيص في جدة",
    car: "Audi A4",
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

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endDate = new Date("2025-06-30");
      const diff = Math.max(0, endDate.getTime() - now.getTime());

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2 justify-center items-center text-sm">
      <span className="bg-red-600 px-3 py-2 rounded font-bold">{timeLeft.days}</span>
      <span className="text-gray-400">أيام</span>
      <span className="bg-red-600 px-3 py-2 rounded font-bold">{timeLeft.hours}</span>
      <span className="text-gray-400">ساعات</span>
      <span className="bg-red-600 px-3 py-2 rounded font-bold">{timeLeft.minutes}</span>
      <span className="text-gray-400">دقائق</span>
    </div>
  );
}

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${darkMode ? 'bg-black/80 border-b border-gray-800' : 'bg-white/80 border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <Link href="/book">
            <Button className="bg-brand hover:bg-yellow-500 text-black font-bold">
              📅 احجز الآن
            </Button>
          </Link>
        </div>
      </header>

      {/* Floating CTA Button */}
      <div className="fixed bottom-8 right-4 z-40 flex flex-col gap-3">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center text-2xl shadow-lg animate-bounce"
        >
          💬
        </button>
        <Link href="/book" className="w-14 h-14 rounded-full bg-brand hover:bg-yellow-500 text-black flex items-center justify-center text-2xl shadow-lg font-bold">
          ✓
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative w-full pt-24 pb-12 px-4 sm:px-8 bg-gradient-to-b from-gray-900 via-black to-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-right mb-12 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-brand to-yellow-300 bg-clip-text text-transparent">
              عروضنا الحالية
            </h1>
            <div className="inline-block bg-brand/90 rounded-full px-6 py-3 text-black font-bold text-lg mb-6 animate-pulse">
              ⏰ عروض حصرية لفترة محدودة - لا تفوتها!
            </div>
            <div className="mt-4">
              <CountdownTimer />
            </div>
          </div>

          {/* 8 Cards Grid with Glass Morphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {HERO_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-brand/30 hover:border-brand rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/10 group-hover:to-brand/20 transition-all"></div>

                <div className="relative z-10">
                  {/* Image/Icon */}
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {card.image}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-6">
                    {card.description}
                  </p>

                  {/* Price Section */}
                  <div className="mb-6 pb-6 border-b border-gray-700">
                    {card.price === "مجاني" ? (
                      <div className="text-3xl font-extrabold text-brand animate-pulse">
                        ✅ {card.price}
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-extrabold text-brand">
                          {card.price}
                        </span>
                        <span className="text-sm text-gray-400">ريال</span>
                      </div>
                    )}
                    {card.discount && (
                      <div className="text-xs text-red-400 font-bold mt-2 animate-bounce">
                        🔴 خصم {card.discount}
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <Link href="/book" className="block w-full">
                    <button className="w-full bg-gradient-to-r from-brand to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-bold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand/50">
                      احجز الآن ✨
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons Below Grid */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg min-h-[56px] shadow-lg hover:shadow-green-600/50">
                💬 واتساب
              </Button>
            </a>
            <Link href="/book">
              <Button className="bg-brand hover:bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg min-h-[56px] shadow-lg hover:shadow-brand/50">
                📅 احجز الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quality & Terms Section */}
      <section className={`w-full px-4 sm:px-8 py-12 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🛡️", title: "ضمان الجودة", items: ["✓ أجهزة فحص معتمدة", "✓ ضمان 100% عودة المال"] },
              { icon: "📋", title: "شروط بسيطة", items: ["✓ العروض لا تشمل قطع", "✓ يمكن دمج العروض مع أخرى"] },
              { icon: "📅", title: "مدة العروض", items: ["✓ تنسري حتي 30 يونيو 2025"] },
            ].map((section, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-black/50 border-b-4 border-brand' : 'bg-white border-l-4 border-brand'} p-6 rounded-lg text-right transition-all duration-300 hover:shadow-lg`}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center justify-end gap-3">
                  <span>{section.icon}</span>
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm">
                  {section.items.map((item, i) => (
                    <li key={i} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Benefits Section */}
      <section className={`w-full px-4 sm:px-8 py-16 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-12 text-right bg-gradient-to-r from-brand to-yellow-300 bg-clip-text text-transparent">
            لماذا تستفيد من العرض؟
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gray-900 border-gray-800 hover:border-brand/50' : 'bg-gray-50 border-gray-200 hover:border-brand/50'} border rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-5xl mb-3 animate-bounce" style={{ animationDelay: `${idx * 100}ms` }}>
                  {benefit.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`w-full px-4 sm:px-8 py-16 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-12 text-right">
            آراء عملائنا الراضين
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-8 text-right transition-all duration-300 hover:shadow-lg hover:shadow-brand/20`}
              >
                <div className="flex justify-end gap-1 mb-4">
                  {Array(testimonial.rating).fill("⭐")}
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 italic`}>
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="font-bold text-brand">{testimonial.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {testimonial.car}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`w-full px-4 sm:px-8 py-16 ${darkMode ? 'bg-gradient-to-r from-black via-gray-900 to-black border-b-8 border-brand' : 'bg-gradient-to-r from-gray-50 to-white'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="w-full md:w-1/3 h-64 rounded-lg flex items-center justify-center text-8xl opacity-50 animate-float">
            🚗
          </div>

          <div className="w-full md:w-2/3 text-right space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold">
              احجز عرضك الآن
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              واستفد من أفضل الأسعار قبل انتهاء العروض
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg min-h-[56px]">
                  💬 واتساب
                </Button>
              </a>
              <Link href="/book">
                <Button className="bg-brand hover:bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg min-h-[56px]">
                  📅 احجز الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className={`w-full px-4 sm:px-8 py-16 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-12 text-right">
            ثقة عملائنا هي نجاحنا
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-8 text-center transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-6xl mb-4">{stat.icon}</div>
                <div className="text-5xl font-extrabold text-brand mb-2">
                  {stat.value}
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className={`w-full px-4 sm:px-8 py-12 ${darkMode ? 'bg-gray-950 border-t border-gray-800' : 'bg-gray-100 border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-right mb-12">
          {[
            { icon: "📍", title: "موقعنا", content: "جدة - حي الجميرة - شارع الأمير محمد بن سلمان" },
            { icon: "📞", title: "تواصل معنا", content: ["☎️ 055 123 4567", "💬 واتساب"] },
            { icon: "⏰", title: "ساعات العمل", content: "السبت - الخميس: 9:00 - 21:00\nالجمعة: 13:00 - 21:00" },
          ].map((section, idx) => (
            <div key={idx}>
              <h3 className="font-bold text-lg text-brand mb-3">{section.icon} {section.title}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                {typeof section.content === 'string' ? section.content : section.content.join(' | ')}
              </p>
            </div>
          ))}
        </div>

        <div className={`text-center text-sm ${darkMode ? 'text-gray-600' : 'text-gray-700'}`}>
          <p>© 2025 مركز التشخيص الاحترافي. جميع الحقوق محفوظة.</p>
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-in; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
