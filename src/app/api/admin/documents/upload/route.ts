import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Configuration
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const DOCUMENT_TYPES = [
  'diagnostic_report',
  'invoice',
  'work_order_summary',
  'approval',
  'scanner_report',
  'recommendation',
  'service_record',
];

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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'غير مصرح (يرجى تسجيل الدخول)' },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: staff } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!staff || staff.role !== 'admin') {
      return NextResponse.json(
        { status: 'error', message: 'لا يوجد صلاحية (مسؤول فقط)' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customer_id = formData.get('customer_id') as string;
    const document_type = formData.get('document_type') as string;
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string | null;
    const booking_id = formData.get('booking_id') as string | null;
    const work_order_id = formData.get('work_order_id') as string | null;
    const vehicle_id = formData.get('vehicle_id') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'الملف مطلوب' },
        { status: 400 }
      );
    }

    if (!customer_id) {
      return NextResponse.json(
        { status: 'error', message: 'معرّف العميل مطلوب' },
        { status: 400 }
      );
    }

    if (!document_type) {
      return NextResponse.json(
        { status: 'error', message: 'نوع المستند مطلوب' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { status: 'error', message: 'عنوان المستند مطلوب' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'نوع الملف غير مسموح. الأنواع المسموحة: PDF, JPG, PNG',
        },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'امتداد الملف غير صحيح. الامتدادات المسموحة: .pdf, .jpg, .jpeg, .png',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          status: 'error',
          message: `حجم الملف كبير جداً. الحد الأقصى: 50 MB، الحجم الفعلي: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        },
        { status: 413 }
      );
    }

    // Validate document_type
    if (!DOCUMENT_TYPES.includes(document_type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: `نوع المستند غير صحيح. الأنواع المسموحة: ${DOCUMENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Verify customer exists
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .single();

    if (!customer) {
      return NextResponse.json(
        { status: 'error', message: 'العميل غير موجود' },
        { status: 400 }
      );
    }

    // Verify work_order if provided (must belong to same customer)
    if (work_order_id) {
      const { data: workOrder } = await supabase
        .from('work_orders')
        .select('id, customer_id')
        .eq('id', work_order_id)
        .eq('customer_id', customer_id)
        .single();

      if (!workOrder) {
        return NextResponse.json(
          { status: 'error', message: 'أمر العمل تابع لعميل آخر أو غير موجود' },
          { status: 400 }
        );
      }
    }

    // Verify vehicle if provided (must belong to same customer)
    if (vehicle_id) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id, customer_id')
        .eq('id', vehicle_id)
        .eq('customer_id', customer_id)
        .single();

      if (!vehicle) {
        return NextResponse.json(
          { status: 'error', message: 'السيارة تابعة لعميل آخر أو غير موجودة' },
          { status: 400 }
        );
      }
    }

    // Verify booking if provided (must belong to same customer)
    if (booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, customer_id')
        .eq('id', booking_id)
        .eq('customer_id', customer_id)
        .single();

      if (!booking) {
        return NextResponse.json(
          { status: 'error', message: 'الحجز تابع لعميل آخر أو غير موجود' },
          { status: 400 }
        );
      }
    }

    // Store metadata in database (file_url and storage_path will be null for now)
    const { data: document, error: dbError } = await supabase
      .from('customer_documents')
      .insert({
        customer_id,
        document_type,
        title,
        summary: summary || null,
        booking_id: booking_id || null,
        work_order_id: work_order_id || null,
        vehicle_id: vehicle_id || null,
        file_url: null, // Will be filled in Phase 20C-2
        storage_path: null, // Will be filled in Phase 20C-2
        original_filename: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
        customer_visible: false, // Admin must toggle after upload
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { status: 'error', message: 'خطأ في حفظ المستند في قاعدة البيانات' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'تم تسجيل بيانات المستند بنجاح، وسيتم تفعيل حفظ الملف في Phase 20C-2',
        document_id: document.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { status: 'error', message: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
