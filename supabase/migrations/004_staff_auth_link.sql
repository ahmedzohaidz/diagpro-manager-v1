-- =============================================================================
-- DiagPro Manager V1 — Cash Flow Version
-- 004: Staff auth link (Phase 14A — Auth Foundation)
-- =============================================================================
-- Links public.users (workshop staff) to Supabase Auth accounts and aligns the
-- staff role set with the approved V1 roles. Additive and safe (public.users is
-- empty). This migration does NOT enable RLS, does NOT add RLS policies, and
-- does NOT change the temporary anon grants from 003.
-- =============================================================================

-- 1) Link a staff row to a Supabase Auth account.
--    Roles live in public.users.role (below), NOT in editable user_metadata.
alter table public.users
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

comment on column public.users.auth_user_id is
  'Links this staff row to auth.users.id. App role lives in public.users.role, not in user_metadata.';

-- 2) Align staff roles with the approved V1 set: admin, receptionist, technician.
--    (public.users is empty, so re-defining the check + default is non-destructive.)
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('admin', 'receptionist', 'technician'));
alter table public.users alter column role set default 'receptionist';

-- 3) Helper: the current authenticated user's staff role (NULL if not staff).
--    SECURITY DEFINER so it can read public.users regardless of any future RLS,
--    which also avoids recursive-policy problems later. Read-only.
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where auth_user_id = auth.uid();
$$;

revoke all on function public.current_staff_role() from public;
grant execute on function public.current_staff_role() to authenticated;

-- =============================================================================
-- End of 004. No RLS, no policy, no anon-grant changes here.
-- =============================================================================
