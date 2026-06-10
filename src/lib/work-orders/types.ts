import type { WorkOrderStatus } from "@/lib/statuses";
import type { Booking } from "@/lib/bookings/types";

/**
 * Work order domain types and the repository abstraction.
 *
 * Phase 5 stores work orders locally (localStorage). A future
 * `supabaseWorkOrderRepository` can implement the same `WorkOrderRepository`
 * interface so the UI does not change when persistence moves to Supabase.
 */

export interface WorkOrder {
  id: string;
  bookingId: string;
  customerFullName: string;
  phone: string;
  carMake: string;
  carModel: string;
  carYear: string;
  plateNumber?: string;
  complaint: string;
  workOrderNumber: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderRepository {
  list(): Promise<WorkOrder[]>;
  createFromBooking(booking: Booking): Promise<WorkOrder>;
  existsForBooking(bookingId: string): Promise<boolean>;
}
