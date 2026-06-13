-- ============================================================================
-- Phase 22-3 Manual Testing: Test Data Setup
-- ============================================================================
-- Run these SQL queries in Supabase SQL Editor to set up test data
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Test Booking #1 (Complete Data)
-- ============================================================================
-- This booking has all required data for message queueing

INSERT INTO public.bookings (
  customer_full_name,
  phone_number,
  car_make,
  car_model,
  car_year,
  problem_description,
  is_drivable,
  has_check_engine_light,
  preferred_date,
  preferred_time,
  status,
  priority,
  created_at,
  updated_at
) VALUES (
  'محمد علي الدرعاوي',
  '+966501234567',
  'تويوتا',
  'كامري',
  2022,
  'المحرك لا يستجيب عند التشغيل',
  false,
  true,
  now() + interval '2 days',
  '10:00',
  'new_request',
  'normal',
  now(),
  now()
) RETURNING
  id as booking_id,
  customer_full_name,
  phone_number,
  status;

-- Copy the booking_id from results for next steps

-- ============================================================================
-- STEP 2: Create Test Booking #2 (For Agent Testing)
-- ============================================================================
-- This booking will test agent integration

INSERT INTO public.bookings (
  customer_full_name,
  phone_number,
  car_make,
  car_model,
  problem_description,
  status,
  created_at,
  updated_at
) VALUES (
  'فاطمة أحمد محمود',
  '+966502345678',
  'هيونداي',
  'سوناتا',
  'فحص شامل وصيانة دورية',
  'new_request',
  now(),
  now()
) RETURNING
  id as booking_id,
  customer_full_name,
  phone_number,
  status;

-- Copy the booking_id from results

-- ============================================================================
-- STEP 3: Create Test Booking #3 (Without Phone - Edge Case)
-- ============================================================================
-- This booking tests graceful error handling when phone is missing

INSERT INTO public.bookings (
  customer_full_name,
  car_make,
  car_model,
  problem_description,
  status,
  created_at,
  updated_at
) VALUES (
  'علي محمد (بدون رقم)',
  'فورد',
  'فوكس',
  'مشكلة في الفرامل',
  'new_request',
  now(),
  now()
) RETURNING
  id as booking_id,
  customer_full_name,
  phone_number,
  status;

-- Copy the booking_id from results

-- ============================================================================
-- STEP 4: Verify Bookings Created
-- ============================================================================

SELECT
  id,
  customer_full_name,
  phone_number,
  status,
  created_at
FROM public.bookings
WHERE customer_full_name IN ('محمد علي الدرعاوي', 'فاطمة أحمد محمود', 'علي محمد (بدون رقم)')
ORDER BY created_at DESC;

-- ============================================================================
-- NOTES FOR MANUAL TESTING
-- ============================================================================

/*

Copy these IDs to use in the following API tests:

Booking #1 ID: [PASTE_ID_HERE]
Booking #2 ID: [PASTE_ID_HERE]
Booking #3 ID: [PASTE_ID_HERE]

Next Steps:

1. Save the booking IDs
2. Test message queueing with Booking #1
3. Test dashboard display
4. Test status updates
5. Run agent for Booking #2
6. Verify error handling with Booking #3

*/
