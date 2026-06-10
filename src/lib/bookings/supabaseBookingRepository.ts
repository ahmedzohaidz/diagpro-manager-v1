import { getSupabaseClient } from "@/lib/supabaseClient";
import type { BookingStatus } from "@/lib/statuses";
import type { Booking, BookingInput, BookingRepository, BookingPriority } from "./types";
import { derivePriority } from "./types";

/**
 * Supabase-backed booking repository (Phase 10).
 *
 * The UI works with a flat `Booking` object, but the database is normalized
 * into `customers`, `vehicles`, and `bookings`. This repository splits the data
 * on write and joins it back on read, so the existing pages keep working
 * unchanged. Selected via NEXT_PUBLIC_DATA_MODE=supabase.
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
interface BookingRow {
  id: string;
  problem_description: string | null;
  is_drivable: boolean | null;
  has_check_engine_light: boolean | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: BookingStatus;
  priority: BookingPriority;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers: Embedded<CustomerRel>;
  vehicles: Embedded<VehicleRel>;
}

const BOOKING_SELECT = `
  id, problem_description, is_drivable, has_check_engine_light,
  preferred_date, preferred_time, status, priority, notes,
  created_at, updated_at,
  customers ( full_name, phone ),
  vehicles ( make, model, year, plate_number )
`;

function mapRow(row: BookingRow): Booking {
  const customer = one(row.customers);
  const vehicle = one(row.vehicles);
  return {
    id: row.id,
    customerFullName: customer?.full_name ?? "",
    phone: customer?.phone ?? "",
    carMake: vehicle?.make ?? "",
    carModel: vehicle?.model ?? "",
    carYear: vehicle?.year != null ? String(vehicle.year) : "",
    plateNumber: vehicle?.plate_number ?? undefined,
    problemDescription: row.problem_description ?? "",
    isDrivable: row.is_drivable ?? false,
    hasCheckEngineLight: row.has_check_engine_light ?? false,
    preferredDate: row.preferred_date ?? "",
    // Postgres `time` comes back as "HH:MM:SS"; the UI expects "HH:MM".
    preferredTime: (row.preferred_time ?? "").slice(0, 5),
    notes: row.notes ?? undefined,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseBookingRepository: BookingRepository = {
  async create(input: BookingInput): Promise<Booking> {
    const supabase = getSupabaseClient();
    try {
      // 1) customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          full_name: input.customerFullName,
          phone: input.phone,
          source: "online",
        })
        .select("id")
        .single();
      if (customerError || !customer) throw customerError ?? new Error("customer");

      // 2) vehicle
      const yearNum = parseInt(input.carYear, 10);
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          customer_id: customer.id,
          make: input.carMake,
          model: input.carModel,
          year: Number.isFinite(yearNum) ? yearNum : null,
          plate_number: input.plateNumber ?? null,
        })
        .select("id")
        .single();
      if (vehicleError || !vehicle) throw vehicleError ?? new Error("vehicle");

      // 3) booking
      const priority = derivePriority(input);
      const { data: row, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: customer.id,
          vehicle_id: vehicle.id,
          problem_description: input.problemDescription,
          is_drivable: input.isDrivable,
          has_check_engine_light: input.hasCheckEngineLight,
          preferred_date: input.preferredDate || null,
          preferred_time: input.preferredTime || null,
          status: "new_request",
          priority,
          notes: input.notes ?? null,
        })
        .select(BOOKING_SELECT)
        .single();
      if (bookingError || !row) throw bookingError ?? new Error("booking");

      return mapRow(row as unknown as BookingRow);
    } catch {
      throw new Error("تعذّر حفظ الحجز، حاول مرة أخرى.");
    }
  },

  async list(): Promise<Booking[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) throw new Error("تعذّر تحميل الحجوزات.");
    return (data as unknown as BookingRow[]).map(mapRow);
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select(BOOKING_SELECT)
      .single();
    if (error || !data) throw new Error("تعذّر تحديث حالة الحجز.");
    return mapRow(data as unknown as BookingRow);
  },
};
