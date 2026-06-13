"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";
import { customerRepository } from "@/lib/customer/customerRepository";
import type { CustomerAccount } from "@/lib/customer/types";
import { Card } from "@/components/ui/Card";
import { Detail } from "@/components/ui/Detail";
import { formatDateTime } from "@/lib/ui/display";

interface Document {
  id: string;
  customer_id: string;
  vehicle_id: string | null;
  booking_id: string | null;
  work_order_id: string | null;
  document_type: string;
  title: string;
  summary: string | null;
  file_url: string | null;
  customer_visible: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_TYPES = {
  diagnostic_report: "تقرير التشخيص",
  invoice: "الفاتورة",
  work_order_summary: "ملخص أمر العمل",
  approval: "موافقة العميل",
  scanner_report: "تقرير الماسح الضوئي",
  recommendation: "التوصية",
  service_record: "سجل الخدمة",
};

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const supabase = createAuthBrowserClient();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;

        if (!session) {
          setLoading(false);
          router.push("/customer/login");
          return;
        }

        const load = async () => {
          if (!isMounted) return;
          setLoading(true);
          setError(null);

          try {
            // Verify customer account is active
            const account = await customerRepository.getByAuthUserId(
              session.user.id
            );
            if (!account || account.status !== "active") {
              setError("حسابك غير مفعل بعد. تواصل مع الإدارة.");
              if (isMounted) setLoading(false);
              return;
            }

            if (isMounted) setAccount(account);

            // Load customer's visible documents
            const { data: docs, error: docsError } = await supabase
              .from("customer_documents")
              .select("id, customer_id, vehicle_id, booking_id, work_order_id, document_type, title, summary, file_url, customer_visible, uploaded_by, created_at, updated_at")
              .eq("customer_visible", true)
              .order("created_at", { ascending: false });

            if (docsError) throw docsError;

            if (isMounted) setDocuments(docs || []);
          } catch (err) {
            if (isMounted) {
              setError("تعذّر تحميل المستندات.");
              console.error("Error loading documents:", err);
            }
          } finally {
            if (isMounted) setLoading(false);
          }
        };

        load();
      }
    );

    // Fallback: if no auth state change after 2s, redirect to login
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        router.push("/customer/login");
      }
    }, 2000);

    setMounted(true);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription?.subscription.unsubscribe();
    };
  }, [router]);

  // Group documents by type for display
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, Document[]> = {};
    documents.forEach((doc) => {
      if (!groups[doc.document_type]) {
        groups[doc.document_type] = [];
      }
      groups[doc.document_type].push(doc);
    });
    return groups;
  }, [documents]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm text-gray-600">جاري تحميل المستندات...</p>
        </Card>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error || "حسابك غير متاح."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">المستندات الخاصة بي</h1>
        <p className="text-gray-600">عرض التقارير والفواتير والمستندات الأخرى</p>
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">لا توجد مستندات حالياً</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([docType, docs]) => (
            <div key={docType}>
              <h2 className="text-lg font-semibold text-black mb-3">
                {DOCUMENT_TYPES[docType as keyof typeof DOCUMENT_TYPES] || docType}
              </h2>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <Card
                    key={doc.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDetails(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{doc.title}</h3>
                        {doc.summary && (
                          <p className="text-sm text-gray-600 mt-1">{doc.summary}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ar-ltr">
                        {formatDateTime(doc.created_at)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Details Modal */}
      {showDetails && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">{selectedDocument.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <Detail label="نوع المستند">
                  {DOCUMENT_TYPES[selectedDocument.document_type as keyof typeof DOCUMENT_TYPES]}
                </Detail>
                {selectedDocument.summary && (
                  <Detail label="الملخص">{selectedDocument.summary}</Detail>
                )}
                <Detail label="تاريخ الإنشاء">
                  {formatDateTime(selectedDocument.created_at)}
                </Detail>
                <Detail label="ملف">
                  الملف سيكون متاحاً قريباً
                </Detail>
              </div>

              <div className="mt-6 flex gap-2 justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
