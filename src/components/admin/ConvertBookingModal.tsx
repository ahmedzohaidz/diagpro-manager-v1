"use client";

import { Detail } from "@/components/ui/Detail";
import { bookingStatusLabels } from "@/lib/statuses";
import type { Booking } from "@/lib/bookings/types";
import { formatDateTime, BTN_NEUTRAL, BTN_PRIMARY } from "@/lib/ui/display";

interface ConvertBookingModalProps {
  booking: Booking;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation modal shown before converting a booking into a work order
 * (Phase 17). Displays a read-only summary of the booking and a warning that
 * only one work order can be created per booking. Conversion happens only when
 * the user confirms — never directly from the booking action button.
 */
export function ConvertBookingModal({
  booking,
  submitting,
  onCancel,
  onConfirm,
}: ConvertBookingModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-extrabold text-ink">تحويل إلى أمر عمل</h2>
        <p className="mt-1 text-sm text-ink-soft">
          راجع بيانات الحجز قبل إنشاء أمر العمل.
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-lg border border-ink/10 bg-ink/[0.02] p-4 text-sm sm:grid-cols-2">
          <Detail label="العميل">{booking.customerFullName}</Detail>
          <Detail label="الجوال">
            <span dir="ltr">{booking.phone}</span>
          </Detail>
          <Detail label="السيارة">
            {booking.carMake} {booking.carModel}
          </Detail>
          <Detail label="سنة الصنع">{booking.carYear}</Detail>
          <Detail label="المشكلة">{booking.problemDescription}</Detail>
          <Detail label="الموعد">
            {booking.preferredDate} - {booking.preferredTime}
          </Detail>
          <Detail label="الحالة الحالية">
            {bookingStatusLabels[booking.status]}
          </Detail>
        </dl>

        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          سيتم إنشاء أمر عمل من هذا الحجز. لا يمكن إنشاء أكثر من أمر عمل لنفس
          الحجز.
        </p>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={BTN_NEUTRAL}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={BTN_PRIMARY}
          >
            {submitting ? "جارٍ الإنشاء..." : "تأكيد إنشاء أمر العمل"}
          </button>
        </div>
      </div>
    </div>
  );
}
