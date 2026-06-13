import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  whatsappBookingReceived,
  whatsappMissingData,
  whatsappAppointmentConfirmation,
  whatsappAppointmentReminder,
} from '@/lib/whatsapp/whatsappMessages';
import type { Booking } from '@/lib/bookings/types';

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

async function is_admin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  return userData?.role === 'admin';
}

interface CheckRequest {
  dry_run?: boolean;
  auto_send?: boolean;
  filter_status?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminAccess = await is_admin();
    if (!adminAccess) {
      return NextResponse.json(
        { status: 'error', message: 'لا يوجد صلاحية (مسؤول فقط)' },
        { status: 403 }
      );
    }

    const body: CheckRequest = await request.json();
    const dryRun = body.dry_run !== false;
    const autoSend = body.auto_send === true && !dryRun;
    const filterStatus = body.filter_status || null;

    const supabase = await createSupabaseServerClient();

    // Fetch bookings that need attention
    let query = supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        vehicle_id,
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
      .not('status', 'eq', 'no_show');

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data: bookings, error: fetchError } = await query.order(
      'created_at',
      { ascending: false }
    );

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { status: 'error', message: 'خطأ في جلب الحجوزات' },
        { status: 500 }
      );
    }

    // Process each booking
    const results = [];
    const messagesToLog = [];

    for (const b of bookings || []) {
      const booking = mapToBooking(b);
      const actions = determinActions(booking);

      for (const action of actions) {
        const message = generateMessage(booking, action);

        results.push({
          booking_id: booking.id,
          customer_name: booking.customerFullName,
          status: booking.status,
          action: action.type,
          reason: action.reason,
          message_preview: message.substring(0, 100) + '...',
          would_send: !dryRun,
        });

        if (autoSend) {
          messagesToLog.push({
            booking_id: booking.id,
            direction: 'outbound',
            message_text: message,
            channel: 'whatsapp',
          });
        }
      }
    }

    // If autoSend and not dryRun, log messages to database
    let loggedCount = 0;
    if (autoSend && messagesToLog.length > 0) {
      const { error: insertError } = await supabase
        .from('booking_messages')
        .insert(messagesToLog);

      if (!insertError) {
        loggedCount = messagesToLog.length;
      } else {
        console.error('Insert messages error:', insertError);
      }
    }

    return NextResponse.json(
      {
        status: 'success',
        mode: dryRun ? 'dry_run' : 'live',
        summary: {
          bookings_checked: bookings?.length || 0,
          actions_identified: results.length,
          messages_would_send: dryRun ? results.length : 0,
          messages_logged: loggedCount,
        },
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Agent check error:', error);
    return NextResponse.json(
      { status: 'error', message: 'خطأ في تشغيل الفحص' },
      { status: 500 }
    );
  }
}

function mapToBooking(raw: any): Booking {
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

interface Action {
  type: string;
  reason: string;
}

function determinActions(booking: Booking): Action[] {
  const actions: Action[] = [];

  // Rule 1: Missing critical data
  if (!booking.phone) {
    actions.push({
      type: 'request_missing_data',
      reason: 'رقم الهاتف مفقود',
    });
  } else if (!booking.carMake || !booking.carModel) {
    actions.push({
      type: 'request_missing_data',
      reason: 'بيانات السيارة غير كاملة',
    });
  }

  // Rule 2: Confirmed but needs reminder
  if (booking.status === 'confirmed' && booking.preferredDate) {
    const bookingDate = new Date(booking.preferredDate);
    const now = new Date();
    const daysUntilBooking =
      (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Send reminder 1 day before
    if (daysUntilBooking > 0 && daysUntilBooking <= 1) {
      actions.push({
        type: 'send_reminder',
        reason: 'الموعد قريب (في خلال 24 ساعة)',
      });
    }
  }

  // Rule 3: Pending appointment suggestion
  if (booking.status === 'appointment_suggested') {
    actions.push({
      type: 'send_confirmation_request',
      reason: 'انتظار تأكيد العميل للموعد المقترح',
    });
  }

  // Rule 4: New request with complete data
  if (
    booking.status === 'new_request' &&
    booking.phone &&
    booking.carMake &&
    booking.problemDescription
  ) {
    actions.push({
      type: 'send_confirmation',
      reason: 'استقبال الحجز وتأكيد البيانات',
    });
  }

  return actions;
}

function generateMessage(booking: Booking, action: Action): string {
  // Extract just the message text (without wa.me URL for logging)
  function extractMessageText(url: string): string {
    const params = new URL(url).searchParams;
    return decodeURIComponent(params.get('text') || '');
  }

  switch (action.type) {
    case 'request_missing_data':
      return extractMessageText(whatsappMissingData(booking));
    case 'send_reminder':
      return extractMessageText(whatsappAppointmentReminder(booking));
    case 'send_confirmation':
      return extractMessageText(whatsappBookingReceived(booking));
    case 'send_confirmation_request':
      return extractMessageText(whatsappAppointmentConfirmation(booking));
    default:
      return 'رسالة تحديث حالة';
  }
}
