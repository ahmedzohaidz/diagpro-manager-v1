/**
 * Phase 22-1: Mock WhatsApp Service (No API)
 *
 * Features:
 * - Message queueing (in-memory)
 * - wa.me link generation
 * - QR code generation
 * - Delivery simulation
 * - Status tracking
 *
 * This is a local/development service that simulates WhatsApp messaging
 * without requiring actual API credentials or costs.
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export interface QueuedMessage {
  id: string;
  booking_id: string;
  phone_number: string;
  message_text: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  wa_link: string;
  qr_code_url?: string;
  queued_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
}

interface MessageStore {
  [key: string]: QueuedMessage;
}

// In-memory message store (replaced by database in production)
let messageStore: MessageStore = {};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Mock WhatsApp Service
 * Simulates WhatsApp messaging without API
 */
export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Queue a message for sending
   */
  async queueMessage(
    bookingId: string,
    phoneNumber: string,
    messageText: string
  ): Promise<QueuedMessage> {
    const messageId = `msg_${crypto.randomUUID()}`;
    const waLink = this.generateWALink(phoneNumber, messageText);

    const message: QueuedMessage = {
      id: messageId,
      booking_id: bookingId,
      phone_number: phoneNumber,
      message_text: messageText,
      status: 'queued',
      wa_link: waLink,
      queued_at: new Date().toISOString(),
    };

    // Store in memory
    messageStore[messageId] = message;

    // Also persist to database
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('whatsapp_message_queue').insert({
        id: messageId,
        booking_id: bookingId,
        phone_number: phoneNumber,
        message_text: messageText,
        status: 'queued',
        wa_link: waLink,
        queued_at: message.queued_at,
      });
    } catch (error) {
      console.warn('Failed to persist to database:', error);
      // Continue anyway - in-memory store is fallback
    }

    return message;
  }

  /**
   * Get all pending messages
   */
  async getPendingMessages(): Promise<QueuedMessage[]> {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('whatsapp_message_queue')
        .select('*')
        .in('status', ['queued', 'sent'])
        .order('queued_at', { ascending: false });

      return (data || []) as QueuedMessage[];
    } catch (error) {
      console.warn('Failed to fetch from database:', error);
      // Fallback to in-memory
      return Object.values(messageStore).filter(
        (m) => m.status === 'queued' || m.status === 'sent'
      );
    }
  }

  /**
   * Mark message as sent (user sent via wa.me link)
   */
  async markAsSent(messageId: string): Promise<QueuedMessage | null> {
    const message = messageStore[messageId];
    if (!message) return null;

    message.status = 'sent';
    message.sent_at = new Date().toISOString();

    // Update database
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'sent',
          sent_at: message.sent_at,
        })
        .eq('id', messageId);
    } catch (error) {
      console.warn('Failed to update database:', error);
    }

    return message;
  }

  /**
   * Simulate delivery (auto-update after delay)
   */
  async simulateDelivery(messageId: string, delayMs = 3000): Promise<void> {
    setTimeout(async () => {
      const message = messageStore[messageId];
      if (!message) return;

      message.status = 'delivered';
      message.delivered_at = new Date().toISOString();

      // Update database
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('whatsapp_message_queue')
          .update({
            status: 'delivered',
            delivered_at: message.delivered_at,
          })
          .eq('id', messageId);

        // Also update booking_messages table for record
        await supabase
          .from('booking_messages')
          .update({
            whatsapp_status: 'delivered',
            whatsapp_status_updated_at: message.delivered_at,
          })
          .eq('whatsapp_message_id', messageId);
      } catch (error) {
        console.warn('Failed to update delivery status:', error);
      }
    }, delayMs);
  }

  /**
   * Generate wa.me link for manual sending
   */
  generateWALink(phoneNumber: string, message: string): string {
    // Clean phone number (remove + and spaces)
    const cleanPhone = phoneNumber.replace(/[\s+]/g, '');

    // Ensure it starts with country code
    const internationalPhone = cleanPhone.startsWith('966')
      ? cleanPhone
      : `966${cleanPhone.slice(-9)}`; // Saudi Arabia default

    return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(
      message
    )}`;
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<QueuedMessage | null> {
    return messageStore[messageId] || null;
  }

  /**
   * Get messages for a booking
   */
  async getBookingMessages(bookingId: string): Promise<QueuedMessage[]> {
    return Object.values(messageStore).filter((m) => m.booking_id === bookingId);
  }

  /**
   * Clear old messages (cleanup)
   */
  async cleanupOldMessages(olderThanHours = 24): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

    const oldMessages = Object.entries(messageStore)
      .filter(
        ([, msg]) =>
          new Date(msg.queued_at) < cutoffTime &&
          (msg.status === 'delivered' || msg.status === 'read')
      )
      .map(([id]) => id);

    oldMessages.forEach((id) => {
      delete messageStore[id];
    });

    return oldMessages.length;
  }

  /**
   * Get statistics
   */
  getStats() {
    const messages = Object.values(messageStore);
    return {
      total: messages.length,
      queued: messages.filter((m) => m.status === 'queued').length,
      sent: messages.filter((m) => m.status === 'sent').length,
      delivered: messages.filter((m) => m.status === 'delivered').length,
      read: messages.filter((m) => m.status === 'read').length,
      failed: messages.filter((m) => m.status === 'failed').length,
    };
  }
}

// Export singleton instance
export const whatsappService = WhatsAppService.getInstance();
