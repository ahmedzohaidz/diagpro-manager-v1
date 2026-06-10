-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 003: Development-only anon permissions (for Phase 12 E2E test)
-- =============================================================================
-- PURPOSE: Phase 12 (Supabase End-to-End Test) needs the browser Supabase
-- client to read/write using the publishable / anon role. By default the `anon`
-- role has NO table privileges, so Supabase mode fails from the browser with
-- "permission denied". This migration grants the minimal table privileges the
-- app actually uses.
--
-- ⚠️ SECURITY WARNING — READ BEFORE USING:
--   * This is TEMPORARY, for local development / testing ONLY.
--   * RLS remains DISABLED for now — with these grants, anyone holding the anon
--     key (which ships in browser code) can read/write these tables.
--   * Do NOT use this as production security.
--   * Before production, REPLACE this with Authentication + RLS policies
--     (then these broad anon grants should be revoked/narrowed).
--
-- Scope notes:
--   * Least-privilege: only the tables + operations the app performs.
--   * NO privileges are granted on public.users.
--   * NO DELETE is granted on any table.
-- =============================================================================

-- Allow the anon role to access objects in the public schema.
grant usage on schema public to anon;

-- Customers & vehicles: created from /book, read in admin lists.
grant select, insert on public.customers to anon;
grant select, insert on public.vehicles to anon;

-- Bookings: created from /book, read everywhere, status updated by admin.
grant select, insert, update on public.bookings to anon;

-- Booking messages & status logs: read/insert support tables.
grant select, insert on public.booking_messages to anon;
grant select, insert on public.booking_status_logs to anon;

-- Work orders: created on conversion, read + status updates in admin.
grant select, insert, update on public.work_orders to anon;

-- NOTE: public.users is intentionally NOT granted to anon.

-- =============================================================================
-- End of 003 (development-only). Revoke/replace with RLS before production.
-- =============================================================================
