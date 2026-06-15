'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X, Home, Wrench, BookOpen, Calendar, MessageCircle, LockKeyhole, CalendarCheck, UserCog, Activity, FileText, UserRound, FolderCheck, Menu } from 'lucide-react';

const CUSTOMER_LINKS = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/services', label: 'الخدمات', icon: Wrench },
  { href: '/offers', label: 'العروض', icon: BookOpen },
  { href: '/book', label: 'حجز موعد', icon: Calendar },
  { href: '/customer/login', label: 'دخول العميل', icon: UserRound },
];

const TEAM_LINKS = [
  { href: '/admin/login', label: 'دخول الإدارة', icon: LockKeyhole },
  { href: '/admin/bookings', label: 'إدارة الحجوزات', icon: CalendarCheck },
  { href: '/admin/booking-supervisor', label: 'مشرف الحجوزات', icon: UserCog },
  { href: '/admin/booking-follow-up', label: 'متابعة الحجوزات', icon: Activity },
  { href: '/admin/work-orders', label: 'أوامر العمل', icon: Wrench },
  { href: '/admin/documents', label: 'مستندات العملاء', icon: FileText },
];

export function NavigationDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleDrawer}
        className="text-white hover:text-brand transition-colors"
        aria-label="فتح القائمة"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-black border-r border-gray-800 z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold">القائمة</h2>
        </div>

        {/* Customer Section */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">العميل</h3>
          <nav className="space-y-2">
            {CUSTOMER_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-900 hover:text-brand transition-colors"
                >
                  <Icon size={18} />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Team Section */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-brand uppercase mb-3">روابط الفريق</h3>
          <nav className="space-y-2">
            {TEAM_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-brand transition-colors"
                >
                  <Icon size={18} />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* WhatsApp CTA */}
        <div className="border-t border-gray-800 p-4">
          <a
            href="https://wa.me/966XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors"
          >
            <MessageCircle size={18} />
            تواصل عبر واتساب
          </a>
        </div>
      </div>
    </>
  );
}
