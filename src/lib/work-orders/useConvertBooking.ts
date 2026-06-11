"use client";

import { useState } from "react";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { statusLogRepository } from "@/lib/bookings/statusLogRepository";
import { workOrderRepository } from "./workOrderRepository";
import type { Booking } from "@/lib/bookings/types";
import type { WorkOrder } from "./types";
import type { BookingStatus } from "@/lib/statuses";

/**
 * Shared booking → work order conversion logic (Phase 18).
 *
 * Single source of truth used by every admin entry point (bookings list,
 * follow-up, supervisor) so they all get the same safeguards:
 *   - convertible-status gate
 *   - confirmation modal (the hook only exposes the target; the page renders
 *     <ConvertBookingModal>)
 *   - duplicate prevention via existsForBooking
 *   - status log entry on success
 * Conversion NEVER runs directly — requestConvert opens the modal, and only
 * confirmConvert performs the write.
 */

// A booking can be converted to a work order only from these statuses.
export const CONVERTIBLE_STATUSES: BookingStatus[] = ["confirmed", "arrived"];

export type ConvertNotice = {
  type: "success" | "error";
  text: string;
  workOrderNumber?: string;
};

interface UseConvertBookingOptions {
  /**
   * Called after a successful conversion — use it to reload lists / drawer.
   * Receives the created work order and the source booking.
   */
  onConverted?: (workOrder: WorkOrder, booking: Booking) => void | Promise<void>;
}

export function useConvertBooking(options: UseConvertBookingOptions = {}) {
  // Booking pending conversion — non-null while the confirm modal is open.
  const [convertTarget, setConvertTarget] = useState<Booking | null>(null);
  const [converting, setConverting] = useState(false);
  const [notice, setNotice] = useState<ConvertNotice | null>(null);

  // Open the confirmation modal — never converts directly.
  function requestConvert(booking: Booking) {
    setNotice(null);
    if (!CONVERTIBLE_STATUSES.includes(booking.status)) {
      setNotice({ type: "error", text: "لا يمكن تحويل هذا الحجز إلى أمر عمل." });
      return;
    }
    setConvertTarget(booking);
  }

  function cancelConvert() {
    setConvertTarget(null);
  }

  async function confirmConvert() {
    const booking = convertTarget;
    if (!booking) return;
    setNotice(null);
    setConverting(true);
    try {
      if (await workOrderRepository.existsForBooking(booking.id)) {
        setConvertTarget(null);
        setNotice({ type: "error", text: "تم تحويل هذا الحجز مسبقًا." });
        return;
      }
      const workOrder = await workOrderRepository.createFromBooking(booking);
      await bookingRepository.updateStatus(booking.id, "converted_to_work_order");
      await statusLogRepository.add(
        booking.id,
        booking.status,
        "converted_to_work_order"
      );
      setConvertTarget(null);
      await options.onConverted?.(workOrder, booking);
      setNotice({
        type: "success",
        text: "تم تحويل الحجز إلى أمر عمل بنجاح.",
        workOrderNumber: workOrder.workOrderNumber,
      });
    } catch (err) {
      setConvertTarget(null);
      setNotice({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "لا يمكن تحويل هذا الحجز إلى أمر عمل.",
      });
    } finally {
      setConverting(false);
    }
  }

  return {
    convertTarget,
    converting,
    notice,
    setNotice,
    requestConvert,
    cancelConvert,
    confirmConvert,
  };
}
