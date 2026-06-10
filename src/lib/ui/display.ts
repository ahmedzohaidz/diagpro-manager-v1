import type { BookingStatus, WorkOrderStatus } from "@/lib/statuses";
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
  // WhatsApp message actions
  openWhatsApp: "فتح واتساب",
  requestMissingData: "طلب بيانات ناقصة",
  sendConfirmation: "إرسال تأكيد الموعد",
  sendReminder: "إرسال تذكير",
  customerArrivedMessage: "إشعار وصول السيارة",
} as const;

/** Shared button class strings to keep buttons visually consistent. */
export const BTN_NEUTRAL =
  "rounded-md border-2 border-ink/20 bg-white px-3 py-2 text-xs font-bold text-ink transition-colors hover:border-ink hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";
export const BTN_PRIMARY =
  "rounded-md bg-brand px-3 py-2 text-xs font-extrabold text-ink transition-colors hover:bg-brand-dark";
export const BTN_WHATSAPP =
  "rounded-md bg-ink px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-ink-soft";
