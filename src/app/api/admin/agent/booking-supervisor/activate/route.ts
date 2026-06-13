import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  analyzeBookings,
  buildRecommendations,
} from '@/lib/booking-supervisor/bookingSupervisor';
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

    const supabase = await createSupabaseServerClient();

    // Fetch all bookings with customer & vehicle data
    const { data: bookings, error: fetchError } = await supabase
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
      .not('status', 'eq', 'no_show')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch bookings error:', fetchError);
      return NextResponse.json(
        { status: 'error', message: 'خطأ في جلب الحجوزات' },
        { status: 500 }
      );
    }

    // Map to internal Booking type
    const typedBookings: Booking[] = (bookings || []).map((b: any) => ({
      id: b.id,
      status: b.status,
      priority: b.priority || 'normal',
      customerFullName: b.customer_full_name,
      phone: b.phone_number || '',
      carMake: b.car_make || '',
      carModel: b.car_model || '',
      carYear: b.car_year || '',
      problemDescription: b.problem_description || '',
      isDrivable: b.is_drivable ?? false,
      hasCheckEngineLight: b.has_check_engine_light ?? false,
      preferredDate: b.preferred_date || '',
      preferredTime: b.preferred_time || '',
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));

    // Analyze with supervisor logic
    const analysis = analyzeBookings(typedBookings);

    // Log activation in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userData) {
        await supabase
          .from('booking_status_logs')
          .insert({
            booking_id: null,
            old_status: null,
            new_status: 'agent_activated',
            changed_by: userData.id,
            note: `Booking Supervisor Agent activated. Analyzed ${typedBookings.length} bookings, ${analysis.items.length} need attention.`,
          })
          .throwOnError();
      }
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Agent activated successfully',
        analysis: {
          summary: analysis.summary,
          items_needing_action: analysis.items.map((item) => ({
            booking_id: item.booking.id,
            customer_name: item.booking.customerFullName,
            status: item.booking.status,
            urgency_score: item.urgencyScore,
            recommendations: item.recommendations,
            missing_fields: detectMissingFields(item.booking),
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Agent activation error:', error);
    return NextResponse.json(
      { status: 'error', message: 'خطأ في تفعيل الـ Agent' },
      { status: 500 }
    );
  }
}

function detectMissingFields(booking: Booking): string[] {
  const missing: string[] = [];

  if (!booking.phone) missing.push('رقم الهاتف');
  if (!booking.carMake) missing.push('ماركة السيارة');
  if (!booking.carModel) missing.push('موديل السيارة');
  if (!booking.carYear) missing.push('سنة السيارة');
  if (!booking.problemDescription) missing.push('وصف المشكلة');
  if (booking.isDrivable === null || booking.isDrivable === undefined)
    missing.push('هل السيارة تمشي');
  if (!booking.preferredDate) missing.push('التاريخ المفضل');
  if (!booking.preferredTime) missing.push('الوقت المفضل');

  return missing;
}
