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

// Bottom Navigation Component
function BottomNav({ isVisible }: { isVisible: boolean }) {
  const navItems = [
    { icon: "🏠", label: "الرئيسية", href: "/" },
    { icon: "🎁", label: "العروض", href: "#offers" },
    { icon: "💬", label: "واتساب", href: WHATSAPP_LINK, external: true },
    { icon: "📅", label: "احجز", href: "/book" },
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-gray-800 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item, idx) => (
            item.external ? (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-20 flex-1 gap-1 hover:bg-gray-900/50 transition-colors rounded-lg"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-400 text-center">{item.label}</span>
              </a>
            ) : (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center h-20 flex-1 gap-1 hover:bg-gray-900/50 transition-colors rounded-lg text-white"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-400 text-center">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Safe Area Spacer */}
      <div style={{ height: "max(80px, calc(80px + env(safe-area-inset-bottom)))" }} />
    </>
  );
}

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
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY) {
        setShowNav(true); // Scrolling up
      } else if (currentScrollY > lastScrollY + 50) {
        setShowNav(false); // Scrolling down
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${darkMode ? 'bg-black/90 border-b border-gray-800' : 'bg-white/90 border-b border-gray-200'}`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Logo/Title */}
          <div className="text-right flex-1">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-brand to-yellow-300 bg-clip-text text-transparent">
              🏥 ديجينو
            </h1>
          </div>

          {/* Navigation Menu */}
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link href="/">
              <Button className={`text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-black'}`}>
                👤 العميل
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button className={`text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-black'}`}>
                ⚙️ الإدارة
              </Button>
            </Link>
            <Link href="/blog">
              <Button className={`text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-black'}`}>
                📝 مدونة
              </Button>
            </Link>
            <Link href="/suggestions">
              <Button className={`text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-black'}`}>
                💡 اقتراحات
              </Button>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Book Now Button */}
          <div className="hidden sm:flex ml-4">
            <Link href="/book">
              <Button className="bg-brand hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg">
                📅 احجز
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full pt-28 pb-12 px-4 sm:px-8 bg-gradient-to-b from-gray-900 via-black to-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-right mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-brand to-yellow-300 bg-clip-text text-transparent">
              عروضنا الحالية
            </h1>
            <div className="inline-block bg-brand/90 rounded-full px-6 py-3 text-black font-bold text-lg mb-6 animate-pulse">
              ⏰ عروض حصرية لفترة محدودة!
            </div>
            <div className="mt-4">
              <CountdownTimer />
            </div>
          </div>

          {/* 8 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {HERO_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-brand/30 hover:border-brand rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/10 group-hover:to-brand/20 transition-all"></div>

                <div className="relative z-10">
                  <div className="text-6xl sm:text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {card.image}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    {card.title}
                  </h3>

                  <p className="text-sm text-gray-400 mb-6">
                    {card.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-gray-700">
                    {card.price === "مجاني" ? (
                      <div className="text-3xl font-extrabold text-brand animate-pulse">
                        ✅ {card.price}
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-brand">
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

                  <Link href="/book" className="block w-full">
                    <button className="w-full bg-gradient-to-r from-brand to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-bold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand/50">
                      احجز الآن ✨
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
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
              { icon: "📋", title: "شروط بسيطة", items: ["✓ العروض لا تشمل قطع", "✓ يمكن دمج العروض"] },
              { icon: "📅", title: "مدة العروض", items: ["✓ تنسري حتي 30 يونيو 2025"] },
            ].map((section, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-black/50 border-b-4 border-brand' : 'bg-white border-l-4 border-brand'} p-6 rounded-lg text-right transition-all duration-300 hover:shadow-lg`}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center justify-end gap-3">
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

      {/* Benefits Section */}
      <section className={`w-full px-4 sm:px-8 py-16 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-right bg-gradient-to-r from-brand to-yellow-300 bg-clip-text text-transparent">
            لماذا تستفيد من العرض؟
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gray-900 border-gray-800 hover:border-brand/50' : 'bg-gray-50 border-gray-200 hover:border-brand/50'} border rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-4xl sm:text-5xl mb-3 animate-bounce" style={{ animationDelay: `${idx * 100}ms` }}>
                  {benefit.icon}
                </div>
                <h4 className="font-bold text-sm sm:text-base mb-2">{benefit.title}</h4>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-right">
            آراء عملائنا الراضين
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 sm:p-8 text-right transition-all duration-300 hover:shadow-lg hover:shadow-brand/20`}
              >
                <div className="flex justify-end gap-1 mb-4">
                  {Array(testimonial.rating).fill("⭐")}
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 italic text-sm`}>
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="font-bold text-brand text-sm sm:text-base">{testimonial.name}</p>
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
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
          <div className="w-full md:w-1/3 h-48 sm:h-64 rounded-lg flex items-center justify-center text-7xl sm:text-8xl opacity-50 animate-float">
            🚗
          </div>

          <div className="w-full md:w-2/3 text-right space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              احجز عرضك الآن
            </h2>
            <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              واستفد من أفضل الأسعار قبل انتهاء العروض
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-4 rounded-xl font-bold text-base sm:text-lg min-h-[56px]">
                  💬 واتساب
                </Button>
              </a>
              <Link href="/book">
                <Button className="bg-brand hover:bg-yellow-500 text-black px-6 sm:px-8 py-4 rounded-xl font-bold text-base sm:text-lg min-h-[56px]">
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
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-right">
            ثقة عملائنا هي نجاحنا
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-4xl sm:text-5xl mb-4">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-brand mb-2">
                  {stat.value}
                </div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            { icon: "📍", title: "موقعنا", content: "جدة - حي الجميرة" },
            { icon: "📞", title: "تواصل معنا", content: "055 123 4567" },
            { icon: "⏰", title: "ساعات العمل", content: "السبت - الخميس: 9:00 - 21:00" },
          ].map((section, idx) => (
            <div key={idx}>
              <h3 className="font-bold text-base sm:text-lg text-brand mb-3">{section.icon} {section.title}</h3>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className={`text-center text-xs sm:text-sm ${darkMode ? 'text-gray-600' : 'text-gray-700'}`}>
          <p>© 2025 مركز التشخيص الاحترافي. جميع الحقوق محفوظة.</p>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNav isVisible={showNav} />

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
