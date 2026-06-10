-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- Phase 11: Database integrity (Supabase / PostgreSQL)
-- =============================================================================
-- This migration strengthens data integrity WITHOUT enabling RLS (Row Level
-- Security is intentionally deferred until authentication exists — see README).
--
-- It is additive and safe to run after 001_initial_schema.sql. It does not
-- modify the approved tables/columns; it only adds a constraint and indexes.
--
-- How to apply: paste into the Supabase SQL Editor and run (after 001).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Prevent duplicate work orders for the same booking.
--
-- A UNIQUE constraint on work_orders.booking_id makes duplicate conversion
-- impossible at the database level (the app already guards in code; this closes
-- the race window). Note: NULL booking_id is still allowed multiple times
-- (a work order created without a source booking), which is the desired
-- Postgres behavior for UNIQUE over a nullable column.
--
-- Added via a guarded DO block so the migration is idempotent.
--
-- IMPORTANT: if duplicate non-null booking_id rows already exist, resolve them
-- before running (the constraint creation will otherwise fail).
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'work_orders_booking_id_key'
  ) then
    alter table work_orders
      add constraint work_orders_booking_id_key unique (booking_id);
  end if;
end $$;

-- The non-unique index from 001 on work_orders(booking_id) is now redundant:
-- the UNIQUE constraint above creates its own index that serves lookups.
drop index if exists idx_work_orders_booking_id;

-- -----------------------------------------------------------------------------
-- 2) Safe indexes for booking and work order lookups.
--
-- Bookings already index status, created_at, customer_id, vehicle_id (001).
-- Work orders only had work_order_number + booking_id. The work-orders list
-- joins customers/vehicles and orders by created_at, so add the supporting
-- indexes below. All are created IF NOT EXISTS (idempotent).
-- -----------------------------------------------------------------------------
create index if not exists idx_work_orders_customer_id  on work_orders (customer_id);
create index if not exists idx_work_orders_vehicle_id   on work_orders (vehicle_id);
create index if not exists idx_work_orders_created_at   on work_orders (created_at);
create index if not exists idx_work_orders_status       on work_orders (status);

-- =============================================================================
-- 3) RLS: NOT enabled in this phase. Tables remain accessible with the
--    publishable/anon key. RLS policies will be added in a later phase once
--    authentication is implemented (see README).
-- =============================================================================
-- End of Phase 11 integrity migration.
-- =============================================================================
