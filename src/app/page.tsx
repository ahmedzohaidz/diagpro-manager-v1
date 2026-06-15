'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import { NavigationDrawer } from "@/components/layout/NavigationDrawer";
import {
  ClipboardCheck,
  Cpu,
  Award,
  ShieldCheck,
  Laptop,
  KeyRound,
  Zap,
  Radar,
  BatteryCharging,
  AlertCircle,
  Disc3,
  CalendarDays,
  Car,
  ScanLine,
  Clock,
  Menu,
  Tag,
  MoreHorizontal,
  Stethoscope,
  Wrench,
  Lightbulb,
  Wind,
  Gauge,
  Radio,
} from "lucide-react";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

// Trust Cards
const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: "شفافية",
    subtitle: "تقرير واضح وأسعار عادلة",
  },
  {
    icon: Award,
    title: "خبرة عالية",
    subtitle: "فنيون متخصصون ومدربون",
  },
  {
    icon: Cpu,
    title: "أحدث الأجهزة",
    subtitle: "تقنيات حديثة ودقة عالية",
  },
  {
    icon: ClipboardCheck,
    title: "تقرير رقمي",
    subtitle: "تقرير شامل فوري وآمن",
  },
];

// Services
const SERVICES = [
  {
    icon: Lightbulb,
    title: "تشخيص أعطال الكهرباء المتقدمة",
    subtitle: "فحص دقيق لأنظمة الكهرباء",
    time: "30-60 دقيقة",
    badge: "تشخيص",
  },
  {
    icon: Cpu,
    title: "برمجة وحدات التحكم ECU",
    subtitle: "برمجة وحدات التحكم والمفاتيح",
    time: "60-120 دقيقة",
    badge: "برمجة",
  },
  {
    icon: KeyRound,
    title: "برمجة المفاتيح والريموت",
    subtitle: "برمجة جميع أنواع المفاتيح والأجهزة",
    time: "20-40 دقيقة",
    badge: "برمجة",
  },
  {
    icon: Laptop,
    title: "فحص شامل كمبيوتر",
    subtitle: "فحص كامل لجميع أنظمة السيارة",
    time: "30-60 دقيقة",
    badge: "تشخيص",
  },
  {
    icon: Radio,
    title: "فحص الحساسات والأنظمة الإلكترونية",
    subtitle: "فحص جميع الحساسات والأنظمة",
    time: "45-90 دقيقة",
    badge: "كهرباء",
  },
  {
    icon: BatteryCharging,
    title: "فحص نظام الشحن والبطارية",
    subtitle: "فحص أداء البطارية والشحن",
    time: "20-30 دقيقة",
    badge: "صيانة",
  },
  {
    icon: AlertCircle,
    title: "فحص وبرمجة نظام الوسائد الهوائية",
    subtitle: "فحص ورمجة الوسائد الهوائية",
    time: "30-45 دقيقة",
    badge: "برمجة",
  },
  {
    icon: Gauge,
    title: "فحص وبرمجة نظام ABS",
    subtitle: "فحص ورمجة نظام الفرامل",
    time: "30-60 دقيقة",
    badge: "برمجة",
  },
];

// Service Journey
const SERVICE_JOURNEY = [
  { number: 1, title: "حجز موعدك بسهولة", icon: CalendarDays },
  { number: 2, title: "استقبال السيارة وفحص أولي", icon: Car },
  { number: 3, title: "فحص دقيق بأحدث الأجهزة", icon: ScanLine },
  { number: 4, title: "تنفيذ فني وتوصية واضحة", icon: Cpu },
  { number: 5, title: "تسليم فاتورتك وتأكيد الحل", icon: ClipboardCheck },
  { number: 6, title: "تستلم سيارتك وأمانك مضمون", icon: Car },
];

// Bottom Nav Component
function BottomNav() {
  const navItems = [
    { icon: Menu, label: "الخدمات", href: "#services" },
    { icon: Tag, label: "العروض", href: "#offers" },
    { icon: Clock, label: "الحجز", href: "/book" },
    { icon: MoreHorizontal, label: "المزيد", href: "#more" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-gray-800">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === 0; // First item is active by default

          return (
            <Link
              key={idx}
              href={item.href}
              className="flex flex-col items-center justify-center h-20 flex-1 gap-1 transition-colors"
            >
              <Icon
                size={24}
                className={isActive ? "text-brand" : "text-white"}
              />
              <span
                className={`text-xs text-center ${
                  isActive ? "text-brand" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area */}
      <div
        style={{
          height: "max(0px, env(safe-area-inset-bottom))",
        }}
      />
    </nav>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 py-4 h-16">
          {/* Right: Logo */}
          <div className="flex-1 flex justify-end">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
                <Stethoscope size={20} className="text-black" />
              </div>
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-right">مركز التشخيص الاحترافي</h1>
          </div>

          {/* Left: Menu */}
          <div className="flex-1 flex justify-start">
            <NavigationDrawer />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 bg-black relative">
        <div className="relative max-w-[430px] mx-auto">
          <div className="space-y-6">
            {/* Hero Image - Left Side */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl h-56 flex items-center justify-center border border-gray-700 mb-6">
              <div className="text-center">
                <Car size={56} className="text-brand mx-auto mb-2" />
                <p className="text-xs text-gray-400">ورشة احترافية</p>
              </div>
            </div>

            {/* Hero Content - Right Side */}
            <div className="text-right space-y-4">
              <h2 className="text-2xl font-extrabold leading-tight">
                <span className="block text-white">تشخيص دقيق</span>
                <span className="block text-brand">وبرمجة احترافية</span>
              </h2>

              <p className="text-sm text-gray-300 leading-relaxed">
                لكهرباء السيارات الحديثة
              </p>

              <p className="text-xs text-gray-400 leading-relaxed">
                نستخدم أحدث أجهزة الفحص والبرمجة المتقدمة بدقة عالية لضمان تشغيل مثالي لسيارتك.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/book" className="w-full">
                  <button className="w-full bg-brand hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <CalendarDays size={20} />
                    احجز الآن
                  </button>
                </Link>

                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    💬 واتساب
                  </button>
                </a>
              </div>

              {/* Quick Info */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-300 border border-yellow-600/50 rounded-lg p-3 bg-yellow-600/5 mt-2">
                <Clock size={16} className="text-brand" />
                <span>فحص ذكي خلال 15 دقيقة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Cards Section */}
      <section className="px-4 py-8 bg-black">
        <div className="max-w-[430px] mx-auto">
          <div className="grid grid-cols-4 gap-3">
            {TRUST_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-black border border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-colors"
                >
                  <Icon size={28} className="text-brand mx-auto mb-3" />
                  <h3 className="text-xs font-bold text-brand mb-2">{card.title}</h3>
                  <p className="text-[10px] text-gray-400 leading-tight">{card.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 py-8 bg-black">
        <div className="max-w-[430px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/services" className="text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              <span>←</span>
              عرض الكل
            </Link>
            <h2 className="text-lg font-bold text-right">خدماتنا الرئيسية</h2>
          </div>

          {/* Services Grid - 4 Columns x 2 Rows */}
          <div className="grid grid-cols-2 gap-4">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link key={idx} href="/book">
                  <div className="bg-white rounded-lg p-4 h-full hover:shadow-lg transition-shadow flex flex-col">
                    {/* Badge */}
                    <div className="text-[10px] font-bold text-gray-600 mb-2">
                      {service.badge}
                    </div>

                    {/* Icon */}
                    <Icon size={32} className="text-black mb-3 mx-auto" />

                    {/* Title */}
                    <h3 className="text-sm font-bold text-black text-center mb-2 line-clamp-2">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 text-center mb-3 line-clamp-2">
                      {service.subtitle}
                    </p>

                    {/* Time */}
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-700 mb-3">
                      <Clock size={12} />
                      {service.time}
                    </div>

                    {/* Button */}
                    <button className="bg-brand hover:bg-yellow-500 text-black text-xs font-bold py-2 rounded-md transition-colors mt-auto">
                      احجز الآن
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Journey Section */}
      <section className="px-4 py-8 bg-black">
        <div className="max-w-[430px] mx-auto space-y-6">
          <h2 className="text-lg font-bold text-right">رحلة خدمتك معنا</h2>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex gap-2 justify-center items-center flex-wrap">
              {SERVICE_JOURNEY.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    {/* Number Circle */}
                    <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center font-bold text-black mb-2">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <Icon size={20} className="text-white mb-2" />

                    {/* Title */}
                    <p className="text-[10px] text-white text-center w-16 leading-tight">
                      {step.title}
                    </p>

                    {/* Arrow (except for last) */}
                    {idx < SERVICE_JOURNEY.length - 1 && (
                      <div className="text-gray-600 text-xl mt-2">←</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacing - Extra padding for BottomNav */}
      <div className="h-36" />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
