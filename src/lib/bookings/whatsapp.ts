import type { Booking } from "./types";

/**
 * Builds a normal WhatsApp click-to-chat link (wa.me) for a booking.
 *
 * Phase 3 uses plain WhatsApp links only — NOT the WhatsApp Business API.
 */

// Workshop WhatsApp number (international format, no "+").
export const WORKSHOP_WHATSAPP_NUMBER = "966535473565";

/**
 * Builds a generic wa.me link with a pre-filled message — used by marketing
 * pages (home/services) that are not tied to a specific booking record.
 */
export function buildGeneralWhatsAppLink(message: string): string {
  return `https://wa.me/${WORKSHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppLink(booking: Booking): string {
  const lines = [
    "مرحباً، أرغب بتأكيد طلب حجز:",
    `الاسم: ${booking.customerFullName}`,
    `السيارة: ${booking.carMake} ${booking.carModel} ${booking.carYear}`,
    booking.plateNumber ? `رقم اللوحة: ${booking.plateNumber}` : null,
    `المشكلة: ${booking.problemDescription}`,
    `الموعد المفضل: ${booking.preferredDate} - ${booking.preferredTime}`,
  ].filter(Boolean);

  const message = lines.join("\n");
  return `https://wa.me/${WORKSHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
