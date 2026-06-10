import type { Booking } from "@/lib/bookings/types";
import type { WorkOrder } from "@/lib/work-orders/types";

/**
 * Reusable WhatsApp message generators (Phase 6).
 *
 * These build plain WhatsApp click-to-chat links (wa.me) with prepared Arabic
 * messages. NOTHING is sent automatically — the admin clicks a link which opens
 * WhatsApp with the message pre-filled. The WhatsApp Business API is NOT used.
 */

// Workshop WhatsApp number (international format, no "+").
export const WORKSHOP_WHATSAPP_NUMBER = "966535473565";

/** Wraps a prepared message into a wa.me link with URL-encoded text. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WORKSHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

function carLabel(make: string, model: string, year: string): string {
  return `${make} ${model} ${year}`.trim();
}

function appointmentLabel(date: string, time: string): string {
  return [date, time].filter(Boolean).join(" - ");
}

// ---------------------------------------------------------------------------
// Booking messages
// ---------------------------------------------------------------------------

/** A) Booking received acknowledgement. */
export function whatsappBookingReceived(booking: Booking): string {
  const message = [
    "تم استلام طلب الحجز بنجاح.",
    "سيتم مراجعة أقرب موعد مناسب والتواصل معك.",
    "بيانات الحجز:",
    `الاسم: ${booking.customerFullName}`,
    `السيارة: ${carLabel(booking.carMake, booking.carModel, booking.carYear)}`,
    `المشكلة: ${booking.problemDescription}`,
    `الموعد المطلوب: ${appointmentLabel(
      booking.preferredDate,
      booking.preferredTime
    )}`,
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** B) Missing booking data request. */
export function whatsappMissingData(_booking: Booking): string {
  const message = [
    "حياك الله، وصلنا طلب الحجز لكن نحتاج إكمال بعض البيانات حتى نجهز الفني قبل وصولك.",
    "فضلاً أرسل:",
    "- نوع السيارة",
    "- الموديل",
    "- وصف المشكلة",
    "- هل السيارة تمشي؟",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** C) Appointment confirmation. */
export function whatsappAppointmentConfirmation(booking: Booking): string {
  const message = [
    "تم تأكيد موعد فحص سيارتك.",
    `السيارة: ${carLabel(booking.carMake, booking.carModel, booking.carYear)}`,
    `المشكلة: ${booking.problemDescription}`,
    `الموعد: ${appointmentLabel(booking.preferredDate, booking.preferredTime)}`,
    "ملاحظة: التشخيص يحدد سبب المشكلة قبل أي إصلاح أو تغيير قطع.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** D) Appointment reminder. */
export function whatsappAppointmentReminder(booking: Booking): string {
  const message = [
    "تذكير بموعد فحص سيارتك اليوم.",
    `الموعد: ${appointmentLabel(booking.preferredDate, booking.preferredTime)}`,
    "إذا تحتاج تعديل الموعد، تواصل معنا قبل الحضور.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** E) Customer / vehicle arrived at the workshop. */
export function whatsappCustomerArrived(_booking: Booking): string {
  const message = [
    "تم تسجيل وصول السيارة وفتح ملف متابعة داخل الورشة.",
    "سيتم تحديثك عند انتهاء الفحص أو عند الحاجة لموافقة على الإصلاح.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

// ---------------------------------------------------------------------------
// Work order messages
// ---------------------------------------------------------------------------

/** A) Work order created. */
export function whatsappWorkOrderCreated(workOrder: WorkOrder): string {
  const message = [
    "تم فتح أمر عمل لسيارتك.",
    `رقم أمر العمل: ${workOrder.workOrderNumber}`,
    `السيارة: ${carLabel(
      workOrder.carMake,
      workOrder.carModel,
      workOrder.carYear
    )}`,
    `الشكوى: ${workOrder.complaint}`,
    "سيتم البدء بالفحص حسب ترتيب العمل داخل الورشة.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** B) Vehicle under inspection. */
export function whatsappUnderInspection(_workOrder: WorkOrder): string {
  const message = [
    "السيارة الآن في مرحلة الفحص والتشخيص.",
    "سيتم إبلاغك بالنتيجة قبل أي إصلاح أو تغيير قطع.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** C) Waiting for customer approval. */
export function whatsappWaitingCustomerApproval(_workOrder: WorkOrder): string {
  const message = [
    "تم تحديد التوصية الأولية ونحتاج موافقتك قبل تنفيذ العمل.",
    "لن يتم تنفيذ أي إصلاح قبل موافقتك.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}

/** D) Ready for pickup. */
export function whatsappReadyForPickup(_workOrder: WorkOrder): string {
  const message = [
    "السيارة جاهزة للاستلام.",
    "يرجى التواصل معنا لتأكيد وقت الاستلام.",
  ].join("\n");
  return buildWhatsAppUrl(message);
}
