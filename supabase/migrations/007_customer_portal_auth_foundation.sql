-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 007: Customer Portal Auth Foundation (Phase 20A)
-- =============================================================================
-- Adds the minimal customer authentication layer for a future customer portal.
-- In Phase 20A: auth linking only (admin-driven), no documents/storage/quick-access.
--
-- Design notes:
--   * customer_accounts bridges customers to Supabase Auth (email+password).
--   * snapshot fields (display_name, phone_last4) denormalize customer data so
--     Phase 20A dashboard does not read from customers table.
--   * is_customer() and current_customer_id() are active-status gated.
--   * Admin-only insert: no self-signup or self-link in Phase 20A.
--   * RLS new table only: customers/vehicles/work_orders unchanged.
--
-- Scope safety:
--   * Additive and idempotent — safe to run after 001–006.
--   * Does NOT modify existing tables, existing RLS policies, anon grants,
--     or the public booking RPC. Existing 005–006 policies are untouched.
--   * No service role usage.
--   * No storage bucket.
--   * No quick-access or document tables.
--
-- IMPORTANT: This file is a LOCAL migration only. Not applied to live Supabase
-- until review. To apply later: paste into Supabase SQL Editor after 006.
-- =============================================================================

-- ===========================================================================
-- 1) customer_accounts: Auth linking (admin-driven, snapshot denormalization)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.customer_accounts (
  id                 uuid primary key default gen_random_uuid(),
  customer_id        uuid not null unique references public.customers(id) on delete cascade,
  auth_user_id       uuid not null unique references auth.users(id) on delete cascade,
  -- Snapshot fields (denormalized from customers for Phase 20A)
  -- Phase 20A reads from here, not customers table
  display_name       text not null,
  phone_last4        text,
  status             text not null default 'active'
                     check (status in ('active', 'inactive')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.customer_accounts is
  'Links a customer to Supabase Auth (email+password). Snapshot fields denormalize data for Phase 20A.';
comment on column public.customer_accounts.customer_id is
  'Reference to customers table. One-to-one: each customer has at most one auth account.';
comment on column public.customer_accounts.auth_user_id is
  'Reference to auth.users. One-to-one: each auth account maps to at most one customer.';
comment on column public.customer_accounts.display_name is
  'Snapshot of customer.full_name at link time. Admin sets this when linking auth account.';
comment on column public.customer_accounts.phone_last4 is
  'Last 4 digits of customer phone (e.g., "1234"). Snapshot for display privacy.';
comment on column public.customer_accounts.status is
  'active=customer can log in. inactive=account disabled (admin can toggle later).';

create index if not exists idx_customer_accounts_customer_id
  on public.customer_accounts (customer_id);

create index if not exists idx_customer_accounts_auth_user_id
  on public.customer_accounts (auth_user_id);

-- ===========================================================================
-- 2) updated_at trigger (reuses set_updated_at from 001)
-- ===========================================================================
drop trigger if exists trg_customer_accounts_updated_at on public.customer_accounts;
create trigger trg_customer_accounts_updated_at
  before update on public.customer_accounts
  for each row execute function set_updated_at();

-- ===========================================================================
-- 3) Helper: is_customer()
--    Returns true if current authenticated user is a customer with status='active'.
--    Used for customer-facing RLS policies.
-- ===========================================================================
create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists(
    select 1 from public.customer_accounts
    where auth_user_id = auth.uid() and status = 'active'
  );
$$;

revoke all on function public.is_customer() from public;
grant execute on function public.is_customer() to authenticated;

-- ===========================================================================
-- 4) Helper: current_customer_id()
--    Returns the customer_id for the current authenticated user if active.
--    Returns NULL if not a customer or status != 'active'.
--    Used by RLS policies to filter customer data.
-- ===========================================================================
create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select customer_id from public.customer_accounts
  where auth_user_id = auth.uid() and status = 'active'
  limit 1;
$$;

revoke all on function public.current_customer_id() from public;
grant execute on function public.current_customer_id() to authenticated;

-- ===========================================================================
-- 5) RLS on customer_accounts (NEW TABLE ONLY)
--    Admin: select/insert/update only (no delete, no self-link).
--    Customer: select own account only (read-only).
--    No anon access.
-- ===========================================================================
alter table public.customer_accounts enable row level security;

-- Admin: SELECT all accounts
drop policy if exists admin_select_customer_accounts on public.customer_accounts;
create policy admin_select_customer_accounts on public.customer_accounts
  for select to authenticated using (public.is_admin());

-- Admin: INSERT new account link (no customer can self-link)
drop policy if exists admin_insert_customer_accounts on public.customer_accounts;
create policy admin_insert_customer_accounts on public.customer_accounts
  for insert to authenticated with check (public.is_admin());

-- Admin: UPDATE account status or snapshot (no customer can change their own)
drop policy if exists admin_update_customer_accounts on public.customer_accounts;
create policy admin_update_customer_accounts on public.customer_accounts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Customer: SELECT own account only (read-only snapshot for dashboard)
drop policy if exists customer_read_own_account on public.customer_accounts;
create policy customer_read_own_account on public.customer_accounts
  for select to authenticated
  using (is_customer() and auth_user_id = auth.uid());

-- ===========================================================================
-- 6) Grants
--    Authenticated (staff + customers) can read/insert/update (RLS restricts rows).
--    anon gets nothing on this table.
-- ===========================================================================
grant select, insert, update on public.customer_accounts to authenticated;

-- =============================================================================
-- End of 007. Customer auth layer ready for Phase 20A. No existing tables,
-- policies, grants, or public booking RPC were modified.
-- =============================================================================
