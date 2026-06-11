import type { PaymentStatus, QuoteStatus } from "@/lib/statuses";
import type { WorkOrder, WorkOrderPayment, WorkOrderService } from "./types";

/**
 * Pure financial computations and business-rule guards for Phase 19A.
 *
 * This is the single source of truth for the money math and the quote/invoice
 * rules, shared by the UI and (where useful) the repositories — so the local
 * and Supabase modes behave identically. Totals are derived here and are never
 * stored in the database.
 */

/** Round to 2 decimals, avoiding binary float drift (e.g. 0.1 + 0.2). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Line total for one service row. */
export function lineTotal(
  service: Pick<WorkOrderService, "unitPrice" | "quantity">
): number {
  return round2(service.unitPrice * service.quantity);
}

export interface FinancialsSummary {
  /** Sum of all line totals before discount. */
  subtotal: number;
  /** Effective discount applied (never exceeds subtotal). */
  discountAmount: number;
  /** subtotal - discount. Always >= 0. */
  total: number;
  /** Sum of all recorded payments. */
  paid: number;
  /** total - paid. Always >= 0. */
  remaining: number;
  /** Derived: unpaid / partial / paid. */
  paymentStatus: PaymentStatus;
}

/**
 * Compute the full money summary from raw services, payments, and the stored
 * discount amount. Discount is clamped to the subtotal so total can never go
 * negative.
 */
export function summarize(
  services: WorkOrderService[],
  payments: WorkOrderPayment[],
  discountAmount: number
): FinancialsSummary {
  const subtotal = round2(
    services.reduce((acc, s) => acc + lineTotal(s), 0)
  );
  const discount = round2(Math.min(Math.max(discountAmount, 0), subtotal));
  const total = round2(subtotal - discount);
  const paid = round2(payments.reduce((acc, p) => acc + p.amount, 0));
  const remaining = round2(Math.max(total - paid, 0));

  let paymentStatus: PaymentStatus = "unpaid";
  if (paid > 0 && total > 0) {
    paymentStatus = paid >= total ? "paid" : "partial";
  } else if (paid > 0 && total === 0) {
    paymentStatus = "paid";
  }

  return { subtotal, discountAmount: discount, total, paid, remaining, paymentStatus };
}

/**
 * Allowed next quote statuses from the current one. Once a quote is approved it
 * is locked (the invoice flow takes over); a rejected quote can be reopened to
 * draft for a re-quote.
 */
export function nextQuoteStatuses(current: QuoteStatus): QuoteStatus[] {
  switch (current) {
    case "draft":
      return ["sent"];
    case "sent":
      return ["approved", "rejected", "draft"];
    case "approved":
      return [];
    case "rejected":
      return ["draft"];
    default:
      return [];
  }
}

/** Line items can only be edited while the quote is not yet approved/invoiced. */
export function canEditServices(workOrder: WorkOrder): boolean {
  return (
    !workOrder.invoiceNumber &&
    (workOrder.quoteStatus === "draft" || workOrder.quoteStatus === "sent")
  );
}

/** A quote can be sent / approved only if it has at least one priced line. */
export function quoteHasContent(
  services: WorkOrderService[],
  total: number
): boolean {
  return services.length > 0 && total > 0;
}

/** No repair execution / invoice before the customer approves the quote. */
export function canGenerateInvoice(
  workOrder: WorkOrder,
  total: number
): boolean {
  return (
    workOrder.quoteStatus === "approved" &&
    !workOrder.invoiceNumber &&
    total > 0
  );
}

/** Payments are only recorded once an invoice exists (financial closure order). */
export function canRecordPayment(workOrder: WorkOrder): boolean {
  return Boolean(workOrder.invoiceNumber);
}

/**
 * Financial-closure guard for delivery: a work order may be delivered only once
 * it has an invoice OR an explicit recorded reason for delivering without one.
 * Phase 19A has no delivery control yet; this guard is built for that future
 * point.
 */
export function canDeliver(workOrder: WorkOrder): boolean {
  return (
    Boolean(workOrder.invoiceNumber) ||
    Boolean(workOrder.noInvoiceReason && workOrder.noInvoiceReason.trim())
  );
}
