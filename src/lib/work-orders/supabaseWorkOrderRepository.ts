import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Booking } from "@/lib/bookings/types";
import type { QuoteStatus, WorkOrderStatus } from "@/lib/statuses";
import type {
  WorkOrder,
  WorkOrderRepository,
  WorkOrderService,
  WorkOrderServiceInput,
  WorkOrderPayment,
  WorkOrderPaymentInput,
} from "./types";

/**
 * Supabase-backed work order repository (Phase 10; financials in Phase 19A).
 *
 * Reads join `customers` and `vehicles` for display; creation reuses the
 * booking's customer/vehicle ids. Duplicate conversion is prevented by checking
 * for an existing work order with the same booking_id. Selected via
 * NEXT_PUBLIC_DATA_MODE=supabase.
 *
 * Phase 19A adds quote line items (`work_order_services`), invoice fields on
 * `work_orders`, and a payment ledger (`work_order_payments`). Business rules
 * (transitions, invoice gating, totals) live in lib/work-orders/financials.ts
 * so local and Supabase modes behave identically.
 */

type Embedded<T> = T | T[] | null;

function one<T>(embedded: Embedded<T>): T | null {
  if (!embedded) return null;
  return Array.isArray(embedded) ? embedded[0] ?? null : embedded;
}

function num(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : fallback;
}

interface CustomerRel {
  full_name: string | null;
  phone: string | null;
}
interface VehicleRel {
  make: string | null;
  model: string | null;
  year: number | null;
  plate_number: string | null;
}
interface WorkOrderRow {
  id: string;
  booking_id: string | null;
  complaint: string | null;
  work_order_number: string;
  status: WorkOrderStatus;
  quote_status: QuoteStatus | null;
  discount_amount: number | string | null;
  discount_reason: string | null;
  invoice_number: string | null;
  invoiced_at: string | null;
  no_invoice_reason: string | null;
  created_at: string;
  updated_at: string;
  customers: Embedded<CustomerRel>;
  vehicles: Embedded<VehicleRel>;
}

const WORK_ORDER_SELECT = `
  id, booking_id, complaint, work_order_number, status,
  quote_status, discount_amount, discount_reason,
  invoice_number, invoiced_at, no_invoice_reason,
  created_at, updated_at,
  customers ( full_name, phone ),
  vehicles ( make, model, year, plate_number )
`;

function mapRow(row: WorkOrderRow): WorkOrder {
  const customer = one(row.customers);
  const vehicle = one(row.vehicles);
  return {
    id: row.id,
    bookingId: row.booking_id ?? "",
    customerFullName: customer?.full_name ?? "",
    phone: customer?.phone ?? "",
    carMake: vehicle?.make ?? "",
    carModel: vehicle?.model ?? "",
    carYear: vehicle?.year != null ? String(vehicle.year) : "",
    plateNumber: vehicle?.plate_number ?? undefined,
    complaint: row.complaint ?? "",
    workOrderNumber: row.work_order_number,
    status: row.status,
    quoteStatus: row.quote_status ?? "draft",
    discountAmount: num(row.discount_amount, 0),
    discountReason: row.discount_reason ?? undefined,
    invoiceNumber: row.invoice_number ?? undefined,
    invoicedAt: row.invoiced_at ?? undefined,
    noInvoiceReason: row.no_invoice_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface ServiceRow {
  id: string;
  work_order_id: string;
  name: string | null;
  notes: string | null;
  unit_price: number | string | null;
  quantity: number | string | null;
  estimated_minutes: number | string | null;
  created_at: string;
  updated_at: string;
}

const SERVICE_SELECT =
  "id, work_order_id, name, notes, unit_price, quantity, estimated_minutes, created_at, updated_at";

function mapServiceRow(row: ServiceRow): WorkOrderService {
  return {
    id: row.id,
    workOrderId: row.work_order_id,
    name: row.name ?? "",
    notes: row.notes ?? undefined,
    unitPrice: num(row.unit_price, 0),
    quantity: num(row.quantity, 1),
    estimatedMinutes:
      row.estimated_minutes != null ? num(row.estimated_minutes) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface PaymentRow {
  id: string;
  work_order_id: string;
  amount: number | string | null;
  method: WorkOrderPayment["method"];
  note: string | null;
  created_at: string;
}

const PAYMENT_SELECT = "id, work_order_id, amount, method, note, created_at";

function mapPaymentRow(row: PaymentRow): WorkOrderPayment {
  return {
    id: row.id,
    workOrderId: row.work_order_id,
    amount: num(row.amount, 0),
    method: row.method,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

async function bookingHasWorkOrder(bookingId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { count, error } = await supabase
    .from("work_orders")
    .select("id", { count: "exact", head: true })
    .eq("booking_id", bookingId);
  if (error) throw new Error("تعذّر التحقق من أمر العمل.");
  return (count ?? 0) > 0;
}

async function nextWorkOrderNumber(year: number): Promise<string> {
  const supabase = getSupabaseClient();
  const prefix = `WO-${year}-`;
  const { count } = await supabase
    .from("work_orders")
    .select("id", { count: "exact", head: true })
    .like("work_order_number", `${prefix}%`);
  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

async function nextInvoiceNumber(year: number): Promise<string> {
  const supabase = getSupabaseClient();
  const prefix = `INV-${year}-`;
  const { count } = await supabase
    .from("work_orders")
    .select("id", { count: "exact", head: true })
    .like("invoice_number", `${prefix}%`);
  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export const supabaseWorkOrderRepository: WorkOrderRepository = {
  async list(): Promise<WorkOrder[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_orders")
      .select(WORK_ORDER_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) throw new Error("تعذّر تحميل أوامر العمل.");
    return (data as unknown as WorkOrderRow[]).map(mapRow);
  },

  async existsForBooking(bookingId: string): Promise<boolean> {
    return bookingHasWorkOrder(bookingId);
  },

  async findByBooking(bookingId: string): Promise<WorkOrder | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_orders")
      .select(WORK_ORDER_SELECT)
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error("تعذّر تحميل أمر العمل.");
    if (!data) return null;
    return mapRow(data as unknown as WorkOrderRow);
  },

  async getById(workOrderId: string): Promise<WorkOrder | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_orders")
      .select(WORK_ORDER_SELECT)
      .eq("id", workOrderId)
      .maybeSingle();
    if (error) throw new Error("تعذّر تحميل أمر العمل.");
    if (!data) return null;
    return mapRow(data as unknown as WorkOrderRow);
  },

  async createFromBooking(booking: Booking): Promise<WorkOrder> {
    if (await bookingHasWorkOrder(booking.id)) {
      throw new Error("تم تحويل هذا الحجز مسبقًا.");
    }

    const supabase = getSupabaseClient();
    try {
      // Reuse the booking's customer/vehicle ids for the work order FKs.
      const { data: bookingRow, error: lookupError } = await supabase
        .from("bookings")
        .select("customer_id, vehicle_id")
        .eq("id", booking.id)
        .single();
      if (lookupError) throw lookupError;

      const workOrderNumber = await nextWorkOrderNumber(new Date().getFullYear());

      const { data: row, error } = await supabase
        .from("work_orders")
        .insert({
          booking_id: booking.id,
          customer_id: bookingRow?.customer_id ?? null,
          vehicle_id: bookingRow?.vehicle_id ?? null,
          work_order_number: workOrderNumber,
          complaint: booking.problemDescription,
          status: "received",
        })
        .select(WORK_ORDER_SELECT)
        .single();
      if (error || !row) throw error ?? new Error("work order insert failed");

      return mapRow(row as unknown as WorkOrderRow);
    } catch (err) {
      if (err instanceof Error && err.message === "تم تحويل هذا الحجز مسبقًا.") {
        throw err;
      }
      // UNIQUE(booking_id) violation → a work order already exists for this
      // booking (e.g. a concurrent conversion won the race). Surface the
      // accurate message instead of the generic failure.
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "23505"
      ) {
        throw new Error("تم تحويل هذا الحجز مسبقًا.");
      }
      throw new Error("تعذّر إنشاء أمر العمل.");
    }
  },

  // ---- Phase 19A: financial closure ----------------------------------------

  async listServices(workOrderId: string): Promise<WorkOrderService[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_order_services")
      .select(SERVICE_SELECT)
      .eq("work_order_id", workOrderId)
      .order("created_at", { ascending: true });
    if (error || !data) throw new Error("تعذّر تحميل الخدمات.");
    return (data as unknown as ServiceRow[]).map(mapServiceRow);
  },

  async addService(
    workOrderId: string,
    input: WorkOrderServiceInput
  ): Promise<WorkOrderService> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_order_services")
      .insert({
        work_order_id: workOrderId,
        name: input.name,
        notes: input.notes ?? null,
        unit_price: input.unitPrice,
        quantity: input.quantity,
        estimated_minutes: input.estimatedMinutes ?? null,
      })
      .select(SERVICE_SELECT)
      .single();
    if (error || !data) throw new Error("تعذّر إضافة الخدمة.");
    return mapServiceRow(data as unknown as ServiceRow);
  },

  async removeService(serviceId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("work_order_services")
      .delete()
      .eq("id", serviceId);
    if (error) throw new Error("تعذّر حذف الخدمة.");
  },

  async setQuoteStatus(
    workOrderId: string,
    status: QuoteStatus
  ): Promise<WorkOrder> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_orders")
      .update({ quote_status: status })
      .eq("id", workOrderId)
      .select(WORK_ORDER_SELECT)
      .single();
    if (error || !data) throw new Error("تعذّر تحديث حالة عرض السعر.");
    return mapRow(data as unknown as WorkOrderRow);
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
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_orders")
      .update({
        discount_amount: safeAmount,
        discount_reason: safeAmount > 0 ? trimmed : null,
      })
      .eq("id", workOrderId)
      .select(WORK_ORDER_SELECT)
      .single();
    if (error || !data) throw new Error("تعذّر تحديث الخصم.");
    return mapRow(data as unknown as WorkOrderRow);
  },

  async generateInvoice(workOrderId: string): Promise<WorkOrder> {
    const current = await this.getById(workOrderId);
    if (!current) throw new Error("أمر العمل غير موجود.");
    if (current.quoteStatus !== "approved") {
      throw new Error("لا يمكن إصدار الفاتورة قبل موافقة العميل على عرض السعر.");
    }
    if (current.invoiceNumber) return current; // idempotent — already invoiced

    const supabase = getSupabaseClient();
    const invoiceNumber = await nextInvoiceNumber(new Date().getFullYear());
    const { data, error } = await supabase
      .from("work_orders")
      .update({
        invoice_number: invoiceNumber,
        invoiced_at: new Date().toISOString(),
      })
      .eq("id", workOrderId)
      .select(WORK_ORDER_SELECT)
      .single();
    if (error || !data) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new Error("رقم الفاتورة مستخدم بالفعل، حاول مرة أخرى.");
      }
      throw new Error("تعذّر إصدار الفاتورة.");
    }
    return mapRow(data as unknown as WorkOrderRow);
  },

  async listPayments(workOrderId: string): Promise<WorkOrderPayment[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_order_payments")
      .select(PAYMENT_SELECT)
      .eq("work_order_id", workOrderId)
      .order("created_at", { ascending: true });
    if (error || !data) throw new Error("تعذّر تحميل الدفعات.");
    return (data as unknown as PaymentRow[]).map(mapPaymentRow);
  },

  async addPayment(
    workOrderId: string,
    input: WorkOrderPaymentInput
  ): Promise<WorkOrderPayment> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("work_order_payments")
      .insert({
        work_order_id: workOrderId,
        amount: input.amount,
        method: input.method,
        note: input.note ?? null,
      })
      .select(PAYMENT_SELECT)
      .single();
    if (error || !data) throw new Error("تعذّر تسجيل الدفعة.");
    return mapPaymentRow(data as unknown as PaymentRow);
  },
};
