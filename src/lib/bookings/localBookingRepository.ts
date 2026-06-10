import type { BookingStatus } from "@/lib/statuses";
import type { Booking, BookingInput, BookingRepository } from "./types";
import { derivePriority } from "./types";

/**
 * localStorage-backed booking repository (Phase 3 — offline/local mode).
 *
 * Bookings are stored as a JSON array under the `diagpro_bookings` key.
 * This implementation is browser-only; on the server it degrades gracefully
 * (returns empty / no-ops) so it is safe to import anywhere.
 */

const STORAGE_KEY = "diagpro_bookings";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): Booking[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
}

function writeAll(bookings: Booking[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function generateId(): string {
  if (isBrowser() && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const localBookingRepository: BookingRepository = {
  async create(input: BookingInput): Promise<Booking> {
    if (!isBrowser()) {
      throw new Error("التخزين المحلي غير متاح في هذه البيئة.");
    }

    const now = new Date().toISOString();
    const booking: Booking = {
      ...input,
      id: generateId(),
      status: "new_request",
      priority: derivePriority(input),
      createdAt: now,
      updatedAt: now,
    };

    const all = readAll();
    all.unshift(booking);
    writeAll(all);

    return booking;
  },

  async list(): Promise<Booking[]> {
    return readAll();
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    if (!isBrowser()) {
      throw new Error("التخزين المحلي غير متاح في هذه البيئة.");
    }

    const all = readAll();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error("الحجز غير موجود.");
    }

    const updated: Booking = {
      ...all[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    writeAll(all);

    return updated;
  },
};
