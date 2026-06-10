import { getSupabaseClient } from "@/lib/supabaseClient";
import type { BookingStatus } from "@/lib/statuses";
import type { BookingStatusLog } from "./types";

/**
 * Read/write access to `booking_status_logs` (Phase 16).
 *
 * Best-effort only: the booking status itself is the source of truth, so any
 * failure here (missing Supabase config, RLS, etc.) is swallowed and must
 * never block a status update or break the bookings list.
 */

interface StatusLogRow {
  id: string;
  booking_id: string;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
}

function mapRow(row: StatusLogRow): BookingStatusLog {
  return {
    id: row.id,
    bookingId: row.booking_id,
    oldStatus: (row.old_status as BookingStatus | null) ?? null,
    newStatus: row.new_status as BookingStatus,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

export const statusLogRepository = {
  /** Returns the status history for a booking, newest first. Returns [] on any error. */
  async list(bookingId: string): Promise<BookingStatusLog[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("booking_status_logs")
        .select("id, booking_id, old_status, new_status, note, created_at")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });
      if (error || !data) return [];
      return (data as StatusLogRow[]).map(mapRow);
    } catch {
      return [];
    }
  },

  /**
   * Records a status change. Tries to resolve the current admin's
   * `public.users.id` via `auth_user_id = auth.uid()`; falls back to
   * `changed_by = null` if that lookup fails or finds no match. Never throws.
   */
  async add(
    bookingId: string,
    oldStatus: BookingStatus | null,
    newStatus: BookingStatus,
    note?: string
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      let changedBy: string | null = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUserId = authData?.user?.id;
        if (authUserId) {
          const { data: staff } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", authUserId)
            .maybeSingle();
          changedBy = (staff as { id: string } | null)?.id ?? null;
        }
      } catch {
        changedBy = null;
      }

      await supabase.from("booking_status_logs").insert({
        booking_id: bookingId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        note: note ?? null,
      });
    } catch {
      // Non-critical: status update already succeeded.
    }
  },
};
