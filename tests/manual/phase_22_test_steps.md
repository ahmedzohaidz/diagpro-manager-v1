# Phase 22-3: Manual Testing Steps

**Status:** Ready for Execution  
**Date:** 2026-06-13

---

## Quick Test Scenario (15 minutes)

### **Setup (1 min)**
```bash
1. Ensure dev server running: npm run dev
2. Ensure Supabase connected
3. Ensure migration 010_whatsapp_message_queue.sql applied
```

---

## Test Case 1: Admin Dashboard Loads

### Step 1.1: Navigate to Admin Messages
```
URL: http://localhost:3005/admin/messages
Expected: Page loads, "رسائل الـ WhatsApp" header visible
RTL: Page has dir="rtl"
Stats: Shows 5 statistics cards (queued, sent, delivered, read, failed)
Message List: Shows "لا توجد رسائل معلقة" (no messages yet)
```

---

## Test Case 2: Queue First Message

### Step 2.1: Create Test Booking (Supabase SQL Editor)

```sql
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
  'محمد علي الدرعاوي',
  '+966501234567',
  'تويوتا',
  'كامري',
  'المحرك لا يستجيب',
  'new_request',
  now(),
  now()
) RETURNING id as booking_id;
```

**Save booking_id for next steps.**

### Step 2.2: Queue Message via API

```bash
curl -X POST "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "YOUR_BOOKING_ID_HERE",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكراً على حجزك معنا. تم تسجيل حجزك بنجاح."
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "تم إضافة الرسالة إلى الطابور",
  "message_data": {
    "id": "msg_xxxxx",
    "booking_id": "YOUR_BOOKING_ID_HERE",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكراً على حجزك معنا. تم تسجيل حجزك بنجاح.",
    "status": "queued",
    "wa_link": "https://wa.me/966501234567?text=..."
  }
}
```

**Save message_id from response.**

---

## Test Case 3: Dashboard Shows Message

### Step 3.1: Refresh Admin Dashboard
```
URL: http://localhost:3005/admin/messages
Expected:
  ✓ Stats card "قيد الانتظار" shows 1
  ✓ Message appears in list
  ✓ Shows phone number: +966501234567
  ✓ Shows booking ID
  ✓ Status badge: "قيد الانتظار" (yellow)
  ✓ 4 buttons visible:
    - نسخ الرابط (Copy Link)
    - QR Code
    - إرسال يدويًا (Manual Send)
    - فتح في WhatsApp (Open in WhatsApp)
```

---

## Test Case 4: wa.me Link Generation

### Step 4.1: Copy wa.me Link
```
On Dashboard:
  1. Click "نسخ الرابط" button
  2. Check clipboard
  3. Expected: Link format https://wa.me/966501234567?text=...
  4. Text should be URL-encoded Arabic message
```

### Step 4.2: Open Link
```
1. Paste link in browser OR click "فتح في WhatsApp"
2. Expected: WhatsApp opens with message pre-filled
3. Recipient: +966501234567
4. Message: Decoded Arabic text from booking confirmation
```

---

## Test Case 5: Message Status Update

### Step 5.1: Mark as Sent
```bash
curl -X POST "http://localhost:3005/api/admin/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"message_id": "YOUR_MESSAGE_ID_HERE"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "تم إرسال الرسالة",
  "message_data": {
    "id": "msg_xxxxx",
    "status": "sent",
    "sent_at": "2026-06-13T..."
  }
}
```

### Step 5.2: Check Dashboard
```
Immediately:
  ✓ Status badge changes to "مرسلة" (blue)
  ✓ Stats: queued decreases to 0, sent increases to 1

After 3 seconds:
  ✓ Status badge changes to "تم التسليم" (green)
  ✓ Stats: sent decreases to 0, delivered increases to 1
```

### Step 5.3: Verify Database
```sql
SELECT id, status, sent_at, delivered_at 
FROM public.whatsapp_message_queue 
WHERE id = 'msg_xxxxx';
```

**Expected:**
- status: 'delivered'
- sent_at: timestamp when sent
- delivered_at: timestamp ~3 seconds later

---

## Test Case 6: QR Code Generation

### Step 6.1: Generate QR Code
```
On Dashboard:
  1. Click "QR Code" button on message
  2. Modal appears with:
     ✓ Title: "QR Code"
     ✓ Scannable QR image (black/white)
     ✓ Arabic text: "امسح هذا الـ QR لفتح الرسالة في WhatsApp"
     ✓ Phone number displayed
     ✓ Close button
```

### Step 6.2: Scan QR Code
```
Use mobile device:
  1. Open camera or QR scanner app
  2. Scan the QR code
  3. Expected: Redirects to wa.me link
  4. WhatsApp opens with message pre-filled
```

---

## Test Case 7: Agent Integration

### Step 7.1: Create Second Booking
```sql
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
  'فاطمة أحمد',
  '+966502345678',
  'هيونداي',
  'سوناتا',
  'فحص شامل',
  'new_request',
  now(),
  now()
) RETURNING id;
```

### Step 7.2: Trigger Agent
```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: YOUR_CRON_SECRET" \
  -d '{}'
```

**Expected Response:**
```json
{
  "status": "success",
  "bookings_analyzed": 2,
  "actions_identified": 1,
  "messages_logged": 1,
  "actions": [...]
}
```

### Step 7.3: Check Dashboard
```
Immediately after agent run:
  ✓ New message appears in list for second booking
  ✓ Status: "قيد الانتظار" (queued)
  ✓ Stats update
```

### Step 7.4: Verify Audit Trail
```sql
-- Check agent run log
SELECT note FROM public.booking_status_logs 
WHERE new_status = 'agent_run' 
ORDER BY created_at DESC LIMIT 1;

-- Expected: "...queued 1 WhatsApp messages"

-- Check booking_messages linking
SELECT * FROM public.booking_messages 
WHERE booking_id = 'YOUR_SECOND_BOOKING_ID' 
AND whatsapp_message_id IS NOT NULL;

-- Expected: whatsapp_message_id populated
```

---

## Test Case 8: Message Auto-Refresh

### Step 8.1: Monitor Dashboard Auto-Refresh
```
1. Open admin dashboard in two browser tabs
2. In one tab, mark a message as sent
3. In other tab, watch stats update
4. Expected: Stats update automatically within 5 seconds
   (dashboard polls GET /api/admin/messages/queue every 5s)
```

---

## Test Case 9: Edge Case - No Phone Number

### Step 9.1: Create Booking Without Phone
```sql
INSERT INTO public.bookings (
  customer_full_name, 
  car_make, 
  car_model, 
  problem_description, 
  status
) VALUES (
  'علي بلا رقم هاتف',
  'فورد',
  'فوكس',
  'مشكلة في الفرامل',
  'new_request'
) RETURNING id;
```

### Step 9.2: Run Agent
```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "X-CRON-SECRET: YOUR_CRON_SECRET" \
  -d '{}'
```

**Expected:**
```json
{
  "status": "success",
  "bookings_analyzed": 3,
  "actions_identified": 0,
  "messages_logged": 0,
  "errors": ["Booking xxx has no phone number"]
}
```

No message queued (graceful error handling).

---

## Test Case 10: Statistics Accuracy

### Step 10.1: Create Multiple Messages
```
Queue 5 different messages:
  1. Message 1: status=queued
  2. Message 2: status=sent
  3. Message 3: status=delivered
  4. Message 4: status=read
  5. Message 5: status=failed (with failed_reason)

Then check stats:
```

### Step 10.2: Verify Stats
```bash
curl -X GET "http://localhost:3005/api/admin/messages/queue"
```

**Expected Response:**
```json
{
  "status": "success",
  "stats": {
    "total": 5,
    "queued": 1,
    "sent": 1,
    "delivered": 1,
    "read": 1,
    "failed": 1
  }
}
```

---

## Performance Check

### Check 1: Agent Performance
```
Time: curl -X POST "http://localhost:3005/api/cron/booking-supervisor" ...
Expected: < 5 seconds for ~10 bookings
```

### Check 2: API Response Time
```
Time: curl -X GET "http://localhost:3005/api/admin/messages/queue"
Expected: < 500ms
```

### Check 3: Dashboard Load Time
```
URL: http://localhost:3005/admin/messages
Expected: Page fully loads in < 2 seconds
```

---

## Summary Checklist

### Database ✅
- [ ] whatsapp_message_queue table exists
- [ ] 13 columns present and correct types
- [ ] Indexes on booking_id, status, created_at
- [ ] booking_messages columns linked
- [ ] Foreign keys enforced

### API Security ✅
- [ ] Anonymous 403 Forbidden
- [ ] Admin 200 OK

### Message Queueing ✅
- [ ] Messages queue correctly
- [ ] wa_link generated (https://wa.me/...)
- [ ] Status = 'queued' initially

### Message Display ✅
- [ ] Messages appear in dashboard
- [ ] Stats correct
- [ ] Status badges color-coded
- [ ] All buttons present

### Delivery Simulation ✅
- [ ] Status updates to 'sent' on mark send
- [ ] Status auto-updates to 'delivered' after 3s
- [ ] Dashboard auto-refreshes

### Agent Integration ✅
- [ ] Agent queues messages
- [ ] Messages linked in booking_messages
- [ ] Audit trail in booking_status_logs
- [ ] Error handling for missing phone

### QR Codes ✅
- [ ] QR codes generate correctly
- [ ] QR codes scannable
- [ ] QR contains wa.me link

### Edge Cases ✅
- [ ] Booking without phone handled gracefully
- [ ] Multiple message statuses work
- [ ] Stats count correctly

### Performance ✅
- [ ] Agent < 5 seconds
- [ ] API < 500ms
- [ ] Dashboard < 2 seconds

---

## If Tests Fail

**Dashboard doesn't load:**
- Check console for errors
- Verify user is logged in as admin
- Verify /admin/messages route exists

**Messages don't queue:**
- Check API response for errors
- Verify booking_id is valid UUID
- Verify phone_number format

**Status doesn't update:**
- Check browser console for errors
- Check that simulateDelivery called
- Verify 3-second timeout working

**Agent doesn't queue messages:**
- Verify CRON_SECRET header correct
- Check agent run response for errors
- Verify booking exists with valid phone

**Stats incorrect:**
- Refresh dashboard
- Check GET /api/admin/messages/queue directly
- Verify database query

---

## Next Steps

✅ All tests passing  
→ **Phase 22-4:** Production checklist  
→ **Phase 23:** Advanced features

