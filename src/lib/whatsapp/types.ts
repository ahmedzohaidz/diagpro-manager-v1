/**
 * WhatsApp Service Type Definitions
 */

export type WhatsAppMessageStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface WhatsAppMessage {
  id: string;
  booking_id: string;
  phone_number: string;
  message_text: string;
  status: WhatsAppMessageStatus;
  wa_link: string;
  qr_code_url?: string;
  queued_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_reason?: string;
}

export interface WhatsAppStats {
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface WhatsAppQueueResponse {
  status: 'success' | 'error';
  message?: WhatsAppMessage;
  messages?: WhatsAppMessage[];
  stats?: WhatsAppStats;
  error?: string;
}
