"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import { workOrderStatusLabels, type WorkOrderStatus } from "@/lib/statuses";
import { workOrderRepository } from "@/lib/work-orders/workOrderRepository";
import {
  whatsappWorkOrderCreated,
  whatsappUnderInspection,
  whatsappWaitingCustomerApproval,
  whatsappReadyForPickup,
} from "@/lib/whatsapp/whatsappMessages";
import type { WorkOrder } from "@/lib/work-orders/types";
import { workOrderStatusTone, formatDateTime, BTN_WHATSAPP } from "@/lib/ui/display";
import { WorkOrderFinancials } from "@/components/admin/WorkOrderFinancials";

// WhatsApp message actions available per work order (prepared links only).
const whatsappWorkOrderActions: {
  label: string;
  build: (workOrder: WorkOrder) => string;
}[] = [
  { label: "إرسال رقم أمر العمل", build: whatsappWorkOrderCreated },
  { label: "تحديث: قيد الفحص", build: whatsappUnderInspection },
  { label: "طلب موافقة العميل", build: whatsappWaitingCustomerApproval },
  { label: "إشعار جاهزية الاستلام", build: whatsappReadyForPickup },
];

export default function AdminWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | WorkOrderStatus>("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await workOrderRepository.list();
      setWorkOrders(data);
    } catch {
      setError("تعذّر تحميل أوامر العمل.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workOrders.filter((wo) => {
      if (statusFilter !== "all" && wo.status !== statusFilter) return false;
      if (term) {
        const haystack =
          `${wo.customerFullName} ${wo.phone} ${wo.workOrderNumber}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [workOrders, statusFilter, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-ink">أوامر العمل</h1>
          <p className="mt-1 text-ink-soft">
            أوامر العمل التي تم تحويلها من الحجوزات.
          </p>
        </div>
        <Button variant="outline" type="button" onClick={load}>
          تحديث
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="statusFilter" className="text-sm font-bold text-ink">
              حالة أمر العمل
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | WorkOrderStatus)
              }
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand"
            >
              <option value="all">كل الحالات</option>
              {(Object.keys(workOrderStatusLabels) as WorkOrderStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {workOrderStatusLabels[s]}
                  </option>
                )
              )}
            </select>
          </div>

          <Input
            id="search"
            label="بحث (الاسم، الجوال، أو رقم أمر العمل)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="مثال: WO-2026-0001"
          />
        </div>
      </Card>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <Card>
          <p className="text-sm text-ink-soft">جارٍ التحميل...</p>
        </Card>
      ) : workOrders.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <p className="text-base font-bold text-ink">لا توجد أوامر عمل بعد</p>
            <p className="mt-1 text-sm text-ink-soft">
              ستظهر أوامر العمل هنا عند تحويل الحجوزات من لوحة الحجوزات.
            </p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-ink-soft">
            لا توجد نتائج مطابقة للبحث أو التصفية.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">عدد النتائج: {filtered.length}</p>
          {filtered.map((wo) => (
            <WorkOrderCard key={wo.id} workOrder={wo} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkOrderCard({ workOrder }: { workOrder: WorkOrder }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-md bg-brand px-2 py-0.5 text-sm font-extrabold text-ink">
            {workOrder.workOrderNumber}
          </span>
          <h3 className="mt-2 break-words text-lg font-bold text-ink">
            {workOrder.customerFullName}
          </h3>
          <p className="text-sm text-ink-soft" dir="ltr">
            {workOrder.phone}
          </p>
        </div>
        <StatusBadge
          label={workOrderStatusLabels[workOrder.status]}
          tone={workOrderStatusTone[workOrder.status]}
        />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Detail label="السيارة">
          {workOrder.carMake} {workOrder.carModel} {workOrder.carYear}
        </Detail>
        {workOrder.plateNumber ? (
          <Detail label="رقم اللوحة">{workOrder.plateNumber}</Detail>
        ) : null}
        <Detail label="الشكوى">{workOrder.complaint}</Detail>
        <Detail label="تاريخ الإنشاء">
          {formatDateTime(workOrder.createdAt)}
        </Detail>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
        <span className="text-xs font-bold text-ink-soft">رسائل واتساب:</span>
        {whatsappWorkOrderActions.map((action) => (
          <a
            key={action.label}
            href={action.build(workOrder)}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_WHATSAPP}
          >
            {action.label}
          </a>
        ))}
      </div>

      <WorkOrderFinancials workOrder={workOrder} />
    </Card>
  );
}
