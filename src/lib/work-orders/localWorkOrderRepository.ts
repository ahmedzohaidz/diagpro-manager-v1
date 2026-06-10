import type { Booking } from "@/lib/bookings/types";
import type { WorkOrder, WorkOrderRepository } from "./types";

/**
 * localStorage-backed work order repository (Phase 5 — offline/local mode).
 *
 * Work orders are stored as a JSON array under `diagpro_work_orders`, and a
 * simple incrementing counter is kept under `diagpro_work_orders_counter` to
 * generate readable numbers like WO-2026-0001. Browser-only; degrades safely
 * on the server.
 */

const STORAGE_KEY = "diagpro_work_orders";
const COUNTER_KEY = "diagpro_work_orders_counter";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): WorkOrder[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkOrder[]) : [];
  } catch {
    return [];
  }
}

function writeAll(workOrders: WorkOrder[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workOrders));
}

function generateId(): string {
  if (isBrowser() && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `wo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

export const localWorkOrderRepository: WorkOrderRepository = {
  async list(): Promise<WorkOrder[]> {
    return readAll();
  },

  async existsForBooking(bookingId: string): Promise<boolean> {
    return readAll().some((wo) => wo.bookingId === bookingId);
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
      id: generateId(),
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
      createdAt: now,
      updatedAt: now,
    };

    all.unshift(workOrder);
    writeAll(all);

    return workOrder;
  },
};
