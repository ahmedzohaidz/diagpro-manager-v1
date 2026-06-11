"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import {
  quoteStatusLabels,
  paymentStatusLabels,
  paymentMethodLabels,
  type QuoteStatus,
  type PaymentMethod,
} from "@/lib/statuses";
import { workOrderRepository } from "@/lib/work-orders/workOrderRepository";
import type {
  WorkOrder,
  WorkOrderService,
  WorkOrderPayment,
} from "@/lib/work-orders/types";
import {
  summarize,
  lineTotal,
  nextQuoteStatuses,
  canEditServices,
  quoteHasContent,
  canGenerateInvoice,
  canRecordPayment,
  canDeliver,
} from "@/lib/work-orders/financials";
import {
  formatCurrency,
  formatDateTime,
  quoteStatusTone,
  paymentStatusTone,
  customerApprovalView,
  BTN_PRIMARY,
  BTN_NEUTRAL,
} from "@/lib/ui/display";

const FIELD =
  "w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-brand";

// Arabic label for moving the quote to each target status.
const QUOTE_ACTION_LABELS: Record<QuoteStatus, string> = {
  draft: "إرجاع إلى مسودة",
  sent: "إرسال العرض للعميل",
  approved: "تسجيل موافقة العميل",
  rejected: "تسجيل رفض العميل",
};

function parseNum(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Collapsible financial closure panel rendered inside a work order card
 * (Phase 19A). Holds the whole money flow for one work order: quote line items,
 * quote status, derived customer approval, a simple invoice, and the payment
 * ledger with computed totals. Loads its data lazily on first expand.
 */
export function WorkOrderFinancials({
  workOrder,
}: {
  workOrder: WorkOrder;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [wo, setWo] = useState<WorkOrder>(workOrder);
  const [services, setServices] = useState<WorkOrderService[]>([]);
  const [payments, setPayments] = useState<WorkOrderPayment[]>([]);

  // New-service form.
  const [svcName, setSvcName] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcQty, setSvcQty] = useState("1");
  const [svcMinutes, setSvcMinutes] = useState("");
  const [svcNotes, setSvcNotes] = useState("");

  // Discount form.
  const [discountAmount, setDiscountAmount] = useState(
    workOrder.discountAmount > 0 ? String(workOrder.discountAmount) : ""
  );
  const [discountReason, setDiscountReason] = useState(
    workOrder.discountReason ?? ""
  );

  // New-payment form.
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [payNote, setPayNote] = useState("");

  const summary = summarize(services, payments, wo.discountAmount);
  const editable = canEditServices(wo);
  const approval = customerApprovalView(wo.quoteStatus);

  async function reload(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [fresh, svc, pmt] = await Promise.all([
        workOrderRepository.getById(workOrder.id),
        workOrderRepository.listServices(workOrder.id),
        workOrderRepository.listPayments(workOrder.id),
      ]);
      if (fresh) setWo(fresh);
      setServices(svc);
      setPayments(pmt);
      setLoaded(true);
    } catch {
      setError("تعذّر تحميل البيانات المالية.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded && !loading) void reload();
  }

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      await reload(true);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "تعذّر تنفيذ العملية."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleAddService() {
    const name = svcName.trim();
    const unitPrice = parseNum(svcPrice);
    const quantity = Math.max(1, Math.floor(parseNum(svcQty) || 1));
    const minutes = svcMinutes.trim() ? Math.max(0, Math.floor(parseNum(svcMinutes))) : undefined;
    if (!name) {
      setActionError("أدخل اسم الخدمة.");
      return;
    }
    if (unitPrice < 0) {
      setActionError("السعر غير صالح.");
      return;
    }
    void run(async () => {
      await workOrderRepository.addService(wo.id, {
        name,
        unitPrice,
        quantity,
        estimatedMinutes: minutes,
        notes: svcNotes.trim() || undefined,
      });
      setSvcName("");
      setSvcPrice("");
      setSvcQty("1");
      setSvcMinutes("");
      setSvcNotes("");
    });
  }

  function handleSaveDiscount() {
    const amount = parseNum(discountAmount);
    const reason = discountReason.trim();
    if (amount > 0 && !reason) {
      setActionError("يجب إدخال سبب الخصم.");
      return;
    }
    void run(() =>
      workOrderRepository.setDiscount(wo.id, amount, reason || null)
    );
  }

  function handleAddPayment() {
    const amount = parseNum(payAmount);
    if (amount <= 0) {
      setActionError("أدخل مبلغًا صحيحًا.");
      return;
    }
    if (amount > summary.remaining) {
      setActionError("المبلغ أكبر من المتبقي.");
      return;
    }
    void run(async () => {
      await workOrderRepository.addPayment(wo.id, {
        amount,
        method: payMethod,
        note: payNote.trim() || undefined,
      });
      setPayAmount("");
      setPayNote("");
    });
  }

  const hasContent = quoteHasContent(services, summary.total);

  return (
    <div className="mt-4 border-t border-ink/10 pt-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-md bg-ink/[0.03] px-3 py-2 text-right transition-colors hover:bg-ink/[0.06]"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-ink">القسم المالي</span>
          <StatusBadge
            label={`عرض السعر: ${quoteStatusLabels[wo.quoteStatus]}`}
            tone={quoteStatusTone[wo.quoteStatus]}
          />
          {wo.invoiceNumber ? (
            <StatusBadge label={`فاتورة: ${wo.invoiceNumber}`} tone="dark" />
          ) : null}
        </span>
        <span className="text-xs font-bold text-ink-soft">
          {open ? "إخفاء ▲" : "عرض ▼"}
        </span>
      </button>

      {open && (
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-ink-soft">جارٍ تحميل البيانات المالية...</p>
          ) : error ? (
            <div className="space-y-2">
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {error}
              </p>
              <button type="button" onClick={() => void reload()} className={BTN_NEUTRAL}>
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {actionError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {actionError}
                </p>
              )}

              {/* Status row */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={`عرض السعر: ${quoteStatusLabels[wo.quoteStatus]}`}
                  tone={quoteStatusTone[wo.quoteStatus]}
                />
                <StatusBadge label={approval.label} tone={approval.tone} />
                <StatusBadge
                  label={`الدفع: ${paymentStatusLabels[summary.paymentStatus]}`}
                  tone={paymentStatusTone[summary.paymentStatus]}
                />
                <StatusBadge
                  label={
                    canDeliver(wo)
                      ? "الإغلاق المالي: مكتمل"
                      : "الإغلاق المالي: غير مكتمل"
                  }
                  tone={canDeliver(wo) ? "success" : "neutral"}
                />
              </div>

              {/* Services / quote line items */}
              <section className="space-y-3">
                <h4 className="text-sm font-extrabold text-ink">
                  الخدمات وعرض السعر
                </h4>

                {services.length === 0 ? (
                  <p className="rounded-md border border-dashed border-ink/20 px-3 py-3 text-center text-sm text-ink-soft">
                    لا توجد خدمات بعد. أضف خدمة لبناء عرض السعر.
                  </p>
                ) : (
                  <ul className="divide-y divide-ink/10 rounded-md border border-ink/10">
                    {services.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-ink">{s.name}</p>
                          <p className="text-xs text-ink-soft">
                            {formatCurrency(s.unitPrice)} × {s.quantity}
                            {s.estimatedMinutes != null
                              ? ` • مدة تقديرية: ${s.estimatedMinutes} د`
                              : ""}
                            {s.notes ? ` • ${s.notes}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-ink">
                            {formatCurrency(lineTotal(s))}
                          </span>
                          {editable && (
                            <button
                              type="button"
                              onClick={() =>
                                void run(() =>
                                  workOrderRepository.removeService(s.id)
                                )
                              }
                              disabled={busy}
                              className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-40"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {editable ? (
                  <div className="rounded-md border border-ink/10 bg-ink/[0.02] p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className={FIELD}
                        placeholder="اسم الخدمة"
                        value={svcName}
                        onChange={(e) => setSvcName(e.target.value)}
                      />
                      <input
                        className={FIELD}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="السعر (ر.س)"
                        value={svcPrice}
                        onChange={(e) => setSvcPrice(e.target.value)}
                      />
                      <input
                        className={FIELD}
                        type="number"
                        min={1}
                        step="1"
                        placeholder="الكمية"
                        value={svcQty}
                        onChange={(e) => setSvcQty(e.target.value)}
                      />
                      <input
                        className={FIELD}
                        type="number"
                        min={0}
                        step="1"
                        placeholder="مدة تقديرية بالدقائق (اختياري)"
                        value={svcMinutes}
                        onChange={(e) => setSvcMinutes(e.target.value)}
                      />
                      <input
                        className={`${FIELD} sm:col-span-2`}
                        placeholder="ملاحظات (اختياري)"
                        value={svcNotes}
                        onChange={(e) => setSvcNotes(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddService}
                        disabled={busy}
                        className={BTN_PRIMARY}
                      >
                        إضافة خدمة
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft">
                    الخدمات مقفلة بعد موافقة العميل أو إصدار الفاتورة.
                  </p>
                )}
              </section>

              {/* Discount (editable only before approval/invoice) */}
              {editable && (
                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-ink">الخصم</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={FIELD}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="قيمة الخصم (ر.س)"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                    />
                    <input
                      className={FIELD}
                      placeholder="سبب الخصم (إلزامي عند وجود خصم)"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDiscount}
                      disabled={busy}
                      className={BTN_NEUTRAL}
                    >
                      حفظ الخصم
                    </button>
                  </div>
                </section>
              )}

              {/* Totals */}
              <section className="rounded-md border border-ink/10 bg-ink/[0.02] p-3">
                <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                  <Detail label="المجموع الفرعي">
                    {formatCurrency(summary.subtotal)}
                  </Detail>
                  {summary.discountAmount > 0 ? (
                    <Detail label="الخصم">
                      −{formatCurrency(summary.discountAmount)}
                      {wo.discountReason ? ` (${wo.discountReason})` : ""}
                    </Detail>
                  ) : null}
                  <Detail label="الإجمالي">
                    <span className="font-extrabold">
                      {formatCurrency(summary.total)}
                    </span>
                  </Detail>
                  <Detail label="المدفوع">{formatCurrency(summary.paid)}</Detail>
                  <Detail label="المتبقي">
                    <span className="font-extrabold">
                      {formatCurrency(summary.remaining)}
                    </span>
                  </Detail>
                </dl>
              </section>

              {/* Quote status actions */}
              <section className="space-y-2">
                <h4 className="text-sm font-extrabold text-ink">حالة عرض السعر</h4>
                <div className="flex flex-wrap gap-2">
                  {nextQuoteStatuses(wo.quoteStatus).length === 0 ? (
                    <p className="text-xs text-ink-soft">
                      تمت الموافقة على عرض السعر.
                    </p>
                  ) : (
                    nextQuoteStatuses(wo.quoteStatus).map((target) => {
                      const needsContent =
                        target === "sent" || target === "approved";
                      const disabled = busy || (needsContent && !hasContent);
                      return (
                        <button
                          key={target}
                          type="button"
                          onClick={() =>
                            void run(() =>
                              workOrderRepository.setQuoteStatus(wo.id, target)
                            )
                          }
                          disabled={disabled}
                          className={
                            target === "approved" ? BTN_PRIMARY : BTN_NEUTRAL
                          }
                        >
                          {QUOTE_ACTION_LABELS[target]}
                        </button>
                      );
                    })
                  )}
                </div>
                {!hasContent && wo.quoteStatus !== "approved" ? (
                  <p className="text-xs text-ink-soft">
                    أضف خدمة واحدة على الأقل بسعر لإرسال العرض.
                  </p>
                ) : null}
              </section>

              {/* Invoice */}
              <section className="space-y-2">
                <h4 className="text-sm font-extrabold text-ink">الفاتورة</h4>
                {wo.invoiceNumber ? (
                  <div className="rounded-md border border-ink/15 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-block rounded-md bg-ink px-2 py-0.5 text-sm font-extrabold text-white">
                        {wo.invoiceNumber}
                      </span>
                      {wo.invoicedAt ? (
                        <span className="text-xs text-ink-soft">
                          {formatDateTime(wo.invoicedAt)}
                        </span>
                      ) : null}
                    </div>
                    <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                      <Detail label="أمر العمل">{wo.workOrderNumber}</Detail>
                      <Detail label="العميل">{wo.customerFullName}</Detail>
                      <Detail label="السيارة">
                        {wo.carMake} {wo.carModel} {wo.carYear}
                      </Detail>
                      <Detail label="الإجمالي">
                        {formatCurrency(summary.total)}
                      </Detail>
                      <Detail label="المدفوع">
                        {formatCurrency(summary.paid)}
                      </Detail>
                      <Detail label="المتبقي">
                        {formatCurrency(summary.remaining)}
                      </Detail>
                    </dl>
                  </div>
                ) : canGenerateInvoice(wo, summary.total) ? (
                  <button
                    type="button"
                    onClick={() =>
                      void run(() => workOrderRepository.generateInvoice(wo.id))
                    }
                    disabled={busy}
                    className={BTN_PRIMARY}
                  >
                    إصدار فاتورة
                  </button>
                ) : (
                  <p className="text-xs text-ink-soft">
                    {wo.quoteStatus !== "approved"
                      ? "لا يمكن إصدار الفاتورة قبل موافقة العميل على عرض السعر."
                      : "أضف خدمات بقيمة أكبر من صفر لإصدار الفاتورة."}
                  </p>
                )}
              </section>

              {/* Payments */}
              <section className="space-y-2">
                <h4 className="text-sm font-extrabold text-ink">الدفعات</h4>

                {payments.length > 0 && (
                  <ul className="divide-y divide-ink/10 rounded-md border border-ink/10">
                    {payments.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="font-bold text-ink">
                          {formatCurrency(p.amount)}
                        </span>
                        <span className="text-xs text-ink-soft">
                          {paymentMethodLabels[p.method]}
                          {p.note ? ` • ${p.note}` : ""} •{" "}
                          {formatDateTime(p.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {!canRecordPayment(wo) ? (
                  <p className="text-xs text-ink-soft">
                    سجِّل الدفعات بعد إصدار الفاتورة.
                  </p>
                ) : summary.remaining <= 0 ? (
                  <p className="text-xs font-bold text-green-700">
                    تم سداد كامل المبلغ.
                  </p>
                ) : (
                  <div className="rounded-md border border-ink/10 bg-ink/[0.02] p-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        className={FIELD}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="المبلغ (ر.س)"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                      <select
                        className={FIELD}
                        value={payMethod}
                        onChange={(e) =>
                          setPayMethod(e.target.value as PaymentMethod)
                        }
                      >
                        {(
                          Object.keys(paymentMethodLabels) as PaymentMethod[]
                        ).map((m) => (
                          <option key={m} value={m}>
                            {paymentMethodLabels[m]}
                          </option>
                        ))}
                      </select>
                      <input
                        className={FIELD}
                        placeholder="ملاحظة (اختياري)"
                        value={payNote}
                        onChange={(e) => setPayNote(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddPayment}
                        disabled={busy}
                        className={BTN_PRIMARY}
                      >
                        تسجيل دفعة
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
