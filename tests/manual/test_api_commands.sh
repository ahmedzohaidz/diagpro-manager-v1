#!/bin/bash

# ============================================================================
# Phase 22-3: Manual Testing - API Commands
# ============================================================================
# Copy and paste these commands to test Phase 22 features
# Replace [BOOKING_ID] with actual IDs from test data setup
# ============================================================================

echo ""
echo "============================================================"
echo "Phase 22-3: WhatsApp Integration Manual Testing"
echo "============================================================"
echo ""
echo "Prerequisites:"
echo "  1. Dev server running on http://localhost:3005"
echo "  2. Test bookings created (run test_booking_setup.sql)"
echo "  3. Copy booking IDs from SQL results"
echo ""
echo "============================================================"
echo ""

# ============================================================================
# TEST 1: VERIFY ADMIN DASHBOARD
# ============================================================================

echo "TEST 1: Admin Dashboard"
echo "------------------------"
echo ""
echo "Navigate to: http://localhost:3005/admin/messages"
echo ""
echo "Verify:"
echo "  ✓ Page loads with 'رسائل الـ WhatsApp' header"
echo "  ✓ RTL layout (dir='rtl')"
echo "  ✓ 5 statistics cards visible"
echo "  ✓ Message says 'لا توجد رسائل معلقة' (no messages yet)"
echo ""
echo "Status: _____ (Run this first, then continue)"
echo ""
echo ""

# ============================================================================
# TEST 2: QUEUE FIRST MESSAGE
# ============================================================================

echo "TEST 2: Queue Message via API"
echo "------------------------------"
echo ""
echo "Replace BOOKING_ID_1 with your first booking ID"
echo ""
echo "Command:"
echo ""
cat << 'CURL_CMD'
curl -X POST "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID_1",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكراً على حجزك معنا. تم تسجيل حجزك بنجاح. سنتصل بك قريباً لتأكيد الموعد."
  }'
CURL_CMD

echo ""
echo "Expected Response:"
echo ""
cat << 'EXPECTED'
{
  "status": "success",
  "message": "تم إضافة الرسالة إلى الطابور",
  "message_data": {
    "id": "msg_xxxxx",
    "booking_id": "BOOKING_ID_1",
    "phone_number": "+966501234567",
    "status": "queued",
    "wa_link": "https://wa.me/966501234567?text=..."
  }
}
EXPECTED

echo ""
echo "Copy message_id from response: ________________"
echo ""
echo ""

# ============================================================================
# TEST 3: CHECK ADMIN DASHBOARD
# ============================================================================

echo "TEST 3: Dashboard Shows Message"
echo "-------------------------------"
echo ""
echo "Refresh: http://localhost:3005/admin/messages"
echo ""
echo "Verify:"
echo "  ✓ Stats 'قيد الانتظار' (queued) = 1"
echo "  ✓ Message appears in list"
echo "  ✓ Phone: +966501234567"
echo "  ✓ Status badge: 'قيد الانتظار' (yellow)"
echo "  ✓ 4 buttons: Link, QR, Manual, Open WhatsApp"
echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 4: TEST WA.ME LINK
# ============================================================================

echo "TEST 4: wa.me Link & QR Code"
echo "----------------------------"
echo ""
echo "On Dashboard:"
echo "  1. Click 'نسخ الرابط' button"
echo "     Expected: Link copied to clipboard"
echo ""
echo "  2. Click 'QR Code' button"
echo "     Expected: Modal shows QR code"
echo "     Text: 'امسح هذا الـ QR لفتح الرسالة في WhatsApp'"
echo ""
echo "  3. Click 'فتح في WhatsApp'"
echo "     Expected: WhatsApp opens with message pre-filled"
echo "     To: +966501234567"
echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 5: MARK AS SENT & AUTO-DELIVERY
# ============================================================================

echo "TEST 5: Message Status Update"
echo "-----------------------------"
echo ""
echo "Replace MSG_ID with message_id from TEST 2"
echo ""
echo "Command:"
echo ""
cat << 'CURL_CMD2'
curl -X POST "http://localhost:3005/api/admin/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"message_id": "MSG_ID"}'
CURL_CMD2

echo ""
echo "Expected Response:"
echo ""
cat << 'EXPECTED2'
{
  "status": "success",
  "message": "تم إرسال الرسالة",
  "message_data": {
    "id": "msg_xxxxx",
    "status": "sent",
    "sent_at": "2026-06-13T..."
  }
}
EXPECTED2

echo ""
echo "Verify Timeline:"
echo ""
echo "  Immediately:"
echo "    ✓ Status badge → 'مرسلة' (blue)"
echo "    ✓ Stats: queued = 0, sent = 1"
echo ""
echo "  After 3 seconds:"
echo "    ✓ Status badge → 'تم التسليم' (green)"
echo "    ✓ Stats: sent = 0, delivered = 1"
echo "    ✓ Dashboard auto-refreshes (polls every 5s)"
echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 6: FETCH MESSAGES VIA API
# ============================================================================

echo "TEST 6: Fetch Messages API"
echo "-------------------------"
echo ""
echo "Command:"
echo ""
cat << 'CURL_CMD3'
curl -X GET "http://localhost:3005/api/admin/messages/queue" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
CURL_CMD3

echo ""
echo "Note: You may need to log in first for auth token"
echo ""
echo "Expected Response:"
echo ""
cat << 'EXPECTED3'
{
  "status": "success",
  "messages": [
    {
      "id": "msg_xxxxx",
      "booking_id": "BOOKING_ID_1",
      "phone_number": "+966501234567",
      "status": "delivered",
      "wa_link": "https://wa.me/..."
    }
  ],
  "stats": {
    "total": 1,
    "queued": 0,
    "sent": 0,
    "delivered": 1,
    "read": 0,
    "failed": 0
  }
}
EXPECTED3

echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 7: AGENT INTEGRATION
# ============================================================================

echo "TEST 7: Booking Supervisor Agent"
echo "-------------------------------"
echo ""
echo "Replace CRON_SECRET with value from .env"
echo "Replace BOOKING_ID_2 with second booking ID"
echo ""
echo "Command:"
echo ""
cat << 'CURL_CMD4'
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: YOUR_CRON_SECRET" \
  -d '{}'
CURL_CMD4

echo ""
echo "Expected Response:"
echo ""
cat << 'EXPECTED4'
{
  "status": "success",
  "timestamp": "2026-06-13T...",
  "bookings_analyzed": 2,
  "actions_identified": 1,
  "messages_logged": 1,
  "actions": [
    {
      "booking_id": "BOOKING_ID_2",
      "action_type": "send_confirmation",
      "reason": "تأكيد استقبال الحجز",
      "message_text": "...",
      "message_channel": "whatsapp"
    }
  ]
}
EXPECTED4

echo ""
echo "Verify:"
echo "  ✓ Agent analyzes bookings"
echo "  ✓ Detects actions (missing data, reminders, confirmations)"
echo "  ✓ Queues messages for each action"
echo "  ✓ Returns metrics"
echo ""
echo "Check Dashboard:"
echo "  ✓ New messages appear from agent run"
echo "  ✓ Status 'قيد الانتظار' (queued)"
echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 8: DATABASE VERIFICATION
# ============================================================================

echo "TEST 8: Database Audit Trail"
echo "----------------------------"
echo ""
echo "In Supabase SQL Editor, run:"
echo ""
cat << 'SQL_CMD'
-- Check whatsapp_message_queue
SELECT id, booking_id, phone_number, status, created_at
FROM public.whatsapp_message_queue
ORDER BY created_at DESC LIMIT 5;

-- Check booking_messages linking
SELECT id, booking_id, whatsapp_message_id, whatsapp_status
FROM public.booking_messages
WHERE whatsapp_message_id IS NOT NULL
ORDER BY created_at DESC LIMIT 5;

-- Check agent logs
SELECT note FROM public.booking_status_logs
WHERE new_status = 'agent_run'
ORDER BY created_at DESC LIMIT 1;
SQL_CMD

echo ""
echo "Verify:"
echo "  ✓ whatsapp_message_queue has 2+ rows"
echo "  ✓ booking_messages.whatsapp_message_id populated"
echo "  ✓ Agent run logged with message counts"
echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 9: EDGE CASE - NO PHONE NUMBER
# ============================================================================

echo "TEST 9: Edge Case - Missing Phone"
echo "--------------------------------"
echo ""
echo "Setup: Created Booking #3 without phone number"
echo ""
echo "Run Agent:"
echo ""
cat << 'CURL_CMD5'
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "X-CRON-SECRET: YOUR_CRON_SECRET" \
  -d '{}'
CURL_CMD5

echo ""
echo "Expected:"
echo "  ✓ Agent skips booking without phone"
echo "  ✓ Error logged: 'has no phone number'"
echo "  ✓ No message queued for Booking #3"
echo "  ✓ messages_logged count unchanged"
echo ""
echo "Status: _____"
echo ""
echo ""

# ============================================================================
# TEST 10: PERFORMANCE
# ============================================================================

echo "TEST 10: Performance Benchmarks"
echo "------------------------------"
echo ""
echo "Measure response times:"
echo ""
echo "1. Agent execution:"
echo "   time curl -X POST http://localhost:3005/api/cron/booking-supervisor ..."
echo "   Expected: < 5 seconds"
echo ""
echo "2. API response:"
echo "   time curl -X GET http://localhost:3005/api/admin/messages/queue ..."
echo "   Expected: < 500ms"
echo ""
echo "3. Dashboard load:"
echo "   Navigate to http://localhost:3005/admin/messages"
echo "   Expected: < 2 seconds"
echo ""
echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo "============================================================"
echo "TESTING SUMMARY"
echo "============================================================"
echo ""
echo "Test Results:"
echo "  TEST 1 - Dashboard:           _____"
echo "  TEST 2 - Queue Message:       _____"
echo "  TEST 3 - Display:             _____"
echo "  TEST 4 - Links & QR:          _____"
echo "  TEST 5 - Status Updates:      _____"
echo "  TEST 6 - API Fetch:           _____"
echo "  TEST 7 - Agent Integration:   _____"
echo "  TEST 8 - Database:            _____"
echo "  TEST 9 - Edge Cases:          _____"
echo "  TEST 10 - Performance:        _____"
echo ""
echo "Overall Status: _____"
echo ""
echo "Notes:"
echo "_________________________________________________________________"
echo ""
echo ""
echo "============================================================"
echo "NEXT STEPS"
echo "============================================================"
echo ""
echo "If all tests pass:"
echo "  1. Push Phase 22 to GitHub"
echo "  2. Create PR for code review"
echo "  3. Begin Phase 23 planning"
echo ""
echo "If tests fail:"
echo "  1. Check error messages"
echo "  2. Verify Supabase connection"
echo "  3. Check dev server logs"
echo "  4. Review PHASE_23_TEST_GUIDE.md troubleshooting"
echo ""
