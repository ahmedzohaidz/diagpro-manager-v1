import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Booking } from "@/lib/bookings/types";
import type { WorkOrderStatus } from "@/lib/statuses";
import type { WorkOrder, WorkOrderRepository } from "./types";

/**
 * Supabase-backed work order repository (Phase 10).
 *
 * Reads join `customers` and `vehicles` for display; creation reuses the
 * booking's customer/vehicle ids. Duplicate conversion is prevented by checking
 * for an existing work order with the same booking_id. Selected via
 * NEXT_PUBLIC_DATA_MODE=supabase.
 */

type Embedded<T> = T | T[] | null;

function one<T>(embedded: Embedded<T>): T | null {
  if (!embedded) return null;
  return Array.isArray(embedded) ? embedded[0] ?? null : embedded;
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
  created_at: string;
  updated_at: string;
  customers: Embedded<CustomerRel>;
  vehicles: Embedded<VehicleRel>;
}

const WORK_ORDER_SELECT = `
  id, booking_id, complaint, work_order_number, status, created_at, updated_at,
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
};
