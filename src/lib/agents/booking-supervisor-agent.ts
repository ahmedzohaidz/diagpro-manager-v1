/**
 * Phase 21-2: Booking Supervisor Agent (Autonomous)
 *
 * Autonomous agent that:
 * 1. Runs on a schedule (cron or interval)
 * 2. Detects bookings needing action
 * 3. Generates and logs WhatsApp-ready messages
 * 4. Tracks all interactions in database
 * 5. Never modifies bookings directly
 */

import { createClient } from '@supabase/supabase-js';
import {
  whatsappMissingData,
  whatsappAppointmentReminder,
  whatsappAppointmentConfirmation,
} from '@/lib/whatsapp/whatsappMessages';
import type { Booking } from '@/lib/bookings/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

interface AgentAction {
  booking_id: string;
  action_type: string;
  reason: string;
  message_text: string;
  message_channel: string;
}

interface AgentRunResult {
  status: 'success' | 'error';
  timestamp: string;
  bookings_analyzed: number;
  actions_identified: number;
  messages_logged: number;
  errors?: string[];
  actions?: AgentAction[];
}

/**
 * Map raw database booking to Booking type
 */
function mapBooking(raw: any): Booking {
  return {
    id: raw.id,
    status: raw.status,
    priority: raw.priority || 'normal',
    customerFullName: raw.customer_full_name,
    phone: raw.phone_number || '',
    carMake: raw.car_make || '',
    carModel: raw.car_model || '',
    carYear: raw.car_year || '',
    problemDescription: raw.problem_description || '',
    isDrivable: raw.is_drivable ?? false,
    hasCheckEngineLight: raw.has_check_engine_light ?? false,
    preferredDate: raw.preferred_date || '',
    preferredTime: raw.preferred_time || '',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Extract plain text message from WhatsApp URL
 */
function extractMessageText(waUrl: string): string {
  try {
    const url = new URL(waUrl);
    const text = url.searchParams.get('text');
    return decodeURIComponent(text || '');
  } catch {
    return waUrl;
  }
}

/**
 * Determine what actions a booking needs
 */
function determineActions(booking: Booking): AgentAction[] {
  const actions: AgentAction[] = [];

  // Rule 1: Missing critical data → Request data
  if (!booking.phone) {
    actions.push({
      booking_id: booking.id,
      action_type: 'request_missing_data',
      reason: 'رقم الهاتف مفقود',
      message_text: extractMessageText(whatsappMissingData(booking)),
      message_channel: 'whatsapp',
    });
    return actions; // Stop here, can't proceed without phone
  }

  if (!booking.carMake || !booking.carModel) {
    actions.push({
      booking_id: booking.id,
      action_type: 'request_missing_data',
      reason: 'بيانات السيارة غير كاملة',
      message_text: extractMessageText(whatsappMissingData(booking)),
      message_channel: 'whatsapp',
    });
    return actions;
  }

  // Rule 2: Confirmed booking + close to date → Send reminder
  if (booking.status === 'confirmed' && booking.preferredDate) {
    const bookingDate = new Date(booking.preferredDate);
    const now = new Date();
    const daysUntil =
      (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Send reminder 1 day before
    if (daysUntil > 0 && daysUntil <= 1) {
      actions.push({
        booking_id: booking.id,
        action_type: 'send_reminder',
        reason: 'الموعد قريب (غداً أو اليوم)',
        message_text: extractMessageText(whatsappAppointmentReminder(booking)),
        message_channel: 'whatsapp',
      });
    }
  }

  // Rule 3: Appointment suggested → Request confirmation
  if (booking.status === 'appointment_suggested') {
    actions.push({
      booking_id: booking.id,
      action_type: 'send_confirmation_request',
      reason: 'انتظار تأكيد العميل',
      message_text: extractMessageText(
        whatsappAppointmentConfirmation(booking)
      ),
      message_channel: 'whatsapp',
    });
  }

  // Rule 4: New request with complete data → Send confirmation
  if (
    booking.status === 'new_request' &&
    booking.phone &&
    booking.carMake &&
    booking.problemDescription
  ) {
    actions.push({
      booking_id: booking.id,
      action_type: 'send_confirmation',
      reason: 'تأكيد استقبال الحجز',
      message_text: extractMessageText(
        whatsappAppointmentConfirmation(booking)
      ),
      message_channel: 'whatsapp',
    });
  }

  return actions;
}

/**
 * Main agent run: analyze bookings and log messages
 */
export async function runBookingSupervisorAgent(): Promise<AgentRunResult> {
  const startTime = new Date().toISOString();
  const errors: string[] = [];

  try {
    // Create Supabase client (using anon key - RLS handles security)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch all active bookings
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        priority,
        customer_full_name,
        phone_number,
        car_make,
        car_model,
        car_year,
        problem_description,
        is_drivable,
        has_check_engine_light,
        preferred_date,
        preferred_time,
        created_at,
        updated_at
      `)
      .not('status', 'eq', 'converted_to_work_order')
      .not('status', 'eq', 'cancelled')
      .not('status', 'eq', 'no_show')
      .order('created_at', { ascending: false });

    if (fetchError) {
      errors.push(`Failed to fetch bookings: ${fetchError.message}`);
      return {
        status: 'error',
        timestamp: startTime,
        bookings_analyzed: 0,
        actions_identified: 0,
        messages_logged: 0,
        errors,
      };
    }

    // 2. Analyze each booking
    const allActions: AgentAction[] = [];
    const typedBookings = (bookings || []).map(mapBooking);

    for (const booking of typedBookings) {
      const actions = determineActions(booking);
      allActions.push(...actions);
    }

    // 3. Log messages for each action
    let messagesLogged = 0;

    if (allActions.length > 0) {
      const messagesToLog = allActions.map((action) => ({
        booking_id: action.booking_id,
        direction: 'outbound' as const,
        message_text: action.message_text,
        channel: action.message_channel,
      }));

      const { error: insertError, data: inserted } = await supabase
        .from('booking_messages')
        .insert(messagesToLog)
        .select();

      if (insertError) {
        errors.push(`Failed to log messages: ${insertError.message}`);
      } else {
        messagesLogged = inserted?.length || 0;
      }

      // 4. Log agent run in status logs
      try {
        const { data: adminUser } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single();

        if (adminUser) {
          await supabase
            .from('booking_status_logs')
            .insert({
              booking_id: null,
              old_status: null,
              new_status: 'agent_run',
              changed_by: adminUser.id,
              note: `Booking Supervisor Agent ran automatically. Analyzed ${typedBookings.length} bookings, identified ${allActions.length} actions, logged ${messagesLogged} messages.`,
            });
        }
      } catch (logError) {
        // Non-critical error, continue
        console.warn('Failed to log agent run:', logError);
      }
    }

    return {
      status: 'success',
      timestamp: startTime,
      bookings_analyzed: typedBookings.length,
      actions_identified: allActions.length,
      messages_logged: messagesLogged,
      actions: allActions,
    };
  } catch (error) {
    errors.push(
      `Agent error: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      status: 'error',
      timestamp: startTime,
      bookings_analyzed: 0,
      actions_identified: 0,
      messages_logged: 0,
      errors,
    };
  }
}

/**
 * Get recent agent activity (for dashboard)
 */
export async function getAgentActivity(limitDays = 7) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const since = new Date();
    since.setDate(since.getDate() - limitDays);

    // Get agent run logs
    const { data: logs } = await supabase
      .from('booking_status_logs')
      .select('*')
      .eq('new_status', 'agent_run')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    // Get recent messages
    const { data: messages } = await supabase
      .from('booking_messages')
      .select(`
        id,
        booking_id,
        direction,
        channel,
        created_at,
        bookings (
          customer_full_name,
          status
        )
      `)
      .eq('direction', 'outbound')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    return {
      agent_runs: logs || [],
      recent_messages: messages || [],
      total_messages_sent: messages?.length || 0,
    };
  } catch (error) {
    console.error('Failed to get agent activity:', error);
    return {
      agent_runs: [],
      recent_messages: [],
      total_messages_sent: 0,
    };
  }
}
