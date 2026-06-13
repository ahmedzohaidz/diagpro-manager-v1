-- ============================================================================
-- Phase 21: Booking Supervisor Agent Tests
-- ============================================================================
-- Verifies:
-- 1. Agent can analyze bookings
-- 2. Missing data detection works
-- 3. Urgency scoring is correct
-- 4. Message logging functionality
--
-- Run in Supabase SQL Editor after Phase 21 implementation
-- ============================================================================

-- ============================================================================
-- 0) SETUP: Create test bookings
-- ============================================================================

select 'Step 0a: Creating test customer' as step;

with test_customer as (
  select id from public.customers limit 1
)
select (select id from test_customer) as customer_id;

select 'Step 0b: Creating test bookings' as step;

-- Insert test bookings with various statuses and data completeness
insert into public.bookings (
  customer_id,
  status,
  priority,
  customer_full_name,
  phone_number,
  car_make,
  car_model,
  car_year,
  problem_description,
  is_drivable,
  has_check_engine_light,
  preferred_date,
  preferred_time
)
select
  c.id as customer_id,
  'new_request'::text as status,
  'high'::text as priority,
  'Test Customer High Priority' as customer_full_name,
  '0123456789' as phone_number,
  'Toyota' as car_make,
  'Camry' as car_model,
  '2020' as car_year,
  'Engine noise' as problem_description,
  false as is_drivable,
  true as has_check_engine_light,
  (current_date + interval '2 days')::text as preferred_date,
  '10:00' as preferred_time
from public.customers c
limit 1
returning id, status, priority, customer_full_name as booking_1;

select 'Test booking 1 created (high priority, complete data)' as note;

-- Test booking 2: Missing phone number
insert into public.bookings (
  customer_id,
  status,
  priority,
  customer_full_name,
  car_make,
  car_model,
  car_year,
  problem_description,
  is_drivable,
  has_check_engine_light,
  preferred_date,
  preferred_time
)
select
  c.id as customer_id,
  'missing_data'::text as status,
  'normal'::text as priority,
  'Missing Phone Customer' as customer_full_name,
  'Honda' as car_make,
  'Civic' as car_model,
  '2019' as car_year,
  'Brake issues' as problem_description,
  true as is_drivable,
  false as has_check_engine_light,
  (current_date + interval '3 days')::text as preferred_date,
  '14:00' as preferred_time
from public.customers c
limit 1
returning id, status, customer_full_name as booking_2;

select 'Test booking 2 created (missing phone)' as note;

-- Test booking 3: Confirmed, needs reminder
insert into public.bookings (
  customer_id,
  status,
  priority,
  customer_full_name,
  phone_number,
  car_make,
  car_model,
  car_year,
  problem_description,
  is_drivable,
  has_check_engine_light,
  preferred_date,
  preferred_time
)
select
  c.id as customer_id,
  'confirmed'::text as status,
  'normal'::text as priority,
  'Confirmed Soon Customer' as customer_full_name,
  '0187654321' as phone_number,
  'BMW' as car_make,
  'X5' as car_model,
  '2021' as car_year,
  'AC repair' as problem_description,
  true as is_drivable,
  false as has_check_engine_light,
  (current_date + interval '18 hours')::text as preferred_date,
  '09:00' as preferred_time
from public.customers c
limit 1
returning id, status, preferred_date, customer_full_name as booking_3;

select 'Test booking 3 created (confirmed, booking tomorrow)' as note;

-- Test booking 4: Appointment suggested
insert into public.bookings (
  customer_id,
  status,
  priority,
  customer_full_name,
  phone_number,
  car_make,
  car_model,
  car_year,
  problem_description,
  is_drivable,
  has_check_engine_light,
  preferred_date,
  preferred_time
)
select
  c.id as customer_id,
  'appointment_suggested'::text as status,
  'normal'::text as priority,
  'Suggested Appointment Customer' as customer_full_name,
  '0145678901' as phone_number,
  'Mercedes' as car_make,
  'C-Class' as car_model,
  '2020' as car_year,
  'Service needed' as problem_description,
  true as is_drivable,
  false as has_check_engine_light,
  (current_date + interval '5 days')::text as preferred_date,
  '15:00' as preferred_time
from public.customers c
limit 1
returning id, status, customer_full_name as booking_4;

select 'Test booking 4 created (appointment_suggested)' as note;

-- ============================================================================
-- 1) DATA INTEGRITY TESTS
-- ============================================================================

select 'Test 1.1: All test bookings created' as test_name;

select
  count(*) as total_bookings,
  count(case when status = 'new_request' then 1 end) as new_requests,
  count(case when status = 'missing_data' then 1 end) as missing_data,
  count(case when status = 'confirmed' then 1 end) as confirmed,
  count(case when status = 'appointment_suggested' then 1 end) as appointment_suggested
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%';

-- ============================================================================
-- 2) MISSING DATA DETECTION TESTS
-- ============================================================================

select 'Test 2.1: Detect bookings with missing phone' as test_name;

select
  id,
  customer_full_name,
  phone_number,
  status,
  case
    when phone_number is null or phone_number = '' then 'MISSING'
    else 'OK'
  end as phone_status
from public.bookings
where status = 'missing_data'
  and (phone_number is null or phone_number = '')
limit 5;

select 'Test 2.2: Detect bookings with incomplete car data' as test_name;

select
  id,
  customer_full_name,
  car_make,
  car_model,
  car_year,
  case
    when car_make is null or car_make = '' then 'MISSING_MAKE'
    when car_model is null or car_model = '' then 'MISSING_MODEL'
    when car_year is null or car_year = '' then 'MISSING_YEAR'
    else 'OK'
  end as car_data_status
from public.bookings
where (car_make is null or car_make = '')
  or (car_model is null or car_model = '')
  or (car_year is null or car_year = '')
limit 5;

select 'Test 2.3: Detect bookings with missing problem description' as test_name;

select
  id,
  customer_full_name,
  problem_description,
  status,
  case
    when problem_description is null or problem_description = '' then 'MISSING'
    else 'OK'
  end as description_status
from public.bookings
where problem_description is null or problem_description = ''
limit 5;

-- ============================================================================
-- 3) URGENCY SCORING LOGIC
-- ============================================================================

select 'Test 3.1: High priority bookings (scoring basis)' as test_name;

select
  id,
  customer_full_name,
  status,
  priority,
  is_drivable,
  has_check_engine_light,
  case
    when priority = 'high' then 30
    when priority = 'urgent' then 50
    else 0
  end as priority_score,
  case
    when status = 'new_request' then 20
    when status = 'missing_data' then 15
    when status = 'confirmed' then 10
    when status = 'arrived' then 30
    else 0
  end as status_score
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%'
order by priority desc;

select 'Test 3.2: Bookings needing attention (status based)' as test_name;

select
  id,
  customer_full_name,
  status,
  priority,
  case
    when status in ('new_request', 'missing_data', 'confirmed', 'arrived')
      then 'NEEDS_ATTENTION'
    when status in ('converted_to_work_order', 'cancelled', 'no_show')
      then 'DONE'
    else 'PENDING'
  end as attention_status
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%'
order by status;

-- ============================================================================
-- 4) MESSAGE LOGGING TESTS
-- ============================================================================

select 'Test 4.1: Log test message to booking_messages' as test_name;

insert into public.booking_messages (
  booking_id,
  direction,
  message_text,
  channel
)
select
  b.id,
  'outbound'::text as direction,
  'Test message: Missing phone number detected. Please provide phone.' as message_text,
  'whatsapp'::text as channel
from public.bookings b
where b.customer_full_name = 'Missing Phone Customer'
limit 1
returning id, booking_id, direction, channel;

select 'Test 4.2: Verify message logged correctly' as test_name;

select
  m.id as message_id,
  m.booking_id,
  m.direction,
  m.channel,
  m.message_text,
  m.created_at,
  case
    when m.direction = 'outbound' and m.channel = 'whatsapp' then 'VALID'
    else 'INVALID'
  end as validation
from public.booking_messages m
where m.message_text like 'Test message%'
limit 5;

select 'Test 4.3: Message history for a booking' as test_name;

select
  m.id,
  m.booking_id,
  m.direction,
  m.message_text,
  m.created_at,
  lag(m.created_at) over (partition by m.booking_id order by m.created_at) as previous_message_time
from public.booking_messages m
join public.bookings b on b.id = m.booking_id
where b.customer_full_name = 'Missing Phone Customer'
order by m.created_at;

-- ============================================================================
-- 5) REMINDER ELIGIBILITY TESTS
-- ============================================================================

select 'Test 5.1: Bookings eligible for reminder (confirmed, near date)' as test_name;

select
  id,
  customer_full_name,
  status,
  preferred_date,
  preferred_time,
  current_date as today,
  (preferred_date::date - current_date) as days_until_booking,
  case
    when status = 'confirmed'
      and preferred_date is not null
      and (preferred_date::date - current_date) between 0 and 1
      then 'SEND_REMINDER'
    else 'NO_REMINDER'
  end as reminder_action
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%'
order by preferred_date;

select 'Test 5.2: Confirmation requests needed' as test_name;

select
  id,
  customer_full_name,
  status,
  phone_number,
  preferred_date,
  case
    when status = 'appointment_suggested' and phone_number is not null
      then 'SEND_CONFIRMATION_REQUEST'
    else 'NO_ACTION'
  end as action
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%'
order by status;

-- ============================================================================
-- 6) COMPLETE DATA DETECTION TESTS
-- ============================================================================

select 'Test 6.1: Bookings with complete data (ready for confirmation)' as test_name;

select
  id,
  customer_full_name,
  status,
  phone_number,
  car_make,
  car_model,
  car_year,
  problem_description,
  case
    when phone_number is not null and phone_number != ''
      and car_make is not null and car_make != ''
      and car_model is not null and car_model != ''
      and car_year is not null and car_year != ''
      and problem_description is not null and problem_description != ''
      then 'COMPLETE'
    else 'INCOMPLETE'
  end as data_completeness
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%'
order by data_completeness;

-- ============================================================================
-- 7) SUMMARY & VALIDATION
-- ============================================================================

select 'TESTING SUMMARY' as section;

select
  'Test data creation' as test_category,
  count(*) as test_bookings,
  count(case when status = 'new_request' then 1 end) as new_request_count,
  count(case when status = 'missing_data' then 1 end) as missing_data_count,
  count(case when status = 'confirmed' then 1 end) as confirmed_count,
  count(case when status = 'appointment_suggested' then 1 end) as appointment_count
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%';

select
  'Missing data detection' as validation,
  count(case when phone_number is null or phone_number = '' then 1 end) as missing_phone,
  count(case when car_make is null or car_make = '' then 1 end) as missing_car_make,
  count(case when problem_description is null or problem_description = '' then 1 end) as missing_description
from public.bookings
where customer_full_name like '%Test%' or customer_full_name like '%Missing%'
  or customer_full_name like '%Confirmed%' or customer_full_name like '%Suggested%';

select
  'Message logging' as feature,
  count(*) as test_messages_logged,
  count(case when direction = 'outbound' then 1 end) as outbound_messages
from public.booking_messages m
where m.message_text like 'Test message%';

-- ============================================================================
-- MANUAL TESTING CHECKLIST
-- ============================================================================
--
-- After running above SQL, test the agent endpoints:
--
-- [ ] 1. Call POST /api/admin/agent/booking-supervisor/activate
--        Expected: Returns analysis with 4 items needing action
--        Verify: urgency_score, missing_fields, recommendations
--
-- [ ] 2. Call POST /api/admin/agent/booking-supervisor/run-check
--        Parameters: { "dry_run": true }
--        Expected: Returns 4 actions, messages_would_send: 4
--        Verify: action types match (missing_data, send_reminder, etc)
--
-- [ ] 3. Call run-check with auto_send: true
--        Parameters: { "dry_run": false, "auto_send": true }
--        Expected: Messages logged to booking_messages
--        Verify: Check booking_messages table for new outbound messages
--
-- [ ] 4. Test filter_status parameter
--        Parameters: { "filter_status": "confirmed" }
--        Expected: Only confirmed bookings analyzed
--        Verify: results array contains only confirmed bookings
--
-- [ ] 5. Verify message content
--        Expected: Messages in Arabic, WhatsApp-ready format
--        Verify: Check message_text starts with "السلام عليكم"
--
-- ============================================================================
-- END OF TESTS
-- ============================================================================
