/**
 * Customer account types for Phase 20A.
 *
 * Phase 20A: Auth linking only (no documents/storage/quick-access).
 * snapshot fields (display_name, phone_last4) denormalize customer data so
 * the dashboard does not read from customers table.
 */

export interface CustomerAccount {
  id: string;
  customerId: string;
  authUserId: string;
  displayName: string;
  phoneLast4?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAccountRepository {
  /** Get a customer account by auth_user_id (current logged-in user). */
  getByAuthUserId(authUserId: string): Promise<CustomerAccount | null>;

  /** Get a customer account by customer_id (admin view). */
  getByCustomerId(customerId: string): Promise<CustomerAccount | null>;

  /** List all customer accounts (admin only). */
  list(): Promise<CustomerAccount[]>;

  /** Create a new customer account link (admin-driven, no self-signup). */
  link(
    customerId: string,
    authUserId: string,
    displayName: string,
    phoneLast4?: string
  ): Promise<CustomerAccount>;

  /** Update account status or snapshot (admin only). */
  update(
    id: string,
    patch: Partial<Pick<CustomerAccount, 'status' | 'displayName' | 'phoneLast4'>>
  ): Promise<CustomerAccount>;
}
