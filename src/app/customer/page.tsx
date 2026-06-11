"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";
import { customerRepository } from "@/lib/customer/customerRepository";
import type { CustomerAccount } from "@/lib/customer/types";
import { Card } from "@/components/ui/Card";

/**
 * Customer dashboard (Phase 20A).
 * Displays snapshot data from customer_accounts only.
 * Does NOT read from customers/vehicles/work_orders/documents tables.
 */

export default function CustomerDashboardPage() {
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const supabase = createAuthBrowserClient();

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.push("/customer/login");
          return;
        }

        setEmail(data.session.user.email ?? null);

        const account = await customerRepository.getByAuthUserId(
          data.session.user.id
        );
        if (!account) {
          setError("حسابك غير مفعل بعد. تواصل مع الإدارة.");
          setLoading(false);
          return;
        }

        setAccount(account);
      } catch {
        setError("تعذّر تحميل حسابك.");
      } finally {
        setLoading(false);
      }
    };

    load();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push("/customer/login");
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-ink-soft">جارٍ تحميل الحساب...</p>
      </Card>
    );
  }

  if (error || !account) {
    return (
      <Card>
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {error || "حسابك غير متاح."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="min-w-0">
        <h1 className="text-2xl font-extrabold text-ink">حسابي</h1>
        <p className="mt-1 text-ink-soft">معلومات الحساب والبيانات الشخصية</p>
      </header>

      <Card>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-ink-soft">الاسم</label>
              <p className="mt-1 text-base font-bold text-ink">
                {account.displayName}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-soft">
                البريد الإلكتروني
              </label>
              <p className="mt-1 break-words text-base font-bold text-ink" dir="ltr">
                {email}
              </p>
            </div>

            {account.phoneLast4 && (
              <div>
                <label className="text-xs font-bold text-ink-soft">
                  الجوال
                </label>
                <p className="mt-1 text-base font-bold text-ink">
                  ...{account.phoneLast4}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-ink-soft">
                حالة الحساب
              </label>
              <p className="mt-1 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold">
                {account.status === "active" ? (
                  <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                    نشط
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                    معطل
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h2 className="text-lg font-extrabold text-ink">قريباً</h2>
          <p className="text-sm text-ink-soft">
            سيتم تفعيل سجل الصيانة السحابي الكامل قريبًا، حيث ستتمكن من:
          </p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>✓ عرض سياراتك وسجل الصيانة لكل سيارة</li>
            <li>✓ تتبع حالة أوامر العمل الحالية</li>
            <li>✓ عرض التقارير والفواتير</li>
            <li>✓ تحميل تقارير الفحص والموافقات</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
