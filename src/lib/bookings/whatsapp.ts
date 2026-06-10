/**
 * Builds a normal WhatsApp click-to-chat link (wa.me) with a pre-filled
 * message.
 *
 * Phase 3 uses plain WhatsApp links only — NOT the WhatsApp Business API.
 */

// Workshop WhatsApp number (international format, no "+").
export const WORKSHOP_WHATSAPP_NUMBER = "966535473565";

/**
 * Builds a generic wa.me link with a pre-filled message — used by marketing
 * pages and booking confirmations that send a free-form text message.
 */
export function buildGeneralWhatsAppLink(message: string): string {
  return `https://wa.me/${WORKSHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
