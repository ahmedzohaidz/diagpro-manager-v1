-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 005: RLS Hardening (Phase 14B)
-- =============================================================================
-- Enables Row Level Security on all application tables, replaces the temporary
-- 003 anon grants with a single security-definer RPC for public booking
-- creation, and grants admin (authenticated + is_admin()) access to manage
-- bookings/customers/vehicles/work-orders.
--
-- Idempotent: safe to re-run (drop-if-exists guards on policies/functions).
-- Does not modify table structure from 001/002/004.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Helper: is_admin()
--    True if the current authenticated user is linked to a public.users row
--    with role = 'admin'. Reuses current_staff_role() from 004.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_staff_role() = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 2) Public booking RPC: create_public_booking
--    security definer — runs with table-owner privileges, so it works even
--    though anon has no direct table grants. Validates required fields, forces
--    status = 'new_request', and returns ONLY booking metadata (no customer /
--    vehicle data).
-- -----------------------------------------------------------------------------
drop function if exists public.create_public_booking(
  text, text, text, text, int, text, text, boolean, boolean, date, time, text, text
);

create or replace function public.create_public_booking(
  p_customer_full_name   text,
  p_phone                text,
  p_car_make             text,
  p_car_model            text,
  p_car_year             int,
  p_plate_number         text,
  p_problem_description  text,
  p_is_drivable          boolean,
  p_has_check_engine_light boolean,
  p_preferred_date       date,
  p_preferred_time       time,
  p_priority             text,
  p_notes                text
)
returns table (
  id          uuid,
  status      text,
  priority    text,
  created_at  timestamptz,
  updated_at  timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid;
  v_vehicle_id  uuid;
  v_priority    text;
begin
  if p_customer_full_name is null or btrim(p_customer_full_name) = '' then
    raise exception 'customer full name is required';
  end if;

  if p_phone is null or btrim(p_phone) = '' then
    raise exception 'phone is required';
  end if;

  if p_problem_description is null or btrim(p_problem_description) = '' then
    raise exception 'problem description is required';
  end if;

  if p_car_year is not null and (p_car_year < 1900 or p_car_year > 2100) then
    raise exception 'car year out of range';
  end if;

  v_priority := case
    when p_priority in ('low', 'normal', 'high', 'urgent') then p_priority
    else 'normal'
  end;

  insert into public.customers (full_name, phone, source)
  values (btrim(p_customer_full_name), btrim(p_phone), 'online')
  returning customers.id into v_customer_id;

  insert into public.vehicles (customer_id, make, model, year, plate_number)
  values (v_customer_id, p_car_make, p_car_model, p_car_year, p_plate_number)
  returning vehicles.id into v_vehicle_id;

  return query
  insert into public.bookings (
    customer_id, vehicle_id, problem_description, is_drivable,
    has_check_engine_light, preferred_date, preferred_time,
    status, priority, notes
  )
  values (
    v_customer_id, v_vehicle_id, p_problem_description, p_is_drivable,
    p_has_check_engine_light, p_preferred_date, p_preferred_time,
    'new_request', v_priority, p_notes
  )
  returning bookings.id, bookings.status, bookings.priority, bookings.created_at, bookings.updated_at;
end;
$$;

revoke all on function public.create_public_booking(
  text, text, text, text, int, text, text, boolean, boolean, date, time, text, text
) from public;

grant execute on function public.create_public_booking(
  text, text, text, text, int, text, text, boolean, boolean, date, time, text, text
) to anon;

-- -----------------------------------------------------------------------------
-- 3) Enable Row Level Security on all application tables.
-- -----------------------------------------------------------------------------
alter table public.customers           enable row level security;
alter table public.vehicles            enable row level security;
alter table public.bookings            enable row level security;
alter table public.booking_messages    enable row level security;
alter table public.booking_status_logs enable row level security;
alter table public.work_orders         enable row level security;
alter table public.users               enable row level security;

-- -----------------------------------------------------------------------------
-- 4) Policies — admin (authenticated + is_admin()) only.
--    No anon policies: anon has zero direct table grants (see section 5);
--    all anon writes go through create_public_booking() above.
-- -----------------------------------------------------------------------------

-- customers
drop policy if exists admin_select_customers on public.customers;
create policy admin_select_customers on public.customers
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_customers on public.customers;
create policy admin_insert_customers on public.customers
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_customers on public.customers;
create policy admin_update_customers on public.customers
  for update to authenticated using (is_admin()) with check (is_admin());

-- vehicles
drop policy if exists admin_select_vehicles on public.vehicles;
create policy admin_select_vehicles on public.vehicles
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_vehicles on public.vehicles;
create policy admin_insert_vehicles on public.vehicles
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_vehicles on public.vehicles;
create policy admin_update_vehicles on public.vehicles
  for update to authenticated using (is_admin()) with check (is_admin());

-- bookings
drop policy if exists admin_select_bookings on public.bookings;
create policy admin_select_bookings on public.bookings
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_bookings on public.bookings;
create policy admin_insert_bookings on public.bookings
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_bookings on public.bookings;
create policy admin_update_bookings on public.bookings
  for update to authenticated using (is_admin()) with check (is_admin());

-- booking_messages
drop policy if exists admin_select_booking_messages on public.booking_messages;
create policy admin_select_booking_messages on public.booking_messages
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_booking_messages on public.booking_messages;
create policy admin_insert_booking_messages on public.booking_messages
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_booking_messages on public.booking_messages;
create policy admin_update_booking_messages on public.booking_messages
  for update to authenticated using (is_admin()) with check (is_admin());

-- booking_status_logs
drop policy if exists admin_select_booking_status_logs on public.booking_status_logs;
create policy admin_select_booking_status_logs on public.booking_status_logs
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_booking_status_logs on public.booking_status_logs;
create policy admin_insert_booking_status_logs on public.booking_status_logs
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_booking_status_logs on public.booking_status_logs;
create policy admin_update_booking_status_logs on public.booking_status_logs
  for update to authenticated using (is_admin()) with check (is_admin());

-- work_orders
drop policy if exists admin_select_work_orders on public.work_orders;
create policy admin_select_work_orders on public.work_orders
  for select to authenticated using (is_admin());

drop policy if exists admin_insert_work_orders on public.work_orders;
create policy admin_insert_work_orders on public.work_orders
  for insert to authenticated with check (is_admin());

drop policy if exists admin_update_work_orders on public.work_orders;
create policy admin_update_work_orders on public.work_orders
  for update to authenticated using (is_admin()) with check (is_admin());

-- users (read-only for admins; staff records are not self-managed in V1)
drop policy if exists admin_select_users on public.users;
create policy admin_select_users on public.users
  for select to authenticated using (is_admin());

-- -----------------------------------------------------------------------------
-- 5) Grants.
--    Revoke the temporary 003 anon grants entirely. anon retains only schema
--    USAGE (required to call the RPC) and EXECUTE on create_public_booking.
--    authenticated gets table-level grants matching the policies above; RLS
--    still restricts rows to admins via is_admin().
-- -----------------------------------------------------------------------------
revoke all on public.customers           from anon;
revoke all on public.vehicles            from anon;
revoke all on public.bookings            from anon;
revoke all on public.booking_messages    from anon;
revoke all on public.booking_status_logs from anon;
revoke all on public.work_orders         from anon;
revoke all on public.users               from anon;

-- anon keeps schema usage (needed to call the RPC) and gets execute on it only.
grant usage on schema public to anon;

grant usage on schema public to authenticated;

grant select, insert, update on public.customers           to authenticated;
grant select, insert, update on public.vehicles             to authenticated;
grant select, insert, update on public.bookings             to authenticated;
grant select, insert, update on public.booking_messages     to authenticated;
grant select, insert, update on public.booking_status_logs  to authenticated;
grant select, insert, update on public.work_orders          to authenticated;
grant select on public.users to authenticated;

-- =============================================================================
-- End of 005. RLS is now enabled on all application tables. Public booking
-- creation flows exclusively through create_public_booking().
-- =============================================================================
