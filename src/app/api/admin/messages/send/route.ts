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
 * POST /api/admin/messages/send
 * Mark a message as sent (via wa.me link)
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
    const { message_id } = body;

    if (!message_id) {
      return NextResponse.json(
        { status: 'error', message: 'معرف الرسالة مطلوب' },
        { status: 400 }
      );
    }

    // Mark as sent
    const message = await whatsappService.markAsSent(message_id);
    if (!message) {
      return NextResponse.json(
        { status: 'error', message: 'الرسالة غير موجودة' },
        { status: 404 }
      );
    }

    // Simulate delivery after 3 seconds
    await whatsappService.simulateDelivery(message_id, 3000);

    return NextResponse.json(
      {
        status: 'success',
        message: 'تم إرسال الرسالة',
        message_data: message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json(
      { status: 'error', message: 'خطأ في إرسال الرسالة' },
      { status: 500 }
    );
  }
}
