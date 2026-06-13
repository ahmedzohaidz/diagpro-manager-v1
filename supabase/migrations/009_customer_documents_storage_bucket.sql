-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 009: Customer Documents Storage Bucket (Phase 20C-2)
-- =============================================================================
-- Adds Supabase Storage bucket for document files with admin-only policies.
-- Phase 20C-2: Storage infrastructure for document upload/storage.
--
-- Design notes:
--   * Bucket: customer-documents (private, not public)
--   * Admin only: upload, delete, select for internal operations
--   * No customer/anonymous access to Storage yet (future Phase 20C-3)
--   * No signed URLs yet (Phase 20C-3)
--   * Cleanup policy: admin can delete for orphan prevention
--
-- Scope safety:
--   * Does NOT modify existing tables or RLS policies.
--   * Does NOT add signed URL generation.
--   * Does NOT expose Storage to customers yet.
--   * Does NOT modify /book, /admin, /customer pages.
--
-- IMPORTANT: This file is a LOCAL migration only. Not applied to live Supabase
-- until review. To apply later: paste into Supabase SQL Editor after 008.
-- =============================================================================

-- ===========================================================================
-- 1) Create bucket: customer-documents (private)
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('customer-documents', 'customer-documents', false)
on conflict (id) do nothing;

-- ===========================================================================
-- 2) Storage policies: Admin-only access for upload/delete/select
-- ===========================================================================

-- Admin: Can upload (insert) files
drop policy if exists "admin_upload_customer_documents" on storage.objects;
create policy "admin_upload_customer_documents" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'customer-documents'
  and public.is_admin()
);

-- Admin: Can delete files (for orphan cleanup)
drop policy if exists "admin_delete_customer_documents" on storage.objects;
create policy "admin_delete_customer_documents" on storage.objects
for delete to authenticated
using (
  bucket_id = 'customer-documents'
  and public.is_admin()
);

-- Admin: Can select/list objects (for internal operations)
drop policy if exists "admin_select_customer_documents" on storage.objects;
create policy "admin_select_customer_documents" on storage.objects
for select to authenticated
using (
  bucket_id = 'customer-documents'
  and public.is_admin()
);

-- ===========================================================================
-- 3) Default deny: No access for anonymous users
--    (Database RLS prevents unauthorized queries, Storage policies block direct access)
-- ===========================================================================
-- Note: Anonymous users have no policies, so they are denied by default.
-- Customers have no policies yet (added in Phase 20C-3 with signed URLs).

-- =============================================================================
-- End of 009. Customer documents storage bucket ready for Phase 20C-2 upload.
-- Next: Phase 20C-3 will add signed URL generation and customer download access.
-- =============================================================================
