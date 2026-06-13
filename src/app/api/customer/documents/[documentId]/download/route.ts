import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { customerRepository } from '@/lib/customer/customerRepository';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = params.documentId;

    if (!documentId) {
      return NextResponse.json(
        { status: 'error', message: 'معرّف المستند مطلوب' },
        { status: 400 }
      );
    }

    // Verify authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'غير مصرح (يرجى تسجيل الدخول)' },
        { status: 401 }
      );
    }

    // Verify customer account is active
    const account = await customerRepository.getByAuthUserId(user.id);
    if (!account || account.status !== 'active') {
      return NextResponse.json(
        { status: 'error', message: 'حسابك غير مفعل بعد' },
        { status: 403 }
      );
    }

    // Query document with RLS (customer_id filtering automatic)
    const { data: document, error: queryError } = await supabase
      .from('customer_documents')
      .select('id, customer_id, storage_path, original_filename, customer_visible')
      .eq('id', documentId)
      .single();

    // Handle query errors
    if (queryError) {
      if (queryError.code === 'PGRST116') {
        // No rows returned (RLS blocked or document doesn't exist)
        return NextResponse.json(
          { status: 'error', message: 'لا توجد صلاحية' },
          { status: 403 }
        );
      }
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { status: 'error', message: 'خطأ في الوصول إلى المستند' },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { status: 'error', message: 'المستند غير موجود' },
        { status: 404 }
      );
    }

    // Verify document belongs to current customer (defense in depth)
    if (document.customer_id !== account.id) {
      return NextResponse.json(
        { status: 'error', message: 'لا توجد صلاحية' },
        { status: 403 }
      );
    }

    // Verify customer_visible = true (admin-approved only)
    if (!document.customer_visible) {
      return NextResponse.json(
        { status: 'error', message: 'المستند غير متاح حالياً' },
        { status: 403 }
      );
    }

    // Verify storage_path exists (file should exist in bucket)
    if (!document.storage_path) {
      console.error('Document has no storage_path:', documentId);
      return NextResponse.json(
        { status: 'error', message: 'الملف غير موجود في التخزين' },
        { status: 404 }
      );
    }

    // Generate signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('customer-documents')
      .createSignedUrl(document.storage_path, 3600); // 3600 seconds = 1 hour

    if (signedUrlError) {
      console.error('Signed URL generation error:', signedUrlError);
      return NextResponse.json(
        { status: 'error', message: 'خطأ في إنشاء رابط التحميل' },
        { status: 500 }
      );
    }

    if (!signedUrlData?.signedUrl) {
      console.error('No signed URL returned from Storage');
      return NextResponse.json(
        { status: 'error', message: 'خطأ في الوصول إلى الملف' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        status: 'success',
        url: signedUrlData.signedUrl,
        expires_in: 3600,
        filename: document.original_filename,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { status: 'error', message: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
