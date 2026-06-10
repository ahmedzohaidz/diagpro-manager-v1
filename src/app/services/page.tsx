"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICES, SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/services/data";

const ALL = "الكل" as const;
type Filter = ServiceCategory | typeof ALL;

const FILTERS: Filter[] = [ALL, ...SERVICE_CATEGORIES];

export default function ServicesPage() {
  const [filter, setFilter] = useState<Filter>(ALL);

  const services =
    filter === ALL
      ? SERVICES
      : SERVICES.filter((service) => service.categories.includes(filter));

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0d0f] p-4 text-white sm:p-6">
      <header>
        <h1 className="text-2xl font-extrabold">خدماتنا الرئيسية</h1>
        <p className="mt-1 text-sm leading-relaxed text-white/60">
          حلول متقدمة في تشخيص وبرمجة وإصلاح كهرباء المركبات، باستخدام أحدث
          الأجهزة والتقنيات لضمان أفضل النتائج.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "border-brand bg-brand text-ink"
                  : "border-white/15 bg-[#18181b] text-white/70 hover:border-white/40"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col rounded-xl border border-white/10 bg-[#18181b] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                {service.icon}
              </span>
              <div>
                <h2 className="text-base font-extrabold">{service.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
                  {service.description}
                </p>
              </div>
            </div>
            <Link href="/book" className="mt-4 block">
              <span className="block rounded-md bg-brand px-3 py-3 text-center text-sm font-extrabold text-ink">
                احجز الخدمة
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
