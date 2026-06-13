-- ============================================================================
-- Phase 22-3: WhatsApp Integration — SQL Verification Tests
-- ============================================================================
-- Run these queries to verify complete Phase 22 database setup
-- Usage: paste into Supabase SQL Editor or run via psql
-- ============================================================================

-- ============================================================================
-- TEST 1: TABLE SCHEMA VERIFICATION
-- ============================================================================

-- 1.1 Verify whatsapp_message_queue table exists
SELECT
  table_name,
  table_type,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'whatsapp_message_queue'
LIMIT 1;

-- Expected: Returns 1 row with table_name = 'whatsapp_message_queue'

-- ============================================================================

-- 1.2 Verify all columns in whatsapp_message_queue
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'whatsapp_message_queue'
ORDER BY ordinal_position;

-- Expected columns in order:
-- id (text, NOT NULL)
-- booking_id (uuid, NOT NULL)
-- phone_number (text, NOT NULL)
-- message_text (text, NOT NULL)
-- status (text, NOT NULL, CHECK constraint)
-- wa_link (text, YES)
-- qr_code_url (text, YES)
-- queued_at (timestamptz, NOT NULL, DEFAULT now())
-- sent_at (timestamptz, YES)
-- delivered_at (timestamptz, YES)
-- read_at (timestamptz, YES)
-- failed_reason (text, YES)
-- created_at (timestamptz, NOT NULL, DEFAULT now())

-- ============================================================================

-- 1.3 Verify indexes on whatsapp_message_queue
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'whatsapp_message_queue'
ORDER BY indexname;

-- Expected indexes:
-- idx_whatsapp_queue_booking_id (on booking_id)
-- idx_whatsapp_queue_status (on status)
-- idx_whatsapp_queue_created_at (on created_at DESC)

-- ============================================================================

-- 1.4 Verify booking_messages has WhatsApp tracking columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'booking_messages'
AND column_name LIKE '%whatsapp%'
ORDER BY ordinal_position;

-- Expected columns:
-- whatsapp_message_id (text, nullable, FK to whatsapp_message_queue)
-- whatsapp_status (text, nullable, CHECK constraint)
-- whatsapp_status_updated_at (timestamptz, nullable)

-- ============================================================================

-- 1.5 Verify foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'whatsapp_message_queue';

-- Expected foreign keys:
-- whatsapp_message_queue.booking_id -> bookings.id

-- ============================================================================

-- 1.6 Verify CHECK constraints on status
SELECT
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
AND constraint_name LIKE '%status%'
ORDER BY constraint_name;

-- Expected constraints:
-- whatsapp_message_queue status check: ('queued', 'sent', 'delivered', 'read', 'failed')
-- booking_messages whatsapp_status check: ('queued', 'sent', 'delivered', 'read', 'failed', null)

-- ============================================================================
-- TEST 2: ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- 2.1 Verify RLS is enabled on whatsapp_message_queue
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'whatsapp_message_queue';

-- Expected: rowsecurity = true

-- ============================================================================

-- 2.2 Verify RLS policies
SELECT
  policyname,
  tablename,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'whatsapp_message_queue'
ORDER BY policyname;

-- Expected policies:
-- authenticated_read_whatsapp_queue (SELECT policy for authenticated users)

-- ============================================================================
-- TEST 3: DATA INTEGRITY
-- ============================================================================

-- 3.1 Verify no orphaned messages (booking_id references deleted bookings)
SELECT COUNT(*) as orphaned_messages
FROM public.whatsapp_message_queue wmq
LEFT JOIN public.bookings b ON wmq.booking_id = b.id
WHERE b.id IS NULL;

-- Expected: 0

-- ============================================================================

-- 3.2 Verify all bookings referenced in whatsapp_message_queue exist
SELECT COUNT(*) as invalid_booking_references
FROM public.whatsapp_message_queue wmq
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookings b WHERE b.id = wmq.booking_id
);

-- Expected: 0

-- ============================================================================

-- 3.3 Verify status values are valid
SELECT DISTINCT status
FROM public.whatsapp_message_queue
WHERE status NOT IN ('queued', 'sent', 'delivered', 'read', 'failed');

-- Expected: 0 rows (all statuses valid)

-- ============================================================================

-- 3.4 Verify no future timestamps
SELECT COUNT(*) as invalid_timestamps
FROM public.whatsapp_message_queue
WHERE (queued_at > now()
   OR sent_at > now()
   OR delivered_at > now()
   OR read_at > now()
   OR created_at > now());

-- Expected: 0

-- ============================================================================

-- 3.5 Verify timestamp ordering (queued < sent < delivered < read)
SELECT COUNT(*) as invalid_timestamp_order
FROM public.whatsapp_message_queue
WHERE (queued_at IS NOT NULL AND sent_at IS NOT NULL AND queued_at > sent_at)
   OR (sent_at IS NOT NULL AND delivered_at IS NOT NULL AND sent_at > delivered_at)
   OR (delivered_at IS NOT NULL AND read_at IS NOT NULL AND delivered_at > read_at);

-- Expected: 0

-- ============================================================================

-- 3.6 Verify phone numbers are not empty
SELECT COUNT(*) as empty_phone_numbers
FROM public.whatsapp_message_queue
WHERE phone_number IS NULL OR phone_number = '';

-- Expected: 0

-- ============================================================================

-- 3.7 Verify wa_link format (should start with https://wa.me/)
SELECT COUNT(*) as invalid_wa_links
FROM public.whatsapp_message_queue
WHERE wa_link IS NOT NULL
AND NOT wa_link LIKE 'https://wa.me/%';

-- Expected: 0

-- ============================================================================
-- TEST 4: BOOKING_MESSAGES INTEGRATION
-- ============================================================================

-- 4.1 Verify no orphaned whatsapp_message_ids
SELECT COUNT(*) as orphaned_whatsapp_refs
FROM public.booking_messages bm
WHERE bm.whatsapp_message_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.whatsapp_message_queue wmq
  WHERE wmq.id = bm.whatsapp_message_id
);

-- Expected: 0

-- ============================================================================

-- 4.2 Verify whatsapp_status values are valid
SELECT DISTINCT whatsapp_status
FROM public.booking_messages
WHERE whatsapp_status IS NOT NULL
AND whatsapp_status NOT IN ('queued', 'sent', 'delivered', 'read', 'failed');

-- Expected: 0 rows

-- ============================================================================

-- 4.3 Count messages linked to whatsapp_message_queue
SELECT
  COUNT(*) as total_booking_messages,
  COUNT(CASE WHEN whatsapp_message_id IS NOT NULL THEN 1 END) as whatsapp_linked,
  COUNT(CASE WHEN whatsapp_message_id IS NULL THEN 1 END) as not_linked
FROM public.booking_messages;

-- Expected: whatsapp_linked > 0 (at least some messages linked)

-- ============================================================================
-- TEST 5: STATISTICS & METRICS
-- ============================================================================

-- 5.1 Message count by status
SELECT
  status,
  COUNT(*) as count
FROM public.whatsapp_message_queue
GROUP BY status
ORDER BY count DESC;

-- Expected: Distribution across statuses

-- ============================================================================

-- 5.2 Messages per booking
SELECT
  booking_id,
  COUNT(*) as message_count,
  COUNT(DISTINCT status) as distinct_statuses,
  MAX(created_at) as latest_message
FROM public.whatsapp_message_queue
GROUP BY booking_id
ORDER BY message_count DESC
LIMIT 10;

-- Expected: Shows booking distribution

-- ============================================================================

-- 5.3 Message timeline (created vs sent vs delivered)
SELECT
  COUNT(*) as total_messages,
  COUNT(CASE WHEN sent_at IS NOT NULL THEN 1 END) as sent_count,
  COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered_count,
  COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_count,
  COUNT(CASE WHEN failed_reason IS NOT NULL THEN 1 END) as failed_count,
  AVG(EXTRACT(EPOCH FROM (sent_at - queued_at))) as avg_queue_to_send_seconds,
  AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_send_to_delivery_seconds
FROM public.whatsapp_message_queue;

-- Expected: Shows timing statistics

-- ============================================================================

-- 5.4 Latest messages
SELECT
  id,
  booking_id,
  phone_number,
  status,
  created_at,
  message_text
FROM public.whatsapp_message_queue
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Recent messages with details

-- ============================================================================
-- TEST 6: AGENT INTEGRATION VERIFICATION
-- ============================================================================

-- 6.1 Count agent runs
SELECT
  COUNT(*) as total_runs,
  MAX(created_at) as latest_run
FROM public.booking_status_logs
WHERE new_status = 'agent_run';

-- Expected: Shows agent run history

-- ============================================================================

-- 6.2 Verify agent run notes contain message counts
SELECT
  note,
  created_at
FROM public.booking_status_logs
WHERE new_status = 'agent_run'
ORDER BY created_at DESC
LIMIT 5;

-- Expected: Notes like "...queued X WhatsApp messages"

-- ============================================================================

-- 6.3 Verify whatsapp messages match booking_messages agent messages
WITH agent_messages AS (
  SELECT COUNT(*) as count
  FROM public.booking_messages
  WHERE direction = 'outbound'
  AND whatsapp_message_id IS NOT NULL
)
SELECT
  (SELECT COUNT(*) FROM public.whatsapp_message_queue) as whatsapp_queue_count,
  (SELECT count FROM agent_messages) as booking_messages_whatsapp_count,
  CASE
    WHEN (SELECT COUNT(*) FROM public.whatsapp_message_queue) =
         (SELECT count FROM agent_messages)
    THEN 'MATCH'
    ELSE 'MISMATCH'
  END as status;

-- Expected: status = 'MATCH' (queued messages match logged messages)

-- ============================================================================
-- TEST 7: CLEANUP & SUMMARY
-- ============================================================================

-- 7.1 Summary: Phase 22 Status
SELECT
  'whatsapp_message_queue' as component,
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record,
  COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
FROM public.whatsapp_message_queue
UNION ALL
SELECT
  'booking_messages (whatsapp linked)',
  COUNT(*),
  MIN(created_at),
  MAX(created_at),
  NULL, NULL, NULL
FROM public.booking_messages
WHERE whatsapp_message_id IS NOT NULL;

-- Expected: Shows summary of both tables

-- ============================================================================
-- NOTES FOR TEST EXECUTION
-- ============================================================================

/*

To run these tests:

1. Copy each numbered test section into Supabase SQL Editor
2. Execute and compare results to "Expected" comment
3. All tests should pass with expected results
4. Fix any discrepancies before proceeding

Key assertions:
✓ All tables and columns exist
✓ All indexes created
✓ RLS policies enforced
✓ No orphaned data
✓ Timestamp ordering valid
✓ Status values valid
✓ Phone numbers populated
✓ wa_link format correct
✓ booking_messages integration working
✓ Agent logging working

If any test fails, check:
- Migration 010_whatsapp_message_queue.sql was applied
- All ALTER TABLE statements executed
- RLS policies created
- Indexes built

Next Steps:
→ Phase 22-3 testing guide (PHASE_23_TEST_GUIDE.md)
→ Manual testing of admin dashboard
→ End-to-end integration testing

*/

-- ============================================================================
-- END OF VERIFICATION TESTS
-- ============================================================================
