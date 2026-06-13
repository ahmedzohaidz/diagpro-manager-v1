-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 008: Customer Documents Foundation (Phase 20B-1)
-- =============================================================================
-- Adds customer_documents table and RLS for managing customer-facing documents.
-- Phase 20B-1: Database + metadata only. No Storage bucket, no upload, no UI.
--
-- Design notes:
--   * Additive: does not modify existing tables or RLS policies.
--   * RLS: admin full access, customer read-only + visibility control.
--   * customer_visible default false: admin must explicitly show to customer.
--   * file_url, storage_path NULL for now (filled in Phase 20C).
--   * Indexes on: customer_id, vehicle_id, booking_id, work_order_id, type, visible, created_at.
--   * No DELETE policy for customers (read-only only).
--   * No anon access.
--
-- Scope safety:
--   * Does NOT modify existing tables or existing RLS policies.
--   * Does NOT add Storage bucket.
--   * Does NOT add API routes.
--   * Does NOT add UI.
--   * Does NOT modify /book, /admin, /customer.
--
-- IMPORTANT: This file is a LOCAL migration only. Not applied to live Supabase
-- until review. To apply later: paste into Supabase SQL Editor after 007.
-- =============================================================================

-- ===========================================================================
-- 1) customer_documents: Document metadata and visibility control
-- ===========================================================================
create table if not exists public.customer_documents (
  id                    uuid primary key default gen_random_uuid(),
  customer_id           uuid not null references public.customers(id) on delete cascade,
  vehicle_id            uuid references public.vehicles(id) on delete set null,
  booking_id            uuid references public.bookings(id) on delete set null,
  work_order_id         uuid references public.work_orders(id) on delete set null,

  document_type         text not null
                        check (document_type in (
                          'diagnostic_report',
                          'invoice',
                          'work_order_summary',
                          'approval',
                          'scanner_report',
                          'recommendation',
                          'service_record'
                        )),

  title                 text not null,
  summary               text,

  -- File metadata (NULL until Phase 20C)
  file_url              text,
  storage_path          text,
  original_filename     text,
  file_size_bytes       integer check (file_size_bytes is null or file_size_bytes >= 0),
  mime_type             text,

  -- Visibility and audit trail
  customer_visible      boolean not null default false,
  uploaded_by           uuid references public.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.customer_documents is
  'Stores metadata for customer-facing documents (invoices, approvals, reports, etc.). customer_visible=false by default; admin must explicitly grant visibility. Security: RLS protects rows, not columns. summary field is safe for customer display. Internal admin notes deferred to separate admin-only table (customer_document_internal_notes) if needed later.';
comment on column public.customer_documents.customer_id is
  'Reference to customers. One document linked to one customer. Cascades on delete.';
comment on column public.customer_documents.vehicle_id is
  'Optional reference to vehicles. Helps organize documents by vehicle.';
comment on column public.customer_documents.booking_id is
  'Optional reference to bookings. Tracks document origin if from booking.';
comment on column public.customer_documents.work_order_id is
  'Optional reference to work_orders. Tracks document origin if from work order.';
comment on column public.customer_documents.document_type is
  'Classification: diagnostic_report, invoice, work_order_summary, approval, scanner_report, recommendation, service_record.';
comment on column public.customer_documents.title is
  'Display name for the document (e.g., "Invoice #2025-001", "Diagnostic Report").';
comment on column public.customer_documents.summary is
  'Optional brief summary for customer visibility (e.g., "Initial inspection findings"). Safe to display when customer_visible = true.';
comment on column public.customer_documents.file_url is
  'Public or signed URL to the file. NULL until Phase 20C (Storage integration).';
comment on column public.customer_documents.storage_path is
  'Internal storage path (e.g., "customers/uuid/documents/uuid.pdf"). NULL until Phase 20C.';
comment on column public.customer_documents.original_filename is
  'Name of the file at upload time (e.g., "diagnostic.pdf"). Metadata only.';
comment on column public.customer_documents.file_size_bytes is
  'File size in bytes. Used for quota tracking in Phase 20C. Constraint: must be NULL or >= 0.';
comment on column public.customer_documents.mime_type is
  'MIME type (e.g., "application/pdf"). Used for validation in Phase 20C.';
comment on column public.customer_documents.customer_visible is
  'false=internal only (admin sees only). true=visible in customer portal. Default false.';
comment on column public.customer_documents.uploaded_by is
  'Reference to staff user who created the document (audit trail).';

-- ===========================================================================
-- 2) Indexes for fast queries and RLS filtering
-- ===========================================================================
create index if not exists idx_cd_customer_id
  on public.customer_documents (customer_id);

create index if not exists idx_cd_vehicle_id
  on public.customer_documents (vehicle_id);

create index if not exists idx_cd_booking_id
  on public.customer_documents (booking_id);

create index if not exists idx_cd_work_order_id
  on public.customer_documents (work_order_id);

create index if not exists idx_cd_document_type
  on public.customer_documents (document_type);

-- Partial index: only visible documents (customer query optimization)
create index if not exists idx_cd_customer_visible
  on public.customer_documents (customer_visible) where customer_visible = true;

-- Partial index: recent visible documents
create index if not exists idx_cd_created_at_desc
  on public.customer_documents (created_at desc);

-- ===========================================================================
-- 3) updated_at trigger (reuses set_updated_at from 001)
-- ===========================================================================
drop trigger if exists trg_customer_documents_updated_at on public.customer_documents;
create trigger trg_customer_documents_updated_at
  before update on public.customer_documents
  for each row execute function set_updated_at();

-- ===========================================================================
-- 4) RLS: Enable and create policies
--    Admin: full access (SELECT/INSERT/UPDATE).
--    Customer: read-only own documents (where customer_visible = true).
--    No DELETE access for customers.
--    No anon access.
-- ===========================================================================
alter table public.customer_documents enable row level security;

-- Admin: SELECT all documents
drop policy if exists admin_select_customer_documents on public.customer_documents;
create policy admin_select_customer_documents on public.customer_documents
  for select to authenticated
  using (public.is_admin());

-- Admin: INSERT new document
drop policy if exists admin_insert_customer_documents on public.customer_documents;
create policy admin_insert_customer_documents on public.customer_documents
  for insert to authenticated
  with check (public.is_admin());

-- Admin: UPDATE document (metadata, visibility, notes)
drop policy if exists admin_update_customer_documents on public.customer_documents;
create policy admin_update_customer_documents on public.customer_documents
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Customer: SELECT own documents (read-only, only if customer_visible = true)
drop policy if exists customer_read_visible_customer_documents on public.customer_documents;
create policy customer_read_visible_customer_documents on public.customer_documents
  for select to authenticated
  using (
    public.is_customer()
    and customer_id = public.current_customer_id()
    and customer_visible = true
  );

-- ===========================================================================
-- 5) Grants
--    Authenticated (staff + customers) can SELECT/INSERT/UPDATE (RLS restricts rows).
--    NO DELETE grant.
--    anon gets nothing on this table.
-- ===========================================================================
grant select, insert, update on public.customer_documents to authenticated;

-- =============================================================================
-- End of 008. Customer documents foundation ready for Phase 20B-1.
-- No existing tables, policies, or grants were modified.
-- File upload, Storage bucket, and customer UI deferred to Phase 20C.
-- =============================================================================
