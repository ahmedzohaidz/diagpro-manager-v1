"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import { bookingStatusLabels, type BookingStatus } from "@/lib/statuses";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { workOrderRepository } from "@/lib/work-orders/workOrderRepository";
import {
  whatsappBookingReceived,
  whatsappMissingData,
  whatsappAppointmentReminder,
} from "@/lib/whatsapp/whatsappMessages";
import type { Booking } from "@/lib/bookings/types";
import {
  bookingStatusTone,
  priorityLabel,
  priorityTone,
  formatDateTime,
  ACTION_LABELS,
  BTN_NEUTRAL,
  BTN_PRIMARY,
  BTN_WHATSAPP,
} from "@/lib/ui/display";

// Follow-up groups (a booking can appear in more than one group).
const sections: { key: string; title: string; match: (b: Booking) => boolean }[] =
  [
    {
      key: "needs_review",
      title: "حجوزات تحتاج مراجعة",
      match: (b) =>
        b.status === "new_request" || b.status === "pending_review",
    },
    {
      key: "missing_data",
      title: "بيانات ناقصة",
      match: (b) => b.status === "missing_data",
    },
    {
      key: "confirmed_not_arrived",
      title: "حجوزات مؤكدة لم تصل",
      match: (b) => b.status === "confirmed" || b.status === "reminder_sent",
    },
    {
      key: "arrived_not_converted",
      title: "حجوزات وصلت ولم تتحول إلى أمر عمل",
      match: (b) => b.status === "arrived",
    },
    {
      key: "high_priority",
      title: "حجوزات أولوية عالية",
      match: (b) => b.priority === "high",
    },
  ];

const CONVERTIBLE_STATUSES: BookingStatus[] = ["confirmed", "arrived"];

type Notice = { type: "success" | "error"; text: string };

export default function BookingFollowUpPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBookings(await bookingRepository.list());
    } catch {
      setError("تعذّر تحميل الحجوزات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id: string, status: BookingStatus) {
    setNotice(null);
    try {
      await bookingRepository.updateStatus(id, status);
      await load();
    } catch {
      setNotice({ type: "error", text: "تعذّر تحديث حالة الحجز." });
    }
  }

  async function handleConvert(booking: Booking) {
    setNotice(null);
    if (!CONVERTIBLE_STATUSES.includes(booking.status)) {
      setNotice({ type: "error", text: "لا يمكن تحويل هذا الحجز إلى أمر عمل." });
      return;
    }
    try {
      if (await workOrderRepository.existsForBooking(booking.id)) {
        setNotice({ type: "error", text: "تم تحويل هذا الحجز مسبقًا." });
        return;
      }
      await workOrderRepository.createFromBooking(booking);
      await bookingRepository.updateStatus(
        booking.id,
        "converted_to_work_order"
      );
      await load();
      setNotice({ type: "success", text: "تم تحويل الحجز إلى أمر عمل بنجاح." });
    } catch (err) {
      setNotice({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "لا يمكن تحويل هذا الحجز إلى أمر عمل.",
      });
    }
  }

  const grouped = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        items: bookings.filter(section.match),
      })),
    [bookings]
  );

  const hasAnyFollowUp = grouped.some((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-ink">متابعة الحجز</h1>
          <p className="mt-1 text-ink-soft">
            مركز متابعة الحجوزات لتحديد العملاء الذين يحتاجون إجراءً سريعاً.
          </p>
        </div>
        <Button variant="outline" type="button" onClick={load}>
          تحديث
        </Button>
      </header>

      {notice && (
        <p
          className={`rounded-md border px-3 py-2 text-sm font-bold ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <Card>
          <p className="text-sm text-ink-soft">جارٍ التحميل...</p>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <p className="text-base font-bold text-ink">لا توجد حجوزات بعد</p>
            <p className="mt-1 text-sm text-ink-soft">
              ستظهر عناصر المتابعة هنا عند استلام طلبات حجز جديدة.
            </p>
          </div>
        </Card>
      ) : !hasAnyFollowUp ? (
        <Card>
          <p className="py-4 text-center text-sm text-ink-soft">
            لا توجد حجوزات تحتاج متابعة حالياً.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map((section) =>
            section.items.length === 0 ? null : (
              <section key={section.key}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
                  {section.title}
                  <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-ink">
                    {section.items.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {section.items.map((b) => (
                    <FollowUpCard
                      key={`${section.key}_${b.id}`}
                      booking={b}
                      onStatusChange={handleStatusChange}
                      onConvert={handleConvert}
                    />
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </div>
  );
}

function FollowUpCard({
  booking,
  onStatusChange,
  onConvert,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onConvert: (booking: Booking) => void;
}) {
  const canConvert = CONVERTIBLE_STATUSES.includes(booking.status);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-bold text-ink">
            {booking.customerFullName}
          </h3>
          <p className="text-sm text-ink-soft" dir="ltr">
            {booking.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label={bookingStatusLabels[booking.status]}
            tone={bookingStatusTone[booking.status]}
          />
          <StatusBadge
            label={priorityLabel(booking.priority)}
            tone={priorityTone(booking.priority)}
          />
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Detail label="السيارة">
          {booking.carMake} {booking.carModel} {booking.carYear}
        </Detail>
        <Detail label="الموعد المفضل">
          {booking.preferredDate} - {booking.preferredTime}
        </Detail>
        <Detail label="المشكلة">{booking.problemDescription}</Detail>
        <Detail label="تاريخ الإنشاء">{formatDateTime(booking.createdAt)}</Detail>
      </dl>

      <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
        {/* Status actions (persist to localStorage) */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStatusChange(booking.id, "confirmed")}
            disabled={booking.status === "confirmed"}
            className={BTN_NEUTRAL}
          >
            {ACTION_LABELS.confirmAppointment}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(booking.id, "reminder_sent")}
            disabled={booking.status === "reminder_sent"}
            className={BTN_NEUTRAL}
          >
            تعليم: تم التذكير
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(booking.id, "missing_data")}
            disabled={booking.status === "missing_data"}
            className={BTN_NEUTRAL}
          >
            تعليم: بيانات ناقصة
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(booking.id, "arrived")}
            disabled={booking.status === "arrived"}
            className={BTN_NEUTRAL}
          >
            {ACTION_LABELS.markArrived}
          </button>
          {canConvert && (
            <button
              type="button"
              onClick={() => onConvert(booking)}
              className={BTN_PRIMARY}
            >
              {ACTION_LABELS.convertToWorkOrder}
            </button>
          )}
        </div>

        {/* WhatsApp prepared messages (Phase 6) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-ink-soft">رسائل واتساب:</span>
          <a
            href={whatsappBookingReceived(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_WHATSAPP}
          >
            {ACTION_LABELS.openWhatsApp}
          </a>
          <a
            href={whatsappMissingData(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_WHATSAPP}
          >
            {ACTION_LABELS.requestMissingData}
          </a>
          <a
            href={whatsappAppointmentReminder(booking)}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_WHATSAPP}
          >
            {ACTION_LABELS.sendReminder}
          </a>
        </div>
      </div>
    </Card>
  );
}
