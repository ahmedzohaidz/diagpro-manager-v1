"use client";

import Link from "next/link";
import type { ConvertNotice } from "@/lib/work-orders/useConvertBooking";

/**
 * Shared success/error banner for the conversion flow (Phase 18).
 *
 * On success it shows the new work order number and a link to the work orders
 * page. Used by every admin page that converts bookings so the result UX stays
 * identical everywhere.
 */
export function ConvertResultNotice({ notice }: { notice: ConvertNotice }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-md border px-3 py-2 text-sm font-bold ${
        notice.type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <span>
        {notice.text}
        {notice.workOrderNumber ? ` (${notice.workOrderNumber})` : ""}
      </span>
      {notice.type === "success" && notice.workOrderNumber && (
        <Link
          href="/admin/work-orders"
          className="rounded-md border-2 border-ink bg-brand px-3 py-1 text-xs font-extrabold text-ink hover:bg-brand-dark"
        >
          فتح أوامر العمل
        </Link>
      )}
    </div>
  );
}
