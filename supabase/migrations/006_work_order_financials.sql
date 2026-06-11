-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 006: Work Order Financial Closure (Phase 19A)
-- =============================================================================
-- Adds the minimal, disciplined financial layer for work orders (NOT a full
-- accounting system):
--   - financial / quote columns on work_orders
--   - work_order_services   (quote + invoice line items: service + price)
--   - work_order_payments   (append-only payment ledger; partial or full)
--   - RLS + admin-only policies + grants on the NEW tables ONLY, mirroring 005.
--
-- Design notes:
--   * quote_status drives the whole money flow AND the derived "customer
--     approval" badge in the UI (single source of truth — no separate column).
--   * Totals (total / paid / remaining) are COMPUTED in the app layer and are
--     intentionally NOT stored here, so there is no denormalized money to drift.
--   * A non-zero discount must carry a reason (no silent discounts).
--   * An invoice is issued at most once per work order (unique invoice_number).
--
-- Scope safety:
--   * Additive and idempotent — safe to run after 001–005.
--   * Does NOT modify existing tables' structure, existing RLS policies, the
--     existing anon grants, or the public booking RPC. Existing 005 policies are
--     untouched; only the two NEW tables get policies.
--
-- IMPORTANT: This file is a LOCAL migration only. It is NOT applied to the live
-- Supabase database by Phase 19A. To apply later (after review/approval): paste
-- into the Supabase SQL Editor and run after 005, or run via the Supabase CLI /
-- psql. It depends on is_admin() and set_updated_at() from 004/005/001.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Financial / quote columns on work_orders (additive, idempotent).
-- -----------------------------------------------------------------------------
alter table public.work_orders
  add column if not exists quote_status text not null default 'draft'
    check (quote_status in ('draft', 'sent', 'approved', 'rejected'));

alter table public.work_orders
  add column if not exists discount_amount numeric(12,2) not null default 0
    check (discount_amount >= 0);

alter table public.work_orders
  add column if not exists discount_reason text;

alter table public.work_orders
  add column if not exists invoice_number text;

alter table public.work_orders
  add column if not exists invoiced_at timestamptz;

alter table public.work_orders
  add column if not exists no_invoice_reason text;

comment on column public.work_orders.quote_status is
  'Quote lifecycle: draft -> sent -> approved/rejected. Drives the UI customer-approval badge.';
comment on column public.work_orders.no_invoice_reason is
  'Recorded reason a work order is closed/delivered without an invoice (canDeliver guard).';

-- A non-zero discount must carry a non-empty reason. Guarded so the migration is
-- idempotent and the constraint is added only once.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'work_orders_discount_reason_check'
  ) then
    alter table public.work_orders
      add constraint work_orders_discount_reason_check
      check (
        discount_amount = 0
        or (discount_reason is not null and btrim(discount_reason) <> '')
      );
  end if;
end $$;

-- invoice_number is unique WHEN PRESENT. A partial unique index allows many
-- NULLs (work orders that have not been invoiced yet) while blocking duplicates.
create unique index if not exists idx_work_orders_invoice_number
  on public.work_orders (invoice_number)
  where invoice_number is not null;

-- -----------------------------------------------------------------------------
-- 2) work_order_services — quote / invoice line items (service + price).
-- -----------------------------------------------------------------------------
create table if not exists public.work_order_services (
  id                 uuid primary key default gen_random_uuid(),
  work_order_id      uuid not null references public.work_orders(id) on delete cascade,
  name               text not null,
  notes              text,
  unit_price         numeric(12,2) not null default 0 check (unit_price >= 0),
  quantity           int not null default 1 check (quantity >= 1),
  estimated_minutes  int check (estimated_minutes is null or estimated_minutes >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.work_order_services is
  'Line items (service name + unit price) for a work order quote/invoice. Phase 19A.';

create index if not exists idx_work_order_services_work_order_id
  on public.work_order_services (work_order_id);

-- -----------------------------------------------------------------------------
-- 3) work_order_payments — append-only payment ledger (partial or full).
--    paid = SUM(amount); remaining = total - paid (computed in the app layer).
-- -----------------------------------------------------------------------------
create table if not exists public.work_order_payments (
  id             uuid primary key default gen_random_uuid(),
  work_order_id  uuid not null references public.work_orders(id) on delete cascade,
  amount         numeric(12,2) not null check (amount > 0),
  method         text not null check (method in ('cash', 'card', 'transfer', 'credit')),
  note           text,
  created_at     timestamptz not null default now()
);

comment on table public.work_order_payments is
  'Payments recorded against a work order (cash/card/transfer/credit). Append-only. Phase 19A.';

create index if not exists idx_work_order_payments_work_order_id
  on public.work_order_payments (work_order_id);

-- -----------------------------------------------------------------------------
-- 4) updated_at trigger for work_order_services (reuses set_updated_at from 001).
--    Payments are append-only and have no updated_at.
-- -----------------------------------------------------------------------------
drop trigger if exists trg_work_order_services_updated_at on public.work_order_services;
create trigger trg_work_order_services_updated_at
  before update on public.work_order_services
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- 5) RLS — NEW tables only. Admin-only (authenticated + is_admin()), mirroring
--    005. Existing tables and their policies are NOT touched here.
-- -----------------------------------------------------------------------------
alter table public.work_order_services enable row level security;
alter table public.work_order_payments enable row level security;

-- work_order_services (full CRUD for admins — line items are edited pre-invoice).
drop policy if exists admin_select_work_order_services on public.work_order_services;
create policy admin_select_work_order_services on public.work_order_services
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_work_order_services on public.work_order_services;
create policy admin_insert_work_order_services on public.work_order_services
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_work_order_services on public.work_order_services;
create policy admin_update_work_order_services on public.work_order_services
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists admin_delete_work_order_services on public.work_order_services;
create policy admin_delete_work_order_services on public.work_order_services
  for delete to authenticated using (is_admin());

-- work_order_payments (select + insert only — the ledger is append-only).
drop policy if exists admin_select_work_order_payments on public.work_order_payments;
create policy admin_select_work_order_payments on public.work_order_payments
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_work_order_payments on public.work_order_payments;
create policy admin_insert_work_order_payments on public.work_order_payments
  for insert to authenticated with check (is_admin());

-- -----------------------------------------------------------------------------
-- 6) Grants — authenticated only (RLS still restricts rows to admins). anon gets
--    nothing on these tables. authenticated already has schema USAGE from 005.
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on public.work_order_services to authenticated;
grant select, insert                 on public.work_order_payments to authenticated;

-- =============================================================================
-- End of 006. Work orders now carry a minimal financial closure layer. No
-- existing tables, policies, grants, or the public booking RPC were modified.
-- =============================================================================
