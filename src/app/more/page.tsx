'use client';

import Link from "next/link";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import { NavigationDrawer } from "@/components/layout/NavigationDrawer";
import {
  Home,
  Wrench,
  Calendar,
  MessageCircle,
  BookOpen,
  LockKeyhole,
  CalendarCheck,
  UserCog,
  Activity,
  FileText,
  UserRound,
  FolderCheck,
  Stethoscope,
} from "lucide-react";

const WHATSAPP_LINK = buildGeneralWhatsAppLink(
  "مرحباً، أرغب في الاستفسار عن خدماتكم."
);

const QUICK_LINKS = [
  { href: "/", label: "الرئيسية", icon: Home, desc: "العودة للصفحة الرئيسية" },
  { href: "/services", label: "الخدمات", icon: Wrench, desc: "تصفح جميع خدماتنا" },
  { href: "/offers", label: "العروض", icon: BookOpen, desc: "عروض مميزة وخصومات" },
  { href: "/book", label: "حجز موعد", icon: Calendar, desc: "احجز موعد فحص أو صيانة" },
];

const ACCESS_QUICK = [
  { href: "/book", label: "احجز موعد", icon: Calendar, desc: "حجز موعد جديد" },
  { href: "/customer/login", label: "دخول العميل", icon: UserRound, desc: "تسجيل الدخول" },
  { href: "/admin/login", label: "دخول الإدارة", icon: LockKeyhole, desc: "دخول الفريق" },
  { href: "/admin/bookings", label: "إدارة الحجوزات", icon: CalendarCheck, desc: "قائمة الحجوزات" },
  { href: "/admin/booking-supervisor", label: "مشرف الحجوزات", icon: UserCog, desc: "إدارة المتابعة" },
  { href: "/admin/work-orders", label: "أوامر العمل", icon: Wrench, desc: "قائمة الأعمال" },
];

const ABOUT_POINTS = [
  { icon: "✓", text: "تشخيص دقيق بأحدث الأجهزة والبرمجيات" },
  { icon: "✓", text: "تقرير رقمي واضح لكل سيارة" },
  { icon: "✓", text: "فنيون متخصصون في كهرباء السيارات الحديثة" },
];

const WORK_HOURS = [
  { day: "السبت - الخميس", time: "9:00 ص - 9:00 م" },
  { day: "الجمعة", time: "إجازة" },
];

export default function MorePage() {
  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 py-4 h-16 max-w-[430px] mx-auto w-full">
          <div className="flex-1 flex justify-end">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
              <Stethoscope size={20} className="text-black" />
            </div>
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-right">المزيد</h1>
          </div>
          <div className="flex-1 flex justify-start">
            <NavigationDrawer />
          </div>
        </div>
      </header>

      <div className="pt-20 pb-6 px-4 bg-black">
        <div className="max-w-[430px] mx-auto text-right">
          <p className="text-sm text-gray-400">
            روابط سريعة ومعلومات عن مركز التشخيص الاحترافي.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-32">
        <div className="max-w-[430px] mx-auto space-y-6">
          {/* Quick links */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-right mb-4">الروابط السريعة</h2>
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-brand/40"
                >
                  <Icon size={24} className="text-brand flex-shrink-0" />
                  <span className="flex-1 text-right">
                    <span className="block text-sm font-bold">{link.label}</span>
                    <span className="mt-0.5 block text-xs text-gray-400">
                      {link.desc}
                    </span>
                  </span>
                </Link>
              );
            })}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-green-600/30 bg-green-600/10 p-4 transition-colors hover:border-green-600"
            >
              <MessageCircle size={24} className="text-green-500 flex-shrink-0" />
              <span className="flex-1 text-right">
                <span className="block text-sm font-bold text-green-500">
                  تواصل عبر واتساب
                </span>
                <span className="mt-0.5 block text-xs text-gray-400">
                  للاستفسارات السريعة والرد المباشر
                </span>
              </span>
            </a>
          </section>

          {/* Access Quick */}
          <section>
            <h2 className="text-lg font-bold text-right mb-4">الوصول السريع</h2>
            <div className="grid grid-cols-2 gap-3">
              {ACCESS_QUICK.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg border border-gray-800 bg-gray-900 p-3 text-center hover:border-brand/40 transition-colors"
                  >
                    <Icon size={28} className="text-brand mx-auto mb-2" />
                    <h3 className="text-xs font-bold mb-1">{link.label}</h3>
                    <p className="text-[10px] text-gray-400">{link.desc}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* About */}
          <section className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <h2 className="text-lg font-bold text-right mb-3">عن المركز</h2>
            <p className="text-xs text-gray-400 text-right mb-4">
              مركز متخصص في تشخيص وبرمجة وصيانة كهرباء السيارات الحديثة، نهدف إلى
              تقديم تجربة موثوقة وشفافة لكل عميل.
            </p>
            <div className="space-y-3">
              {ABOUT_POINTS.map((point) => (
                <div key={point.text} className="flex items-start gap-3 text-right">
                  <span className="text-brand font-bold flex-shrink-0">
                    {point.icon}
                  </span>
                  <span className="text-xs text-gray-300">
                    {point.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Working hours */}
          <section className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <h2 className="text-lg font-bold text-right mb-3">ساعات العمل</h2>
            <div className="space-y-2">
              {WORK_HOURS.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between rounded border border-gray-800 bg-black px-3 py-2 text-sm"
                >
                  <span className="font-bold text-brand">{row.time}</span>
                  <span className="text-gray-300">{row.day}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
