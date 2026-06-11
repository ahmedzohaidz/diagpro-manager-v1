/**
 * Status definitions for DiagPro Manager V1.
 *
 * Internal keys are in English (per naming rules); the Arabic labels are what
 * the UI displays. These maps are shared so StatusBadge and future phases stay
 * consistent.
 */

export type BookingStatus =
  | "new_request"
  | "missing_data"
  | "pending_review"
  | "appointment_suggested"
  | "confirmed"
  | "reminder_sent"
  | "arrived"
  | "converted_to_work_order"
  | "cancelled"
  | "no_show";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  new_request: "طلب جديد",
  missing_data: "بيانات ناقصة",
  pending_review: "بانتظار مراجعة الإدارة",
  appointment_suggested: "موعد مقترح",
  confirmed: "موعد مؤكد",
  reminder_sent: "تم إرسال تذكير",
  arrived: "وصل العميل",
  converted_to_work_order: "تحول إلى أمر عمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

export type WorkOrderStatus =
  | "received"
  | "under_inspection"
  | "waiting_customer_approval"
  | "under_repair"
  | "final_test"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled";

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  received: "تم الاستلام",
  under_inspection: "قيد الفحص",
  waiting_customer_approval: "بانتظار موافقة العميل",
  under_repair: "قيد الإصلاح",
  final_test: "اختبار نهائي",
  ready_for_pickup: "جاهزة للاستلام",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

// -----------------------------------------------------------------------------
// Phase 19A — work order financial closure statuses.
//
// The quote lifecycle (quote_status) is the single source of truth for the
// money flow. "Customer approval" is NOT a separate status — it is derived from
// quote_status for display (see customerApprovalView in lib/ui/display.ts).
// -----------------------------------------------------------------------------

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected";

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  draft: "مسودة",
  sent: "مُرسل للعميل",
  approved: "موافق عليه",
  rejected: "مرفوض",
};

// Derived (computed in the app from payments vs total) — never stored.
export type PaymentStatus = "unpaid" | "partial" | "paid";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "غير مدفوع",
  partial: "مدفوع جزئيًا",
  paid: "مدفوع بالكامل",
};

export type PaymentMethod = "cash" | "card" | "transfer" | "credit";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "كاش",
  card: "شبكة",
  transfer: "تحويل",
  credit: "آجل",
};
