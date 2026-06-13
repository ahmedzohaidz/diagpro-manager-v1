import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { whatsappService } from '@/lib/whatsapp/whatsapp-service';

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

/**
 * GET /api/admin/messages/queue
 * Get pending WhatsApp messages
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminAccess = await is_admin();
    if (!adminAccess) {
      return NextResponse.json(
        { status: 'error', message: 'لا يوجد صلاحية (مسؤول فقط)' },
        { status: 403 }
      );
    }

    // Get pending messages
    const messages = await whatsappService.getPendingMessages();
    const stats = whatsappService.getStats();

    return NextResponse.json(
      {
        status: 'success',
        messages,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Queue fetch error:', error);
    return NextResponse.json(
      { status: 'error', message: 'خطأ في جلب الرسائل' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/messages/queue
 * Add a new message to queue
 */
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

    const body = await request.json();
    const { booking_id, phone_number, message_text } = body;

    if (!booking_id || !phone_number || !message_text) {
      return NextResponse.json(
        { status: 'error', message: 'بيانات ناقصة' },
        { status: 400 }
      );
    }

    // Queue the message
    const message = await whatsappService.queueMessage(
      booking_id,
      phone_number,
      message_text
    );

    // Simulate delivery after 3 seconds
    await whatsappService.simulateDelivery(message.id, 3000);

    return NextResponse.json(
      {
        status: 'success',
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json(
      { status: 'error', message: 'خطأ في إضافة الرسالة' },
      { status: 500 }
    );
  }
}
