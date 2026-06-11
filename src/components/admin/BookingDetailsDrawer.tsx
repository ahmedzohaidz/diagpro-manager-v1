"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import { bookingStatusLabels, type BookingStatus } from "@/lib/statuses";
import type { Booking, BookingStatusLog } from "@/lib/bookings/types";
import type { WorkOrder } from "@/lib/work-orders/types";
import { CONVERTIBLE_STATUSES } from "@/lib/work-orders/useConvertBooking";
import {
  whatsappAppointmentConfirmation,
  whatsappMissingData,
  whatsappAppointmentReminder,
  whatsappCustomerArrived,
  whatsappBookingAppointmentDetails,
  whatsappRequestDetailsWithImage,
  whatsappNoAvailability,
} from "@/lib/whatsapp/whatsappMessages";
import {
  bookingStatusTone,
  bookingManagementStatusLabels,
  priorityLabel,
  priorityTone,
  formatDateTime,
  yesNoLabel,
  drivableTone,
  checkEngineTone,
  ACTION_LABELS,
  BTN_NEUTRAL,
  BTN_PRIMARY,
  BTN_WHATSAPP,
} from "@/lib/ui/display";

/** Status actions available from the booking details drawer (Phase 16). */
const statusActions: { status: BookingStatus; label: string }[] = [
  { status: "pending_review", label: ACTION_LABELS.backToReview },
  { status: "appointment_suggested", label: ACTION_LABELS.suggestAppointment },
  { status: "confirmed", label: ACTION_LABELS.confirmAppointment },
  { status: "reminder_sent", label: ACTION_LABELS.markContacted },
  { status: "missing_data", label: ACTION_LABELS.requestDetails },
  { status: "arrived", label: ACTION_LABELS.markArrived },
  { status: "cancelled", label: ACTION_LABELS.rejectBooking },
];

const whatsappActions: { label: string; build: (booking: Booking) => string }[] = [
  { label: ACTION_LABELS.sendAppointmentDetails, build: whatsappBookingAppointmentDetails },
  { label: ACTION_LABELS.sendConfirmation, build: whatsappAppointmentConfirmation },
  { label: ACTION_LABELS.requestMissingData, build: whatsappMissingData },
  { label: ACTION_LABELS.sendDetailsRequest, build: whatsappRequestDetailsWithImage },
  { label: ACTION_LABELS.sendReminder, build: whatsappAppointmentReminder },
  { label: ACTION_LABELS.customerArrivedMessage, build: whatsappCustomerArrived },
  { label: ACTION_LABELS.sendNoAvailability, build: whatsappNoAvailability },
];

interface BookingDetailsDrawerProps {
  booking: Booking;
  statusLogs: BookingStatusLog[];
  logsLoading: boolean;
  workOrder: WorkOrder | null;
  onClose: () => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onConvert: (booking: Booking) => void;
}

export function BookingDetailsDrawer({
  booking,
  statusLogs,
  logsLoading,
  workOrder,
  onClose,
  onStatusChange,
  onConvert,
}: BookingDetailsDrawerProps) {
  // A booking that already has a work order is shown as converted instead of
  // offering the convert action again — this is the authoritative duplicate
  // guard in the UI (Phase 17).
  const isConverted =
    booking.status === "converted_to_work_order" || workOrder !== null;
  const canConvert = !isConverted && CONVERTIBLE_STATUSES.includes(booking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-extrabold text-ink">
              {booking.customerFullName}
            </h2>
            <p className="text-sm text-ink-soft" dir="ltr">
              {booking.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="shrink-0 rounded-md border-2 border-ink/20 bg-white px-3 py-1.5 text-sm font-bold text-ink hover:border-ink hover:bg-brand"
          >
            إغلاق
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge
            label={bookingStatusLabels[booking.status]}
            tone={bookingStatusTone[booking.status]}
          />
          <StatusBadge
            label={priorityLabel(booking.priority)}
            tone={priorityTone(booking.priority)}
          />
        </div>

        {/* Vehicle & customer info */}
        <Card className="mt-4">
          <h3 className="mb-3 text-sm font-extrabold text-ink">بيانات السيارة والعميل</h3>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Detail label="السيارة">
              {booking.carMake} {booking.carModel} {booking.carYear}
            </Detail>
            <Detail label="رقم اللوحة">{booking.plateNumber || "غير محدد"}</Detail>
            <Detail label="السيارة تمشي؟">
              <StatusBadge
                label={yesNoLabel(booking.isDrivable)}
                tone={drivableTone(booking.isDrivable)}
              />
            </Detail>
            <Detail label="لمبة فحص المكينة؟">
              <StatusBadge
                label={yesNoLabel(booking.hasCheckEngineLight)}
                tone={checkEngineTone(booking.hasCheckEngineLight)}
              />
            </Detail>
          </dl>
        </Card>

        {/* Booking details */}
        <Card className="mt-4">
          <h3 className="mb-3 text-sm font-extrabold text-ink">تفاصيل الحجز</h3>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Detail label="المشكلة">{booking.problemDescription}</Detail>
            <Detail label="الموعد المطلوب">
              {booking.preferredDate} - {booking.preferredTime}
            </Detail>
            <Detail label="ملاحظات">{booking.notes || "لا توجد ملاحظات"}</Detail>
            <Detail label="تاريخ إنشاء الطلب">{formatDateTime(booking.createdAt)}</Detail>
            <Detail label="آخر تحديث">{formatDateTime(booking.updatedAt)}</Detail>
          </dl>
        </Card>

        {/* Status log */}
        <Card className="mt-4">
          <h3 className="mb-3 text-sm font-extrabold text-ink">سجل الحالة</h3>
          {logsLoading ? (
            <p className="text-sm text-ink-soft">جارٍ التحميل...</p>
          ) : statusLogs.length === 0 ? (
            <p className="text-sm text-ink-soft">لا يوجد سجل حالة بعد.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {statusLogs.map((log) => (
                <li key={log.id} className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-ink-soft">{formatDateTime(log.createdAt)}</span>
                  <span className="font-bold text-ink">
                    {log.oldStatus
                      ? `${bookingManagementStatusLabels[log.oldStatus]} ← ${bookingManagementStatusLabels[log.newStatus]}`
                      : bookingManagementStatusLabels[log.newStatus]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Actions */}
        <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
          <div>
            <p className="mb-2 text-xs font-bold text-ink-soft">تغيير حالة الحجز:</p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  type="button"
                  onClick={() => onStatusChange(booking.id, action.status)}
                  disabled={booking.status === action.status}
                  className={BTN_NEUTRAL}
                >
                  {action.label}
                </button>
              ))}
              {canConvert && (
                <button type="button" onClick={() => onConvert(booking)} className={BTN_PRIMARY}>
                  {ACTION_LABELS.convertToWorkOrder}
                </button>
              )}
            </div>
          </div>

          {isConverted && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-extrabold text-green-800">
                تم تحويل هذا الحجز إلى أمر عمل
              </p>
              {workOrder && (
                <p className="mt-1 text-sm font-bold text-green-700">
                  رقم أمر العمل: {workOrder.workOrderNumber}
                </p>
              )}
              <Link
                href="/admin/work-orders"
                className="mt-3 inline-block rounded-md border-2 border-ink bg-brand px-3 py-1.5 text-xs font-extrabold text-ink hover:bg-brand-dark"
              >
                فتح أوامر العمل
              </Link>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-bold text-ink-soft">رسائل واتساب:</p>
            <div className="flex flex-wrap gap-2">
              {whatsappActions.map((action) => (
                <a
                  key={action.label}
                  href={action.build(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BTN_WHATSAPP}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
