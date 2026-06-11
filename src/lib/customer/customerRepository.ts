import { getSupabaseClient } from "@/lib/supabaseClient";
import type { CustomerAccount, CustomerAccountRepository } from "./types";

/**
 * Supabase-backed customer account repository (Phase 20A).
 *
 * Admin-driven linking only: no self-signup or self-link.
 * Snapshot fields denormalize customer data so Phase 20A dashboard
 * does not read from customers table.
 */

interface CustomerAccountRow {
  id: string;
  customer_id: string;
  auth_user_id: string;
  display_name: string;
  phone_last4: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

const SELECT = `
  id, customer_id, auth_user_id, display_name, phone_last4,
  status, created_at, updated_at
`;

function mapRow(row: CustomerAccountRow): CustomerAccount {
  return {
    id: row.id,
    customerId: row.customer_id,
    authUserId: row.auth_user_id,
    displayName: row.display_name,
    phoneLast4: row.phone_last4 ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const customerRepository: CustomerAccountRepository = {
  async getByAuthUserId(authUserId: string): Promise<CustomerAccount | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("customer_accounts")
      .select(SELECT)
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (error) throw new Error("تعذّر تحميل حساب العميل.");
    if (!data) return null;
    return mapRow(data as unknown as CustomerAccountRow);
  },

  async getByCustomerId(customerId: string): Promise<CustomerAccount | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("customer_accounts")
      .select(SELECT)
      .eq("customer_id", customerId)
      .maybeSingle();
    if (error) throw new Error("تعذّر تحميل حساب العميل.");
    if (!data) return null;
    return mapRow(data as unknown as CustomerAccountRow);
  },

  async list(): Promise<CustomerAccount[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("customer_accounts")
      .select(SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error("تعذّر تحميل حسابات العملاء.");
    if (!data) return [];
    return (data as unknown as CustomerAccountRow[]).map(mapRow);
  },

  async link(
    customerId: string,
    authUserId: string,
    displayName: string,
    phoneLast4?: string
  ): Promise<CustomerAccount> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("customer_accounts")
      .insert({
        customer_id: customerId,
        auth_user_id: authUserId,
        display_name: displayName,
        phone_last4: phoneLast4 ?? null,
        status: "active",
      })
      .select(SELECT)
      .single();
    if (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new Error("العميل أو حساب المستخدم مربوط بالفعل.");
      }
      throw new Error("تعذّر ربط حساب العميل.");
    }
    if (!data) throw new Error("ربط حساب العميل فشل.");
    return mapRow(data as unknown as CustomerAccountRow);
  },

  async update(
    id: string,
    patch: Partial<Pick<CustomerAccount, "status" | "displayName" | "phoneLast4">>
  ): Promise<CustomerAccount> {
    const supabase = getSupabaseClient();
    const updatePayload: Record<string, unknown> = {};
    if (patch.status !== undefined) updatePayload.status = patch.status;
    if (patch.displayName !== undefined)
      updatePayload.display_name = patch.displayName;
    if (patch.phoneLast4 !== undefined)
      updatePayload.phone_last4 = patch.phoneLast4 ?? null;

    const { data, error } = await supabase
      .from("customer_accounts")
      .update(updatePayload)
      .eq("id", id)
      .select(SELECT)
      .single();
    if (error) throw new Error("تعذّر تحديث حساب العميل.");
    if (!data) throw new Error("حساب العميل غير موجود.");
    return mapRow(data as unknown as CustomerAccountRow);
  },
};
