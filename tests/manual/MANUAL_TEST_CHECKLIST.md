# Phase 22-3: Manual Testing Checklist

**Status:** Ready to Begin  
**Date:** 2026-06-13  
**Duration:** ~30 minutes

---

## Prerequisites ✓

- [ ] Dev server running: `npm run dev`
- [ ] Supabase connected
- [ ] Migrations applied (010_whatsapp_message_queue.sql)
- [ ] Test bookings created (run test_booking_setup.sql)

**Booking IDs (from SQL results):**
- Booking #1 (Complete): `_________________________________`
- Booking #2 (For Agent): `_________________________________`
- Booking #3 (No Phone): `_________________________________`

---

## Test 1: Admin Dashboard Loads

### Steps
1. Navigate to: `http://localhost:3005/admin/messages`
2. Wait for page to load
3. Verify all elements below

### Verification
- [ ] Page loads without errors
- [ ] Header shows "رسائل الـ WhatsApp"
- [ ] RTL layout present (`dir="rtl"`)
- [ ] 5 statistics cards visible:
  - [ ] قيد الانتظار (Queued) - yellow
  - [ ] مرسلة (Sent) - blue
  - [ ] تم التسليم (Delivered) - green
  - [ ] مقروءة (Read) - purple
  - [ ] فشل (Failed) - red
- [ ] Message says "لا توجد رسائل معلقة" (no messages)
- [ ] Refresh button visible
- [ ] Info box at bottom shows usage instructions

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 2: Queue First Message

### Setup
Use Booking #1 ID: `_______________________________`

### Command
```bash
curl -X POST "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID_1",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكراً على حجزك معنا. تم تسجيل حجزك بنجاح. سنتصل بك قريباً لتأكيد الموعد."
  }'
```

### Verification
- [ ] API returns HTTP 200
- [ ] Response status: `"success"`
- [ ] `message_id` returned in response: `_______________________`
- [ ] `message_text` matches input
- [ ] `status` = `"queued"`
- [ ] `wa_link` format: `https://wa.me/966501234567?text=...`
- [ ] `booking_id` matches input

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Message ID (save for Test 5):** `_______________________________`

**Notes:** ________________________________________________________________

---

## Test 3: Dashboard Shows Message

### Steps
1. Refresh dashboard: `http://localhost:3005/admin/messages`
2. Wait 1-2 seconds for auto-refresh
3. Verify message appears

### Verification
- [ ] Stats card "قيد الانتظار": shows **1**
- [ ] Message appears in list
- [ ] Phone number displays: `+966501234567`
- [ ] Booking ID displays: `BOOKING_ID_1`
- [ ] Message preview shows text (first 100 chars)
- [ ] Status badge shows "قيد الانتظار" (yellow)
- [ ] Message has 4 buttons:
  - [ ] نسخ الرابط (Copy Link)
  - [ ] QR Code
  - [ ] إرسال يدويًا (Manual Send)
  - [ ] فتح في WhatsApp (Open in WhatsApp)
- [ ] Timestamp shows recent time

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 4: wa.me Link & QR Code

### Test 4A: Copy Link
1. Click "نسخ الرابط" button
2. Check clipboard

**Verification:**
- [ ] Alert shows "تم نسخ الرابط"
- [ ] Link format: `https://wa.me/966501234567?text=...`
- [ ] Contains Arabic message (URL-encoded)
- [ ] Link is clickable

### Test 4B: QR Code
1. Click "QR Code" button
2. Verify modal

**Verification:**
- [ ] Modal appears with title "QR Code"
- [ ] QR code image displays (black & white)
- [ ] Arabic text: "امسح هذا الـ QR لفتح الرسالة في WhatsApp"
- [ ] Phone number shown: `+966501234567`
- [ ] Close button works
- [ ] QR code is scannable (test with phone if available)

### Test 4C: Open WhatsApp Link
1. Click "فتح في WhatsApp" button OR paste wa.me link in browser

**Verification:**
- [ ] New tab/window opens
- [ ] Redirects to WhatsApp
- [ ] Message pre-filled in compose box
- [ ] Recipient: `+966501234567`
- [ ] Message text correct

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 5: Message Status Update

### Setup
Use Message ID from Test 2: `_______________________________`

### Command
```bash
curl -X POST "http://localhost:3005/api/admin/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"message_id": "MSG_ID"}'
```

### Verification - Immediate (0 seconds)
- [ ] API returns HTTP 200
- [ ] Response status: `"success"`
- [ ] `status` = `"sent"`
- [ ] `sent_at` timestamp set

### Verification - Dashboard Immediate
- [ ] Dashboard status badge updates to "مرسلة" (blue)
- [ ] Stats: queued = 0, sent = 1

### Verification - After 3 Seconds
1. Wait 3 seconds
2. Refresh dashboard or wait for auto-refresh (5 seconds)

- [ ] Status badge updates to "تم التسليم" (green)
- [ ] Stats: sent = 0, delivered = 1
- [ ] Timestamp `delivered_at` set

### Verification - Database
Run SQL:
```sql
SELECT id, status, sent_at, delivered_at 
FROM public.whatsapp_message_queue 
WHERE id = 'MSG_ID';
```

- [ ] status = 'delivered'
- [ ] sent_at populated
- [ ] delivered_at populated
- [ ] delivered_at - sent_at ≈ 3 seconds

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 6: Fetch Messages API

### Command
```bash
curl -X GET "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json"
```

### Verification
- [ ] API returns HTTP 200 (or 403 if not authenticated)
- [ ] Response contains `status: "success"`
- [ ] Messages array contains message from Test 2
- [ ] Stats object present:
  - [ ] `total` = 1
  - [ ] `queued` = 0
  - [ ] `sent` = 0
  - [ ] `delivered` = 1
  - [ ] `read` = 0
  - [ ] `failed` = 0

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 7: Booking Supervisor Agent

### Setup
Use Booking #2 ID: `_______________________________`

### Command
```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: YOUR_CRON_SECRET" \
  -d '{}'
```

### Verification - API Response
- [ ] HTTP 200 response
- [ ] `status` = `"success"`
- [ ] `bookings_analyzed` > 0
- [ ] `actions_identified` >= 1
- [ ] `messages_logged` >= 1
- [ ] Actions array contains entries

### Verification - Dashboard
1. Refresh: `http://localhost:3005/admin/messages`
2. Verify new messages appear

- [ ] New message(s) appear from agent run
- [ ] Status = "قيد الانتظار" (queued)
- [ ] Stats updated
- [ ] At least 1 booking linked to message

### Verification - Database
Run SQL:
```sql
SELECT COUNT(*) as msg_count FROM public.whatsapp_message_queue 
WHERE created_at > now() - interval '5 minutes';

SELECT note FROM public.booking_status_logs 
WHERE new_status = 'agent_run' 
ORDER BY created_at DESC LIMIT 1;
```

- [ ] Message count increased (at least 1 new)
- [ ] Agent run logged
- [ ] Note contains "queued X WhatsApp messages"

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 8: Database Audit Trail

### Verify whatsapp_message_queue
Run SQL:
```sql
SELECT id, booking_id, phone_number, status, created_at
FROM public.whatsapp_message_queue
ORDER BY created_at DESC LIMIT 10;
```

- [ ] Table exists
- [ ] 2+ rows present (from Tests 2 & 7)
- [ ] All columns populated
- [ ] Status values valid ('queued', 'sent', 'delivered', etc.)
- [ ] booking_id references valid bookings

### Verify booking_messages Linking
Run SQL:
```sql
SELECT id, booking_id, whatsapp_message_id, whatsapp_status, created_at
FROM public.booking_messages
WHERE whatsapp_message_id IS NOT NULL
ORDER BY created_at DESC LIMIT 10;
```

- [ ] Rows exist with whatsapp_message_id
- [ ] whatsapp_message_id matches whatsapp_message_queue.id
- [ ] whatsapp_status populated
- [ ] Foreign key constraint working

### Verify Agent Logs
Run SQL:
```sql
SELECT note, created_at FROM public.booking_status_logs
WHERE new_status = 'agent_run'
ORDER BY created_at DESC LIMIT 1;
```

- [ ] Agent run logged
- [ ] Note contains booking count
- [ ] Note contains action count
- [ ] Note contains message count
- [ ] Format: "...Analyzed X bookings, identified Y actions, queued Z WhatsApp messages"

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 9: Edge Case - No Phone Number

### Setup
Booking #3 (created without phone): `_______________________________`

### Verify Booking Created
Run SQL:
```sql
SELECT id, customer_full_name, phone_number, status 
FROM public.bookings 
WHERE id = 'BOOKING_ID_3';
```

- [ ] Booking exists
- [ ] phone_number IS NULL or empty

### Run Agent
```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "X-CRON-SECRET: YOUR_CRON_SECRET" \
  -d '{}'
```

### Verification
- [ ] Agent completes successfully (HTTP 200)
- [ ] Response may contain error for Booking #3
- [ ] Error message: "has no phone number"
- [ ] Message count NOT increased for Booking #3
- [ ] No message queued in whatsapp_message_queue

### Verify Database
Run SQL:
```sql
SELECT COUNT(*) FROM public.whatsapp_message_queue
WHERE booking_id = 'BOOKING_ID_3';
```

- [ ] Result = 0 (no messages for Booking #3)

### Result
✅ PASS / ❌ FAIL / ⏸️ SKIP

**Notes:** ________________________________________________________________

---

## Test 10: Performance Benchmarks

### Benchmark 1: Agent Execution
```bash
time curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "X-CRON-SECRET: ..." \
  -d '{}'
```

- [ ] Execution time: _____________ seconds
- [ ] Expected: < 5 seconds
- [ ] Status: PASS / SLOW

### Benchmark 2: API Response Time
```bash
time curl -X GET "http://localhost:3005/api/admin/messages/queue"
```

- [ ] Response time: _____________ ms
- [ ] Expected: < 500ms
- [ ] Status: PASS / SLOW

### Benchmark 3: Dashboard Load Time
1. Open browser dev tools (F12)
2. Go to Network tab
3. Navigate to: `http://localhost:3005/admin/messages`
4. Check load time

- [ ] First Contentful Paint (FCP): _____________ ms
- [ ] Full page load: _____________ seconds
- [ ] Expected: < 2 seconds
- [ ] Status: PASS / SLOW

### Result
✅ PASS / ⏸️ SLOW / ❌ FAIL

**Notes:** ________________________________________________________________

---

## Overall Results Summary

### Test Results
| Test | Result | Notes |
|------|--------|-------|
| 1. Dashboard | ✅/❌/⏸️ | |
| 2. Queue Message | ✅/❌/⏸️ | |
| 3. Display | ✅/❌/⏸️ | |
| 4. Links & QR | ✅/❌/⏸️ | |
| 5. Status Updates | ✅/❌/⏸️ | |
| 6. API Fetch | ✅/❌/⏸️ | |
| 7. Agent | ✅/❌/⏸️ | |
| 8. Database | ✅/❌/⏸️ | |
| 9. Edge Cases | ✅/❌/⏸️ | |
| 10. Performance | ✅/❌/⏸️ | |

### Overall Status
- **All Tests Passed:** ✅
- **Some Tests Failed:** ⚠️
- **Not Tested:** ⏸️

### Total Passed: _____ / 10
### Total Failed: _____ / 10
### Total Skipped: _____ / 10

---

## Critical Issues Found

```
[List any critical issues here]
```

---

## Minor Issues Found

```
[List any minor issues here]
```

---

## Next Actions

**If All Tests Pass (10/10):**
- [ ] Commit test results
- [ ] Push Phase 22 to GitHub
- [ ] Create PR for review
- [ ] Plan Phase 23

**If Some Tests Fail:**
- [ ] Review failures in PHASE_23_TEST_GUIDE.md Troubleshooting section
- [ ] Check dev server logs
- [ ] Verify Supabase connection
- [ ] Re-run failed tests
- [ ] Document any issues

**If Critical Issues:**
- [ ] Stop testing
- [ ] Debug issue
- [ ] Fix code
- [ ] Re-run Phase 22-3 tests

---

## Sign-Off

**Tested By:** _________________________________

**Date:** _________________________________

**Time Spent:** _________________________________

**Overall Assessment:**
```
[Describe testing experience and any observations]
```

---

**Phase 22-3 Complete:** ✅ / ⏸️ / ❌

