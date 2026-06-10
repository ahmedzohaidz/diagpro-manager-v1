"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import { bookingStatusLabels, type BookingStatus } from "@/lib/statuses";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { workOrderRepository } from "@/lib/work-orders/workOrderRepository";
import { analyzeBookings } from "@/lib/booking-supervisor/bookingSupervisor";
import {
  whatsappBookingReceived,
  whatsappMissingData,
  whatsappAppointmentConfirmation,
  whatsappAppointmentReminder,
} from "@/lib/whatsapp/whatsappMessages";
import type { Booking } from "@/lib/bookings/types";
import type { SupervisorItem } from "@/lib/booking-supervisor/types";
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

const CONVERTIBLE_STATUSES: BookingStatus[] = ["confirmed", "arrived"];

type Notice = { type: "success" | "error"; text: string };

export default function BookingSupervisorPage() {
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

  const result = useMemo(() => analyzeBookings(bookings), [bookings]);

  const stats = [
    { label: "تحتاج إجراء", value: result.summary.needingAttention },
    { label: "أولوية عالية", value: result.summary.highPriority },
    { label: "وصلت ولم تتحول", value: result.summary.arrivedNotConverted },
    { label: "بيانات ناقصة", value: result.summary.missingData },
    { label: "مؤكدة", value: result.summary.confirmed },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink">مشرف الحجز</h1>
        <p className="mt-1 max-w-3xl text-ink-soft">
          مشرف الحجز يساعدك على معرفة الحجوزات التي تحتاج إجراء سريع حتى لا يضيع
          العميل أو يتأخر الرد عليه.
        </p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-2xl font-extrabold text-ink">{s.value}</p>
            <p className="mt-1 text-xs font-bold text-ink-soft">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" type="button" onClick={load}>
          تحديث
        </Button>
      </div>

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
      ) : result.items.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <p className="text-base font-bold text-ink">
              لا توجد حجوزات تحتاج إجراء حالياً
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              ستظهر التوصيات هنا عند وجود حجوزات تحتاج متابعة.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.items.map((item) => (
            <RecommendationCard
              key={item.booking.id}
              item={item}
              onStatusChange={handleStatusChange}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  item,
  onStatusChange,
  onConvert,
}: {
  item: SupervisorItem;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onConvert: (booking: Booking) => void;
}) {
  const { booking, urgencyScore, recommendations } = item;
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border-2 border-ink bg-brand px-3 py-1 text-xs font-extrabold text-ink">
            درجة الأولوية: {urgencyScore}
          </span>
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

      {/* Recommendations */}
      <div className="mt-4 space-y-2 rounded-md bg-brand/10 p-3">
        {recommendations.map((rec, i) => (
          <div key={i}>
            <p className="text-sm font-extrabold text-ink">
              التوصية: {rec.recommendation}
            </p>
            <p className="text-sm text-ink-soft">
              الإجراء المقترح: {rec.suggestedAction}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
        <div className="flex flex-wrap gap-2">
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-ink-soft">رسائل واتساب:</span>
          <WhatsAppLink href={whatsappBookingReceived(booking)}>
            {ACTION_LABELS.openWhatsApp}
          </WhatsAppLink>
          <WhatsAppLink href={whatsappMissingData(booking)}>
            {ACTION_LABELS.requestMissingData}
          </WhatsAppLink>
          <WhatsAppLink href={whatsappAppointmentConfirmation(booking)}>
            {ACTION_LABELS.sendConfirmation}
          </WhatsAppLink>
          <WhatsAppLink href={whatsappAppointmentReminder(booking)}>
            {ACTION_LABELS.sendReminder}
          </WhatsAppLink>
        </div>
      </div>
    </Card>
  );
}

function WhatsAppLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={BTN_WHATSAPP}
    >
      {children}
    </a>
  );
}
