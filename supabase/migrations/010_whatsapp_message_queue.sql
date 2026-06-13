-- ============================================================================
-- Phase 22-1: WhatsApp Message Queue Table
-- ============================================================================
-- Stores queued WhatsApp messages for tracking and audit trail
-- ============================================================================

create table if not exists public.whatsapp_message_queue (
  id                 text primary key,
  booking_id         uuid not null references public.bookings(id) on delete cascade,
  phone_number       text not null,
  message_text       text not null,
  status             text not null
                     check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  wa_link            text,
  qr_code_url        text,
  queued_at          timestamptz not null default now(),
  sent_at            timestamptz,
  delivered_at       timestamptz,
  read_at            timestamptz,
  failed_reason      text,
  created_at         timestamptz not null default now()
);

comment on table public.whatsapp_message_queue is 'Queue of WhatsApp messages to be sent (mock service, no real API)';
comment on column public.whatsapp_message_queue.status is 'Message status: queued (waiting to send), sent (sent via wa.me), delivered, read, failed';
comment on column public.whatsapp_message_queue.wa_link is 'WhatsApp.me link for manual sending';
comment on column public.whatsapp_message_queue.qr_code_url is 'QR code URL for scanning';

-- Index for quick lookups
create index idx_whatsapp_queue_booking_id on public.whatsapp_message_queue(booking_id);
create index idx_whatsapp_queue_status on public.whatsapp_message_queue(status);
create index idx_whatsapp_queue_created_at on public.whatsapp_message_queue(created_at desc);

-- Link to booking_messages for audit
-- (booking_messages.whatsapp_message_id references this table's id)
alter table if exists public.booking_messages
add column if not exists whatsapp_message_id text references public.whatsapp_message_queue(id) on delete set null;

alter table if exists public.booking_messages
add column if not exists whatsapp_status text
check (whatsapp_status in ('queued', 'sent', 'delivered', 'read', 'failed', null));

alter table if exists public.booking_messages
add column if not exists whatsapp_status_updated_at timestamptz;

-- RLS: No access by default (admin only via API)
alter table public.whatsapp_message_queue enable row level security;

-- Policy: Only authenticated users can read
create policy "authenticated_read_whatsapp_queue"
on public.whatsapp_message_queue
for select
to authenticated
using (true);

-- Policy: Only service role can insert/update (via server-side API)
-- This prevents direct client access - only via secure API endpoints

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
