-- ============================================================================
-- Phase 21-3: End-to-End Integration Tests
-- ============================================================================
-- Verifies:
-- 1. Agent-generated messages in booking_messages
-- 2. Agent run logs in booking_status_logs
-- 3. Message linking to correct bookings
-- 4. Data consistency across tables
-- 5. Message content validation
--
-- Run in Supabase SQL Editor after Phase 21-2 implementation
-- ============================================================================

-- ============================================================================
-- 0) SETUP: Identify test data
-- ============================================================================

select 'Step 0a: Checking for agent-generated messages' as step;

select
  count(*) as total_messages,
  count(case when direction = 'outbound' then 1 end) as outbound_count,
  count(case when channel = 'whatsapp' then 1 end) as whatsapp_count
from public.booking_messages;

select 'Step 0b: Checking for agent run logs' as step;

select
  count(*) as agent_run_logs,
  max(created_at) as last_run
from public.booking_status_logs
where new_status = 'agent_run';

-- ============================================================================
-- 1) MESSAGE LOGGING TESTS
-- ============================================================================

select 'Test 1.1: Outbound WhatsApp messages exist' as test_name;

select
  m.id,
  m.booking_id,
  m.direction,
  m.channel,
  m.created_at,
  case
    when m.direction = 'outbound' and m.channel = 'whatsapp' then 'VALID'
    else 'INVALID'
  end as validation
from public.booking_messages m
where m.direction = 'outbound' and m.channel = 'whatsapp'
limit 10;

-- ============================================================================
select 'Test 1.2: Message content validation (Arabic text)' as test_name;

select
  id,
  booking_id,
  message_text,
  case
    when message_text like '%السلام عليكم%' then 'Arabic greeting ✓'
    when message_text like '%الهاتف%' then 'Phone field ✓'
    when message_text like '%موعد%' then 'Appointment field ✓'
    when message_text like '%السيارة%' then 'Car field ✓'
    else 'Unknown'
  end as content_type
from public.booking_messages
where direction = 'outbound'
limit 10;

-- ============================================================================
select 'Test 1.3: Message timestamp accuracy' as test_name;

select
  id,
  booking_id,
  created_at,
  age(now(), created_at) as message_age,
  case
    when age(now(), created_at) < interval '1 hour' then 'Recent (< 1h) ✓'
    when age(now(), created_at) < interval '1 day' then 'Today ✓'
    else 'Older'
  end as recency
from public.booking_messages
where direction = 'outbound'
order by created_at desc
limit 10;

-- ============================================================================
-- 2) BOOKING LINKING TESTS
-- ============================================================================

select 'Test 2.1: Messages linked to valid bookings' as test_name;

select
  m.id as message_id,
  m.booking_id,
  b.customer_full_name,
  b.status,
  b.phone_number,
  case
    when b.id is not null then 'Booking found ✓'
    else 'Booking missing ✗'
  end as link_status
from public.booking_messages m
left join public.bookings b on b.id = m.booking_id
where m.direction = 'outbound'
limit 10;

-- ============================================================================
select 'Test 2.2: Message-to-booking relationship integrity' as test_name;

with message_counts as (
  select
    booking_id,
    count(*) as message_count
  from public.booking_messages
  where direction = 'outbound'
  group by booking_id
)
select
  b.id,
  b.customer_full_name,
  b.status,
  coalesce(mc.message_count, 0) as messages_sent,
  case
    when b.status in ('missing_data', 'new_request', 'confirmed', 'appointment_suggested')
      and coalesce(mc.message_count, 0) > 0
      then 'Correct flow ✓'
    when b.status in ('converted_to_work_order', 'cancelled', 'no_show')
      and coalesce(mc.message_count, 0) = 0
      then 'Correct (no messages) ✓'
    else 'Unexpected'
  end as flow_status
from public.bookings b
left join message_counts mc on mc.booking_id = b.id
where coalesce(mc.message_count, 0) > 0 or b.status in ('missing_data', 'new_request')
limit 10;

-- ============================================================================
-- 3) AGENT RUN TRACKING TESTS
-- ============================================================================

select 'Test 3.1: Agent run logs exist' as test_name;

select
  id,
  new_status,
  note,
  changed_by,
  created_at
from public.booking_status_logs
where new_status = 'agent_run'
order by created_at desc
limit 10;

-- ============================================================================
select 'Test 3.2: Agent run log content' as test_name;

select
  id,
  note,
  case
    when note like '%Booking Supervisor Agent%' then 'Agent run ✓'
    else 'Other'
  end as log_type,
  case
    when note like '%analyzed%' then 'Has analysis metric ✓'
    else 'Missing metric'
  end as has_metrics,
  created_at
from public.booking_status_logs
where new_status = 'agent_run'
order by created_at desc
limit 10;

-- ============================================================================
select 'Test 3.3: Frequency of agent runs' as test_name;

select
  date_trunc('hour', created_at) as hour,
  count(*) as run_count,
  max(created_at) as last_run_this_hour
from public.booking_status_logs
where new_status = 'agent_run'
group by date_trunc('hour', created_at)
order by hour desc
limit 24;

-- ============================================================================
-- 4) MESSAGE RULE VALIDATION TESTS
-- ============================================================================

select 'Test 4.1: Messages sent for missing data' as test_name;

with missing_data_messages as (
  select
    m.booking_id,
    b.phone_number,
    b.car_make,
    m.message_text
  from public.booking_messages m
  join public.bookings b on b.id = m.booking_id
  where b.status = 'missing_data' and m.direction = 'outbound'
)
select
  booking_id,
  phone_number,
  car_make,
  case
    when phone_number is null then 'Phone missing (rule triggered) ✓'
    when car_make is null then 'Car missing (rule triggered) ✓'
    else 'Unknown reason'
  end as rule_trigger,
  substring(message_text, 1, 80) as message_preview
from missing_data_messages
limit 10;

-- ============================================================================
select 'Test 4.2: Reminder messages for confirmed bookings' as test_name;

with reminder_messages as (
  select
    m.booking_id,
    b.status,
    b.preferred_date,
    m.message_text
  from public.booking_messages m
  join public.bookings b on b.id = m.booking_id
  where b.status = 'confirmed'
    and m.direction = 'outbound'
    and m.message_text like '%تذكير%'
)
select
  booking_id,
  status,
  preferred_date,
  (preferred_date::date - current_date) as days_until,
  substring(message_text, 1, 50) as message_snippet
from reminder_messages
limit 10;

-- ============================================================================
select 'Test 4.3: Confirmation requests for suggested appointments' as test_name;

with confirmation_messages as (
  select
    m.booking_id,
    b.status,
    m.message_text
  from public.booking_messages m
  join public.bookings b on b.id = m.booking_id
  where b.status = 'appointment_suggested' and m.direction = 'outbound'
)
select
  booking_id,
  status,
  substring(message_text, 1, 100) as message_preview
from confirmation_messages
limit 10;

-- ============================================================================
-- 5) DATA CONSISTENCY TESTS
-- ============================================================================

select 'Test 5.1: No orphan messages (booking_id validation)' as test_name;

select
  count(*) as orphan_count,
  case
    when count(*) = 0 then 'All messages linked ✓'
    else format('Found %s orphan messages ✗', count(*))
  end as validation
from public.booking_messages m
where m.booking_id is not null
  and not exists (
    select 1 from public.bookings b where b.id = m.booking_id
  );

-- ============================================================================
select 'Test 5.2: No duplicate identical messages' as test_name;

with message_groups as (
  select
    booking_id,
    message_text,
    count(*) as count
  from public.booking_messages
  where direction = 'outbound'
  group by booking_id, message_text
  having count(*) > 1
)
select
  count(*) as duplicate_sets,
  case
    when count(*) = 0 then 'No duplicates ✓'
    else format('%s duplicate message sets', count(*))
  end as validation
from message_groups;

-- ============================================================================
select 'Test 5.3: Message distribution by status' as test_name;

select
  b.status,
  count(m.id) as message_count,
  count(distinct m.booking_id) as unique_bookings,
  round(avg(count(m.id)) over (), 2) as avg_messages_per_booking
from public.bookings b
left join public.booking_messages m on m.booking_id = b.id and m.direction = 'outbound'
where b.status not in ('converted_to_work_order', 'cancelled', 'no_show')
group by b.status
order by message_count desc;

-- ============================================================================
-- 6) PERFORMANCE & AUDIT TESTS
-- ============================================================================

select 'Test 6.1: Message creation latency' as test_name;

select
  date_trunc('hour', created_at) as hour,
  count(*) as message_count,
  min(created_at) as first_message,
  max(created_at) as last_message,
  extract(epoch from (max(created_at) - min(created_at))) as duration_seconds
from public.booking_messages
where direction = 'outbound'
group by date_trunc('hour', created_at)
order by hour desc
limit 24;

-- ============================================================================
select 'Test 6.2: Agent activity timeline' as test_name;

select
  date_trunc('hour', created_at) as hour,
  count(*) as run_count,
  max(note) as latest_note
from public.booking_status_logs
where new_status = 'agent_run'
group by date_trunc('hour', created_at)
order by hour desc
limit 24;

-- ============================================================================
-- 7) SUMMARY & RECOMMENDATIONS
-- ============================================================================

select 'INTEGRATION TEST SUMMARY' as section;

select
  'Message Logging' as test_category,
  count(*) as total_messages,
  count(case when direction = 'outbound' then 1 end) as outbound_count,
  count(case when channel = 'whatsapp' then 1 end) as whatsapp_count
from public.booking_messages
union all
select
  'Agent Runs',
  count(*),
  count(*),
  count(*)
from public.booking_status_logs
where new_status = 'agent_run'
union all
select
  'Data Consistency',
  (select count(*) from public.booking_messages where booking_id is null)::int,
  0,
  0;

-- ============================================================================
-- MANUAL TESTING CHECKLIST
-- ============================================================================
--
-- [ ] 1. Run Phase 21-2 agent manually:
--        curl -X POST http://localhost:3000/api/cron/booking-supervisor \
--          -H "Authorization: Bearer $CRON_SECRET"
--
-- [ ] 2. Check messages were logged:
--        SELECT COUNT(*) FROM booking_messages WHERE created_at > NOW() - INTERVAL '5 minutes'
--
-- [ ] 3. Verify agent run was tracked:
--        SELECT * FROM booking_status_logs WHERE new_status = 'agent_run' ORDER BY created_at DESC LIMIT 1
--
-- [ ] 4. Check dashboard loads:
--        http://localhost:3000/admin/agent-activity
--
-- [ ] 5. Verify dashboard displays:
--        - Agent run count
--        - Message count
--        - Recent messages table
--        - Auto-refresh working
--
-- [ ] 6. Test specific booking message flow:
--        1. Create missing-data booking
--        2. Trigger agent
--        3. Verify message logged
--        4. Update booking to confirmed
--        5. Trigger agent again
--        6. Verify reminder message
--
-- [ ] 7. Performance check:
--        - Agent runs in < 5 seconds
--        - Database queries complete < 1 second
--        - Dashboard loads < 2 seconds
--
-- ============================================================================
-- END OF TESTS
-- ============================================================================
