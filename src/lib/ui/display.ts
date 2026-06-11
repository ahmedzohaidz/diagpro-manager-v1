import type {
  BookingStatus,
  WorkOrderStatus,
  QuoteStatus,
  PaymentStatus,
} from "@/lib/statuses";
import type { BookingPriority } from "@/lib/bookings/types";

/**
 * Shared display helpers so status tones, priority labels, date formatting, and
 * action button labels stay consistent across every admin page.
 */

export type BadgeTone = "neutral" | "brand" | "dark" | "danger" | "success";

export const bookingStatusTone: Record<BookingStatus, BadgeTone> = {
  new_request: "brand",
  missing_data: "danger",
  pending_review: "neutral",
  appointment_suggested: "neutral",
  confirmed: "success",
  reminder_sent: "neutral",
  arrived: "dark",
  converted_to_work_order: "success",
  cancelled: "danger",
  no_show: "danger",
};

export const workOrderStatusTone: Record<WorkOrderStatus, BadgeTone> = {
  received: "brand",
  under_inspection: "neutral",
  waiting_customer_approval: "neutral",
  under_repair: "dark",
  final_test: "neutral",
  ready_for_pickup: "success",
  delivered: "success",
  cancelled: "danger",
};

// -----------------------------------------------------------------------------
// Phase 19A — financial closure display helpers.
// -----------------------------------------------------------------------------

export const quoteStatusTone: Record<QuoteStatus, BadgeTone> = {
  draft: "neutral",
  sent: "brand",
  approved: "success",
  rejected: "danger",
};

export const paymentStatusTone: Record<PaymentStatus, BadgeTone> = {
  unpaid: "danger",
  partial: "brand",
  paid: "success",
};

/**
 * Customer approval is DERIVED from the quote status (single source of truth) —
 * there is no separate approval column. Rendered as a clear badge, never free
 * text.
 */
export function customerApprovalView(status: QuoteStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "approved":
      return { label: "وافق العميل", tone: "success" };
    case "rejected":
      return { label: "رفض العميل", tone: "danger" };
    case "sent":
      return { label: "بانتظار موافقة العميل", tone: "brand" };
    default:
      return { label: "لم يُرسل العرض بعد", tone: "neutral" };
  }
}

/** Formats an amount in Saudi Riyal, e.g. "1,250.00 ر.س". */
export function formatCurrency(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ر.س`;
}

export function priorityLabel(priority: BookingPriority): string {
  return priority === "high" || priority === "urgent" ? "أولوية عالية" : "عادي";
}

export function priorityTone(priority: BookingPriority): BadgeTone {
  return priority === "high" || priority === "urgent" ? "danger" : "neutral";
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${date} ${time}`;
}

/**
 * Canonical Arabic action labels. Status actions and WhatsApp message actions
 * are kept distinct (a "send confirmation message" is not the same control as
 * "set status = confirmed").
 */
export const ACTION_LABELS = {
  // Status actions
  confirmAppointment: "تأكيد الموعد",
  markArrived: "تسجيل وصول العميل",
  convertToWorkOrder: "تحويل إلى أمر عمل",
  suggestAppointment: "اقتراح موعد",
  markContacted: "تم التواصل",
  requestDetails: "طلب تفاصيل",
  rejectBooking: "إلغاء / رفض",
  backToReview: "بانتظار المراجعة",
  viewDetails: "عرض التفاصيل",
  // WhatsApp message actions
  openWhatsApp: "فتح واتساب",
  requestMissingData: "طلب بيانات ناقصة",
  sendConfirmation: "إرسال تأكيد الموعد",
  sendReminder: "إرسال تذكير",
  customerArrivedMessage: "إشعار وصول السيارة",
  sendAppointmentDetails: "رسالة تأكيد الفحص",
  sendDetailsRequest: "طلب تفاصيل/صورة",
  sendNoAvailability: "رسالة اعتذار/عدم توفر",
} as const;

/**
 * Booking management statuses for Phase 16, mapped to the existing
 * `BookingStatus` enum (no schema changes). Local Arabic labels here
 * differ from `bookingStatusLabels` for statuses that are reused for a
 * different operational meaning in the admin bookings workflow.
 */
export const bookingManagementStatusLabels: Record<BookingStatus, string> = {
  new_request: "طلب جديد",
  pending_review: "بانتظار مراجعة الإدارة",
  appointment_suggested: "موعد مقترح",
  confirmed: "موعد مؤكد",
  reminder_sent: "تم التواصل",
  missing_data: "يحتاج تفاصيل",
  arrived: "وصل العميل",
  converted_to_work_order: "تحول إلى أمر عمل",
  cancelled: "ملغي / مرفوض",
  no_show: "لم يحضر",
};

export function yesNoLabel(value: boolean): string {
  return value ? "نعم" : "لا";
}

export function drivableTone(isDrivable: boolean): BadgeTone {
  return isDrivable ? "success" : "danger";
}

export function checkEngineTone(hasLight: boolean): BadgeTone {
  return hasLight ? "danger" : "success";
}

/** Shared button class strings to keep buttons visually consistent. */
export const BTN_NEUTRAL =
  "rounded-md border-2 border-ink/20 bg-white px-3 py-2 text-xs font-bold text-ink transition-colors hover:border-ink hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";
export const BTN_PRIMARY =
  "rounded-md bg-brand px-3 py-2 text-xs font-extrabold text-ink transition-colors hover:bg-brand-dark";
export const BTN_WHATSAPP =
  "rounded-md bg-ink px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-ink-soft";
