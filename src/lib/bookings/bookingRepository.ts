import type { BookingRepository } from "./types";
import { localBookingRepository } from "./localBookingRepository";
import { supabaseBookingRepository } from "./supabaseBookingRepository";

/**
 * Repository selector for bookings.
 *
 * Chooses the implementation from NEXT_PUBLIC_DATA_MODE:
 *   - "supabase" → Supabase-backed repository
 *   - "local" or missing → localStorage repository (default)
 *
 * The UI imports `bookingRepository` and never talks to a storage layer
 * directly, so switching modes requires no UI changes.
 *
 * Manual switch only — there is NO automatic fallback. If Supabase mode is
 * selected and a Supabase call fails, the error surfaces to the user; data is
 * NOT silently written to localStorage. This keeps the active data source
 * unambiguous and avoids mixing booking data between the two stores.
 */
const mode = process.env.NEXT_PUBLIC_DATA_MODE;

export const bookingRepository: BookingRepository =
  mode === "supabase" ? supabaseBookingRepository : localBookingRepository;
