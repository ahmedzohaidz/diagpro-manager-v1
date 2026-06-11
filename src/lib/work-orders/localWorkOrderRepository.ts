import type { Booking } from "@/lib/bookings/types";
import type { QuoteStatus } from "@/lib/statuses";
import type {
  WorkOrder,
  WorkOrderRepository,
  WorkOrderService,
  WorkOrderServiceInput,
  WorkOrderPayment,
  WorkOrderPaymentInput,
} from "./types";

/**
 * localStorage-backed work order repository (Phase 5 — offline/local mode;
 * financials in Phase 19A).
 *
 * Work orders are stored as a JSON array under `diagpro_work_orders`, with a
 * simple incrementing counter under `diagpro_work_orders_counter` for readable
 * numbers like WO-2026-0001. Phase 19A adds two more arrays — services and
 * payments — plus an invoice counter, mirroring the Supabase tables so both
 * modes behave identically. Browser-only; degrades safely on the server.
 */

const STORAGE_KEY = "diagpro_work_orders";
const COUNTER_KEY = "diagpro_work_orders_counter";
const SERVICES_KEY = "diagpro_work_order_services";
const PAYMENTS_KEY = "diagpro_work_order_payments";
const INVOICE_COUNTER_KEY = "diagpro_invoices_counter";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Backfills financial defaults onto work orders saved before Phase 19A. */
function normalize(wo: WorkOrder): WorkOrder {
  return {
    ...wo,
    quoteStatus: wo.quoteStatus ?? "draft",
    discountAmount: typeof wo.discountAmount === "number" ? wo.discountAmount : 0,
  };
}

function readAll(): WorkOrder[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkOrder[]).map(normalize) : [];
  } catch {
    return [];
  }
}

function writeAll(workOrders: WorkOrder[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workOrders));
}

function readServices(): WorkOrderService[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(SERVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkOrderService[]) : [];
  } catch {
    return [];
  }
}

function writeServices(services: WorkOrderService[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

function readPayments(): WorkOrderPayment[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PAYMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkOrderPayment[]) : [];
  } catch {
    return [];
  }
}

function writePayments(payments: WorkOrderPayment[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

function generateId(prefix: string): string {
  if (isBrowser() && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Returns the next sequential work order number, e.g. "WO-2026-0001". */
function nextWorkOrderNumber(year: number): string {
  let counter = 0;
  if (isBrowser()) {
    const raw = window.localStorage.getItem(COUNTER_KEY);
    counter = raw ? parseInt(raw, 10) || 0 : 0;
    counter += 1;
    window.localStorage.setItem(COUNTER_KEY, String(counter));
  } else {
    counter = 1;
  }
  const padded = String(counter).padStart(4, "0");
  return `WO-${year}-${padded}`;
}

/** Returns the next sequential invoice number, e.g. "INV-2026-0001". */
function nextInvoiceNumber(year: number): string {
  let counter = 0;
  if (isBrowser()) {
    const raw = window.localStorage.getItem(INVOICE_COUNTER_KEY);
    counter = raw ? parseInt(raw, 10) || 0 : 0;
    counter += 1;
    window.localStorage.setItem(INVOICE_COUNTER_KEY, String(counter));
  } else {
    counter = 1;
  }
  const padded = String(counter).padStart(4, "0");
  return `INV-${year}-${padded}`;
}

/** Patches a stored work order in place and returns the updated, normalized row. */
function updateWorkOrder(
  workOrderId: string,
  patch: Partial<WorkOrder>
): WorkOrder {
  if (!isBrowser()) {
    throw new Error("التخزين المحلي غير متاح في هذه البيئة.");
  }
  const all = readAll();
  const idx = all.findIndex((wo) => wo.id === workOrderId);
  if (idx === -1) throw new Error("أمر العمل غير موجود.");
  const updated = normalize({
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export const localWorkOrderRepository: WorkOrderRepository = {
  async list(): Promise<WorkOrder[]> {
    return readAll();
  },

  async existsForBooking(bookingId: string): Promise<boolean> {
    return readAll().some((wo) => wo.bookingId === bookingId);
  },

  async findByBooking(bookingId: string): Promise<WorkOrder | null> {
    return readAll().find((wo) => wo.bookingId === bookingId) ?? null;
  },

  async getById(workOrderId: string): Promise<WorkOrder | null> {
    return readAll().find((wo) => wo.id === workOrderId) ?? null;
  },

  async createFromBooking(booking: Booking): Promise<WorkOrder> {
    if (!isBrowser()) {
      throw new Error("التخزين المحلي غير متاح في هذه البيئة.");
    }

    const all = readAll();
    if (all.some((wo) => wo.bookingId === booking.id)) {
      throw new Error("تم تحويل هذا الحجز مسبقًا.");
    }

    const now = new Date().toISOString();
    const workOrder: WorkOrder = {
      id: generateId("wo"),
      bookingId: booking.id,
      customerFullName: booking.customerFullName,
      phone: booking.phone,
      carMake: booking.carMake,
      carModel: booking.carModel,
      carYear: booking.carYear,
      plateNumber: booking.plateNumber,
      complaint: booking.problemDescription,
      workOrderNumber: nextWorkOrderNumber(new Date().getFullYear()),
      status: "received",
      quoteStatus: "draft",
      discountAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    all.unshift(workOrder);
    writeAll(all);

    return workOrder;
  },

  // ---- Phase 19A: financial closure ----------------------------------------

  async listServices(workOrderId: string): Promise<WorkOrderService[]> {
    return readServices()
      .filter((s) => s.workOrderId === workOrderId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async addService(
    workOrderId: string,
    input: WorkOrderServiceInput
  ): Promise<WorkOrderService> {
    if (!isBrowser()) {
      throw new Error("التخزين المحلي غير متاح في هذه البيئة.");
    }
    const now = new Date().toISOString();
    const service: WorkOrderService = {
      id: generateId("svc"),
      workOrderId,
      name: input.name,
      notes: input.notes,
      unitPrice: input.unitPrice,
      quantity: input.quantity,
      estimatedMinutes: input.estimatedMinutes,
      createdAt: now,
      updatedAt: now,
    };
    const all = readServices();
    all.push(service);
    writeServices(all);
    return service;
  },

  async removeService(serviceId: string): Promise<void> {
    if (!isBrowser()) return;
    writeServices(readServices().filter((s) => s.id !== serviceId));
  },

  async setQuoteStatus(
    workOrderId: string,
    status: QuoteStatus
  ): Promise<WorkOrder> {
    return updateWorkOrder(workOrderId, { quoteStatus: status });
  },

  async setDiscount(
    workOrderId: string,
    amount: number,
    reason: string | null
  ): Promise<WorkOrder> {
    const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
    const trimmed = reason?.trim() ?? "";
    if (safeAmount > 0 && trimmed === "") {
      throw new Error("يجب إدخال سبب الخصم.");
    }
    return updateWorkOrder(workOrderId, {
      discountAmount: safeAmount,
      discountReason: safeAmount > 0 ? trimmed : undefined,
    });
  },

  async generateInvoice(workOrderId: string): Promise<WorkOrder> {
    const current = await this.getById(workOrderId);
    if (!current) throw new Error("أمر العمل غير موجود.");
    if (current.quoteStatus !== "approved") {
      throw new Error("لا يمكن إصدار الفاتورة قبل موافقة العميل على عرض السعر.");
    }
    if (current.invoiceNumber) return current; // idempotent — already invoiced

    return updateWorkOrder(workOrderId, {
      invoiceNumber: nextInvoiceNumber(new Date().getFullYear()),
      invoicedAt: new Date().toISOString(),
    });
  },

  async listPayments(workOrderId: string): Promise<WorkOrderPayment[]> {
    return readPayments()
      .filter((p) => p.workOrderId === workOrderId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async addPayment(
    workOrderId: string,
    input: WorkOrderPaymentInput
  ): Promise<WorkOrderPayment> {
    if (!isBrowser()) {
      throw new Error("التخزين المحلي غير متاح في هذه البيئة.");
    }
    const payment: WorkOrderPayment = {
      id: generateId("pay"),
      workOrderId,
      amount: input.amount,
      method: input.method,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    const all = readPayments();
    all.push(payment);
    writePayments(all);
    return payment;
  },
};
