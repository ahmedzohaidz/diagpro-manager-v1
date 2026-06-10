-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- Phase 2: Initial Database Schema (Supabase / PostgreSQL)
-- =============================================================================
-- This migration creates ONLY the approved V1 tables for the online booking
-- flow and early work-order tracking:
--   customers, vehicles, bookings, booking_messages,
--   booking_status_logs, work_orders, users
--
-- Out of scope for V1 (do NOT add here): invoices, inventory, diagnostics,
-- AI agent tables, authentication tables, payments.
--
-- How to apply: paste this file into the Supabase SQL Editor and run it,
-- or run it via the Supabase CLI / psql. See README.md.
-- =============================================================================

-- Required for gen_random_uuid(). Available by default on Supabase.
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Trigger function: keep updated_at fresh on every UPDATE.
-- Reused by all tables that have an updated_at column.
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- users
-- Internal workshop staff (admins, advisors, technicians). Not end-customers.
-- Authentication is NOT part of V1 — this is a simple staff reference table.
-- -----------------------------------------------------------------------------
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  role        text not null default 'staff'
              check (role in ('admin', 'advisor', 'technician', 'staff')),
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table users is 'Internal workshop staff. No auth in V1; reference table only.';

-- -----------------------------------------------------------------------------
-- customers
-- The people who book and own vehicles. "source" records where the booking
-- customer came from (e.g. online form, whatsapp, walk_in, phone).
-- -----------------------------------------------------------------------------
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text not null,
  source      text not null default 'online'
              check (source in ('online', 'whatsapp', 'phone', 'walk_in', 'other')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table customers is 'Customers who submit bookings and own vehicles.';

-- -----------------------------------------------------------------------------
-- vehicles
-- Each vehicle belongs to a customer. "No car should enter without a record."
-- -----------------------------------------------------------------------------
create table if not exists vehicles (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references customers(id) on delete cascade,
  make          text,
  model         text,
  year          int check (year is null or (year >= 1900 and year <= 2100)),
  plate_number  text,
  color         text,
  odometer      int check (odometer is null or odometer >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table vehicles is 'Vehicles owned by customers. Linked to bookings and work orders.';

-- -----------------------------------------------------------------------------
-- bookings
-- The heart of V1: online booking requests. "No booking should be ignored."
-- status uses the approved booking status set from CLAUDE.md.
-- -----------------------------------------------------------------------------
create table if not exists bookings (
  id                      uuid primary key default gen_random_uuid(),
  customer_id             uuid references customers(id) on delete set null,
  vehicle_id              uuid references vehicles(id) on delete set null,
  problem_description     text,
  is_drivable             boolean,
  has_check_engine_light  boolean,
  preferred_date          date,
  preferred_time          time,
  status                  text not null default 'new_request'
                          check (status in (
                            'new_request',
                            'missing_data',
                            'pending_review',
                            'appointment_suggested',
                            'confirmed',
                            'reminder_sent',
                            'arrived',
                            'converted_to_work_order',
                            'cancelled',
                            'no_show'
                          )),
  priority                text not null default 'normal'
                          check (priority in ('low', 'normal', 'high', 'urgent')),
  image_url               text,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table bookings is 'Online booking requests; core of the V1 booking flow.';

-- -----------------------------------------------------------------------------
-- booking_messages
-- Conversation log tied to a booking (inbound from customer / outbound to
-- customer). WhatsApp-ready links live in the app layer; this just stores text.
-- -----------------------------------------------------------------------------
create table if not exists booking_messages (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  direction     text not null
                check (direction in ('inbound', 'outbound')),
  message_text  text not null,
  channel       text not null default 'whatsapp'
                check (channel in ('whatsapp', 'phone', 'web', 'sms', 'other')),
  created_at    timestamptz not null default now()
);

comment on table booking_messages is 'Messages exchanged with the booking customer.';

-- -----------------------------------------------------------------------------
-- booking_status_logs
-- Audit trail of booking status changes. Supports "no booking ignored".
-- changed_by references staff (nullable; may be system/automated later).
-- -----------------------------------------------------------------------------
create table if not exists booking_status_logs (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  changed_by  uuid references users(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

comment on table booking_status_logs is 'Audit log of booking status transitions.';

-- -----------------------------------------------------------------------------
-- work_orders
-- Created when a booking is converted. "No work should start without a clear
-- work order." status uses the approved work-order status set from CLAUDE.md.
-- -----------------------------------------------------------------------------
create table if not exists work_orders (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid references bookings(id) on delete set null,
  customer_id        uuid references customers(id) on delete set null,
  vehicle_id         uuid references vehicles(id) on delete set null,
  work_order_number  text not null unique,
  complaint          text,
  status             text not null default 'received'
                     check (status in (
                       'received',
                       'under_inspection',
                       'waiting_customer_approval',
                       'under_repair',
                       'final_test',
                       'ready_for_pickup',
                       'delivered',
                       'cancelled'
                     )),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table work_orders is 'Work orders converted from bookings; early repair tracking.';

-- -----------------------------------------------------------------------------
-- Indexes (per Phase 2 requirements)
-- -----------------------------------------------------------------------------
create index if not exists idx_customers_phone        on customers (phone);
create index if not exists idx_vehicles_customer_id   on vehicles (customer_id);
create index if not exists idx_bookings_status        on bookings (status);
create index if not exists idx_bookings_created_at    on bookings (created_at);
create index if not exists idx_work_orders_number     on work_orders (work_order_number);

-- Helpful supporting indexes for foreign keys used in joins/filters.
create index if not exists idx_bookings_customer_id          on bookings (customer_id);
create index if not exists idx_bookings_vehicle_id           on bookings (vehicle_id);
create index if not exists idx_booking_messages_booking_id   on booking_messages (booking_id);
create index if not exists idx_booking_status_logs_booking_id on booking_status_logs (booking_id);
create index if not exists idx_work_orders_booking_id        on work_orders (booking_id);

-- -----------------------------------------------------------------------------
-- updated_at triggers (only on tables that have updated_at)
-- -----------------------------------------------------------------------------
drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();

drop trigger if exists trg_vehicles_updated_at on vehicles;
create trigger trg_vehicles_updated_at
  before update on vehicles
  for each row execute function set_updated_at();

drop trigger if exists trg_bookings_updated_at on bookings;
create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute function set_updated_at();

drop trigger if exists trg_work_orders_updated_at on work_orders;
create trigger trg_work_orders_updated_at
  before update on work_orders
  for each row execute function set_updated_at();

-- =============================================================================
-- End of Phase 2 schema.
-- =============================================================================
