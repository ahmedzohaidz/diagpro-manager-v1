import type { BookingStatus } from "@/lib/statuses";

/**
 * Booking domain types and the repository abstraction.
 *
 * Phase 3 stores bookings locally (localStorage). Later phases can provide a
 * `supabaseBookingRepository` that implements the same `BookingRepository`
 * interface, so the UI does not need to change when persistence moves to
 * Supabase.
 */

export type BookingPriority = "low" | "normal" | "high" | "urgent";

/** Raw data collected from the /book form. */
export interface BookingInput {
  customerFullName: string;
  phone: string;
  carMake: string;
  carModel: string;
  carYear: string;
  plateNumber?: string;
  problemDescription: string;
  isDrivable: boolean;
  hasCheckEngineLight: boolean;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

/** A persisted booking record. */
export interface Booking extends BookingInput {
  id: string;
  status: BookingStatus;
  priority: BookingPriority;
  createdAt: string;
  updatedAt: string;
}

/**
 * Storage-agnostic contract. Swap localStorage for Supabase later by providing
 * another implementation of this interface.
 */
export interface BookingRepository {
  create(input: BookingInput): Promise<Booking>;
  list(): Promise<Booking[]>;
  updateStatus(id: string, status: BookingStatus): Promise<Booking>;
}

/**
 * Business rule (CLAUDE.md): a booking is higher priority when the car cannot
 * be driven or has a check engine light on.
 */
export function derivePriority(input: BookingInput): BookingPriority {
  if (!input.isDrivable || input.hasCheckEngineLight) {
    return "high";
  }
  return "normal";
}
