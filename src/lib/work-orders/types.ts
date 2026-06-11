import type {
  WorkOrderStatus,
  QuoteStatus,
  PaymentMethod,
} from "@/lib/statuses";
import type { Booking } from "@/lib/bookings/types";

/**
 * Work order domain types and the repository abstraction.
 *
 * Phase 5 stores work orders locally (localStorage). A future
 * `supabaseWorkOrderRepository` can implement the same `WorkOrderRepository`
 * interface so the UI does not change when persistence moves to Supabase.
 *
 * Phase 19A adds the financial closure layer: a quote (line items +
 * quote_status), a simple invoice (invoice_number + invoiced_at), and a
 * payment ledger. Totals are computed (see lib/work-orders/financials.ts),
 * never stored.
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
  // Phase 19A — financial closure fields.
  quoteStatus: QuoteStatus;
  discountAmount: number;
  discountReason?: string;
  invoiceNumber?: string;
  invoicedAt?: string;
  noInvoiceReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** A quote/invoice line item: a service and its price. */
export interface WorkOrderService {
  id: string;
  workOrderId: string;
  name: string;
  notes?: string;
  unitPrice: number;
  quantity: number;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderServiceInput {
  name: string;
  notes?: string;
  unitPrice: number;
  quantity: number;
  estimatedMinutes?: number;
}

/** A single recorded payment against a work order (append-only ledger). */
export interface WorkOrderPayment {
  id: string;
  workOrderId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  createdAt: string;
}

export interface WorkOrderPaymentInput {
  amount: number;
  method: PaymentMethod;
  note?: string;
}

export interface WorkOrderRepository {
  list(): Promise<WorkOrder[]>;
  createFromBooking(booking: Booking): Promise<WorkOrder>;
  existsForBooking(bookingId: string): Promise<boolean>;
  findByBooking(bookingId: string): Promise<WorkOrder | null>;

  // ---- Phase 19A: financial closure --------------------------------------
  /** A single work order by id, with its current financial fields. */
  getById(workOrderId: string): Promise<WorkOrder | null>;

  // Quote line items (services + prices).
  listServices(workOrderId: string): Promise<WorkOrderService[]>;
  addService(
    workOrderId: string,
    input: WorkOrderServiceInput
  ): Promise<WorkOrderService>;
  removeService(serviceId: string): Promise<void>;

  // Quote lifecycle + discount.
  setQuoteStatus(
    workOrderId: string,
    status: QuoteStatus
  ): Promise<WorkOrder>;
  setDiscount(
    workOrderId: string,
    amount: number,
    reason: string | null
  ): Promise<WorkOrder>;

  // Invoice (only valid when quote_status = 'approved').
  generateInvoice(workOrderId: string): Promise<WorkOrder>;

  // Payment ledger.
  listPayments(workOrderId: string): Promise<WorkOrderPayment[]>;
  addPayment(
    workOrderId: string,
    input: WorkOrderPaymentInput
  ): Promise<WorkOrderPayment>;
}
