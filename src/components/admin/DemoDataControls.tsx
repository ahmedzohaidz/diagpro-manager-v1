"use client";

import { seedSampleBookings, clearAllLocalData } from "@/lib/dev/sampleData";

/**
 * Small, clearly-labeled test/demo data controls (offline only).
 * Intended for QA — adds sample bookings or clears all local data.
 */
export function DemoDataControls({ onChange }: { onChange?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-ink/30 bg-brand/5 p-3">
      <span className="text-xs font-bold text-ink-soft">
        بيانات تجريبية (للاختبار فقط):
      </span>
      <button
        type="button"
        onClick={() => {
          seedSampleBookings();
          onChange?.();
        }}
        className="rounded-md border-2 border-ink/20 bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-ink hover:bg-brand"
      >
        إضافة بيانات تجريبية
      </button>
      <button
        type="button"
        onClick={() => {
          if (
            typeof window !== "undefined" &&
            window.confirm("سيتم حذف جميع البيانات المحلية (الحجوزات وأوامر العمل). متابعة؟")
          ) {
            clearAllLocalData();
            onChange?.();
          }
        }}
        className="rounded-md border-2 border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50"
      >
        حذف كل البيانات المحلية
      </button>
    </div>
  );
}
