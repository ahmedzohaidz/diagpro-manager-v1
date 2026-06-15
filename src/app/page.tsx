'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
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
} from "lucide-react";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

// Trust Cards
const TRUST_CARDS = [
  {
    icon: ClipboardCheck,
    title: "تقرير رقمي",
    subtitle: "تقرير شامل فوري وآمن",
  },
  {
    icon: Cpu,
    title: "أحدث الأجهزة",
    subtitle: "تقنيات حديثة ودقة عالية",
  },
  {
    icon: Award,
    title: "خبرة عالية",
    subtitle: "فنيون متخصصون ومدربون",
  },
  {
    icon: ShieldCheck,
    title: "شفافية",
    subtitle: "تقرير واضح وأسعار عادلة",
  },
];

// Services
const SERVICES = [
  {
    icon: Laptop,
    title: "فحص شامل كمبيوتر",
    href: "/book",
  },
  {
    icon: KeyRound,
    title: "برمجة المفاتيح والريموت",
    href: "/book",
  },
  {
    icon: Cpu,
    title: "برمجة وحدات التحكم ECU",
    href: "/book",
  },
  {
    icon: Zap,
    title: "تشخيص أعطال الكهرباء المتقدمة",
    href: "/book",
  },
  {
    icon: Radar,
    title: "فحص الحساسات والأنظمة الإلكترونية",
    href: "/book",
  },
  {
    icon: BatteryCharging,
    title: "فحص نظام الشحن والبطارية",
    href: "/book",
  },
  {
    icon: AlertCircle,
    title: "فحص وبرمجة نظام الوسائد الهوائية",
    href: "/book",
  },
  {
    icon: Disc3,
    title: "فحص وبرمجة نظام ABS",
    href: "/book",
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
      <section className="pt-16 pb-6 px-4 bg-black relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-5">
          <div className="w-64 h-64 bg-brand rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-[430px] mx-auto">
          {/* Hero Content */}
          <div className="text-right mb-8">
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              <span className="block">تشخيص دقيق</span>
              <span className="block">وبرمجة احترافية</span>
            </h2>

            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              لكهرباء السيارات الحديثة
            </p>

            <p className="text-xs text-gray-500 mb-8 leading-relaxed">
              نستخدم أحدث أجهزة الفحص والبرمجة المتقدمة بدقة عالية لضمان
              تشغيل مثالي لسيارتك.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <Link href="/book" className="w-full">
                <button className="w-full bg-brand hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <CalendarDays size={20} />
                  احجز الآن
                </button>
              </Link>

              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-full">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span>💬</span>
                  واتساب
                </button>
              </a>
            </div>

            {/* Quick Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 border border-gray-800 rounded-lg p-3">
              <Clock size={16} />
              <span>فحص ذكي خلال 15 دقيقة</span>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl h-48 flex items-center justify-center mb-8 border border-gray-800">
            <div className="text-center">
              <Wrench size={48} className="text-brand mx-auto mb-2" />
              <p className="text-xs text-gray-500">ورشة احترافية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Cards Section */}
      <section className="px-4 py-6 bg-black">
        <div className="max-w-[430px] mx-auto">
          <div className="grid grid-cols-4 gap-3">
            {TRUST_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center"
                >
                  <Icon size={24} className="text-white mx-auto mb-2" />
                  <h3 className="text-xs font-bold text-brand mb-1">{card.title}</h3>
                  <p className="text-[10px] text-gray-400">{card.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-4 py-6 bg-black">
        <div className="max-w-[430px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/services" className="text-xs text-gray-400 hover:text-brand flex items-center gap-1">
              عرض الكل
              <span>←</span>
            </Link>
            <h2 className="text-lg font-bold">خدماتنا الرئيسية</h2>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-4 gap-3">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link key={idx} href={service.href}>
                  <div className="bg-white rounded-lg p-3 text-center hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-between">
                    <Icon size={28} className="text-black mb-2" />
                    <h3 className="text-[11px] font-bold text-black text-center leading-tight line-clamp-3 mb-2">
                      {service.title}
                    </h3>
                    <button className="bg-brand hover:bg-yellow-500 text-black text-xs font-bold py-1 px-2 rounded transition-colors">
                      احجز
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Journey Section */}
      <section className="px-4 py-6 bg-black">
        <div className="max-w-[430px] mx-auto">
          <h2 className="text-lg font-bold mb-6 text-right">رحلة خدمتك معنا</h2>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {SERVICE_JOURNEY.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center flex-shrink-0">
                    {/* Number Circle */}
                    <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center font-bold text-black mb-2">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <Icon size={20} className="text-white mb-2" />

                    {/* Title */}
                    <p className="text-[10px] text-white text-center w-20 leading-tight">
                      {step.title}
                    </p>

                    {/* Arrow (except for last) */}
                    {idx < SERVICE_JOURNEY.length - 1 && (
                      <div className="text-gray-600 text-lg mt-2">←</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacing - Extra padding for BottomNav */}
      <div className="h-32" />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
