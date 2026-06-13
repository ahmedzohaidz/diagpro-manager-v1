"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import { getSupabaseClient } from "@/lib/supabaseClient";
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

interface CustomerInfo {
  id: string;
  full_name: string;
  phone: string;
}

interface DocumentWithCustomer extends Document {
  customer?: CustomerInfo;
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithCustomer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data: docs, error } = await supabase
        .from("customer_documents")
        .select("id, customer_id, vehicle_id, booking_id, work_order_id, document_type, title, summary, file_url, customer_visible, uploaded_by, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load customer info for each document
      const withCustomers = await Promise.all(
        (docs || []).map(async (doc) => {
          const { data: customer } = await supabase
            .from("customers")
            .select("id, full_name, phone")
            .eq("id", doc.customer_id)
            .single();
          return { ...doc, customer };
        })
      );

      setDocuments(withCustomers as DocumentWithCustomer[]);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchCustomer =
        !searchCustomer ||
        doc.customer?.full_name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        doc.customer?.phone?.includes(searchCustomer);

      const matchType = filterType === "all" || doc.document_type === filterType;

      const matchVisibility =
        filterVisibility === "all" ||
        (filterVisibility === "visible" && doc.customer_visible) ||
        (filterVisibility === "hidden" && !doc.customer_visible);

      return matchCustomer && matchType && matchVisibility;
    });
  }, [documents, searchCustomer, filterType, filterVisibility]);

  const toggleVisibility = async (doc: DocumentWithCustomer) => {
    try {
      setConfirmingId(null);
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("customer_documents")
        .update({ customer_visible: !doc.customer_visible })
        .eq("id", doc.id);

      if (error) throw error;
      await loadDocuments();
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setConfirmingId(null);
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("customer_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">المستندات</h1>
        <p className="text-gray-600">إدارة مستندات العملاء والفواتير والتقارير</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-black mb-4">تصفية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Customer search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم العميل أو الهاتف
            </label>
            <Input
              type="text"
              placeholder="ابحث عن العميل..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
            />
          </div>

          {/* Document type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع المستند
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">الكل</option>
              {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مرئي للعميل
            </label>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">الكل</option>
              <option value="visible">نعم (مرئي)</option>
              <option value="hidden">لا (مخفي)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">لا توجد مستندات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    اسم العميل
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    العنوان
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    النوع
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    مرئي للعميل
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {doc.customer?.full_name || "مجهول"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{doc.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES] ||
                          doc.document_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge
                        label={doc.customer_visible ? "نعم" : "لا"}
                        tone={doc.customer_visible ? "success" : "neutral"}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(doc.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowDetails(true);
                        }}
                        className="text-xs px-3 py-1"
                      >
                        عرض
                      </Button>
                      <Button
                        variant={doc.customer_visible ? "primary" : "outline"}
                        onClick={() =>
                          doc.customer_visible ? setConfirmingId(doc.id) : toggleVisibility(doc)
                        }
                        className="text-xs px-3 py-1"
                      >
                        {doc.customer_visible ? "إخفاء" : "إظهار"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setConfirmingId(`delete-${doc.id}`)}
                        className="text-xs px-3 py-1"
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
                <Detail label="اسم العميل">{selectedDocument.customer?.full_name}</Detail>
                <Detail label="النوع">
                  {DOCUMENT_TYPES[selectedDocument.document_type as keyof typeof DOCUMENT_TYPES]}
                </Detail>
                <Detail label="الملخص">{selectedDocument.summary}</Detail>
                <Detail label="مرئي للعميل">
                  {selectedDocument.customer_visible ? "نعم" : "لا"}
                </Detail>
                <Detail label="تاريخ الإنشاء">{formatDateTime(selectedDocument.created_at)}</Detail>
              </div>

              <div className="mt-6 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialogs */}
      {confirmingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-black mb-4">تأكيد الإجراء</h3>
              <p className="text-gray-700 mb-6">
                {confirmingId.startsWith("delete-")
                  ? "هل أنت متأكد من رغبتك في حذف هذا المستند؟"
                  : "هل أنت متأكد من رغبتك في إخفاء هذا المستند عن العميل؟"}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setConfirmingId(null)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (confirmingId.startsWith("delete-")) {
                      deleteDocument(confirmingId.replace("delete-", ""));
                    } else {
                      const doc = documents.find((d) => d.id === confirmingId);
                      if (doc) toggleVisibility(doc);
                    }
                  }}
                >
                  تأكيد
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
