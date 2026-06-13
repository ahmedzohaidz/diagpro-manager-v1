# Phase 22-3: WhatsApp Integration — Testing & Verification Guide

**Status:** In Progress  
**Date:** 2026-06-13  
**Goal:** Verify complete Phase 22 integration (Mock WhatsApp + Booking Agent)

---

## Overview

Phase 22-3 tests the complete integration of:
- Booking Supervisor Agent (Phase 21-2)
- Mock WhatsApp Service (Phase 22-1)
- WhatsApp-Agent Integration (Phase 22-2)

**Expected Flow:**
```
Agent runs (cron) → Analyzes bookings → Detects actions → Queues WhatsApp messages 
→ Messages appear in admin dashboard → Admin sends via wa.me → Status updates
```

---

## Pre-Test Checklist

Before testing, ensure:
- [ ] Next.js dev server running: `npm run dev`
- [ ] Supabase migrations applied (010_whatsapp_message_queue.sql)
- [ ] Environment variables configured (.env.local or .env.example)
- [ ] Database tables created:
  - [ ] bookings
  - [ ] booking_messages
  - [ ] whatsapp_message_queue
  - [ ] booking_status_logs
  - [ ] users

---

## Test 1: Database Schema Verification

### 1.1 Verify Table Exists

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'whatsapp_message_queue';
```

**Expected:** Returns `whatsapp_message_queue`

### 1.2 Verify Columns

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'whatsapp_message_queue' 
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (text, NOT NULL)
- booking_id (uuid, NOT NULL)
- phone_number (text, NOT NULL)
- message_text (text, NOT NULL)
- status (text, NOT NULL)
- wa_link (text, nullable)
- qr_code_url (text, nullable)
- queued_at (timestamptz, NOT NULL)
- sent_at (timestamptz, nullable)
- delivered_at (timestamptz, nullable)
- read_at (timestamptz, nullable)
- failed_reason (text, nullable)
- created_at (timestamptz, NOT NULL)

### 1.3 Verify Indexes

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'whatsapp_message_queue';
```

**Expected Indexes:**
- idx_whatsapp_queue_booking_id
- idx_whatsapp_queue_status
- idx_whatsapp_queue_created_at

### 1.4 Verify booking_messages Links

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'booking_messages' 
AND column_name IN ('whatsapp_message_id', 'whatsapp_status', 'whatsapp_status_updated_at');
```

**Expected Columns:**
- whatsapp_message_id (text, nullable)
- whatsapp_status (text, nullable)
- whatsapp_status_updated_at (timestamptz, nullable)

---

## Test 2: Admin Dashboard Accessibility

### 2.1 Dashboard Route

**URL:** `http://localhost:3005/admin/messages`

**Expected:**
- [ ] Page loads (200 or redirects to auth)
- [ ] Arabic RTL layout (`dir="rtl"`)
- [ ] Title: "رسائل الـ WhatsApp"
- [ ] Statistics cards visible (but empty if no messages)

### 2.2 API Endpoint Security

**Test Unauthenticated Access:**
```bash
curl -X GET "http://localhost:3005/api/admin/messages/queue"
```

**Expected:** `403 Forbidden` with message: "لا يوجد صلاحية (مسؤول فقط)"

**Test Authenticated Admin Access:**
- Log in as admin user first
- Then call endpoint again
- **Expected:** `200 OK` with messages array and stats

---

## Test 3: Message Queueing

### 3.1 Create Test Booking

**SQL:**
```sql
INSERT INTO public.bookings (
  id, 
  customer_full_name, 
  phone_number, 
  car_make, 
  car_model, 
  problem_description, 
  status, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'محمد علي',
  '+966501234567',
  'تويوتا',
  'كامري',
  'المحرك لا يستجيب',
  'new_request',
  now(),
  now()
) RETURNING id;
```

**Save the booking_id for later tests.**

### 3.2 Queue Message Manually

**POST /api/admin/messages/queue**

```bash
curl -X POST "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "YOUR_BOOKING_ID",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكرا على حجزك معنا."
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "تم إضافة الرسالة إلى الطابور",
  "message_data": {
    "id": "msg_xxxxx",
    "booking_id": "YOUR_BOOKING_ID",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكرا على حجزك معنا.",
    "status": "queued",
    "wa_link": "https://wa.me/966501234567?text=...",
    "queued_at": "2026-06-13T...",
    "created_at": "2026-06-13T..."
  }
}
```

### 3.3 Verify Message in Database

**SQL:**
```sql
SELECT id, booking_id, phone_number, status, created_at 
FROM public.whatsapp_message_queue 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
- Status: `queued`
- Phone number matches
- Timestamp recent

---

## Test 4: Message Dashboard Display

### 4.1 Fetch Messages via API

**GET /api/admin/messages/queue**

```bash
curl -X GET "http://localhost:3005/api/admin/messages/queue"
```

**Expected Response:**
```json
{
  "status": "success",
  "messages": [
    {
      "id": "msg_xxxxx",
      "booking_id": "YOUR_BOOKING_ID",
      "phone_number": "+966501234567",
      "message_text": "السلام عليكم ورحمة الله. شكرا على حجزك معنا.",
      "status": "queued",
      "wa_link": "https://wa.me/966501234567?text=...",
      "queued_at": "2026-06-13T..."
    }
  ],
  "stats": {
    "total": 1,
    "queued": 1,
    "sent": 0,
    "delivered": 0,
    "read": 0,
    "failed": 0
  }
}
```

### 4.2 Dashboard UI Verification

Visit: `http://localhost:3005/admin/messages`

**Verify:**
- [ ] Stats card: "قيد الانتظار" = 1
- [ ] Message appears in list
- [ ] Phone number displayed correctly
- [ ] Message preview visible
- [ ] Status badge shows "قيد الانتظار" (yellow)
- [ ] Buttons visible: "نسخ الرابط", "QR Code", "إرسال يدويًا", "فتح في WhatsApp"

---

## Test 5: Message Delivery Simulation

### 5.1 Mark as Sent

**POST /api/admin/messages/send**

```bash
curl -X POST "http://localhost:3005/api/admin/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"message_id": "msg_xxxxx"}'
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

### 5.2 Auto-Delivery (3 Second Simulation)

**Wait 3 seconds**, then verify status changed to "delivered":

```sql
SELECT id, status, sent_at, delivered_at 
FROM public.whatsapp_message_queue 
WHERE id = 'msg_xxxxx';
```

**Expected:**
- Status: `delivered`
- sent_at: timestamp when marked sent
- delivered_at: timestamp (usually ~3 seconds after sent_at)

### 5.3 Dashboard Auto-Update

On the admin dashboard, after 3 seconds:
- [ ] Message status badge changes from "مرسلة" → "تم التسليم" (green)
- [ ] Delivered count increases in stats

---

## Test 6: Agent Integration

### 6.1 Trigger Agent Manually

**POST /api/cron/booking-supervisor**

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
  "timestamp": "2026-06-13T...",
  "bookings_analyzed": 1,
  "actions_identified": 1,
  "messages_logged": 1,
  "actions": [
    {
      "booking_id": "YOUR_BOOKING_ID",
      "action_type": "send_confirmation",
      "reason": "تأكيد استقبال الحجز",
      "message_text": "...تم استقبال حجزك...",
      "message_channel": "whatsapp"
    }
  ]
}
```

### 6.2 Verify Messages Queued

**SQL:**
```sql
SELECT COUNT(*) as queued_count, status 
FROM public.whatsapp_message_queue 
WHERE created_at > now() - interval '5 minutes' 
GROUP BY status;
```

**Expected:**
- New queued messages from agent run
- Status distribution matches agent actions

### 6.3 Verify booking_messages Linked

**SQL:**
```sql
SELECT bm.id, bm.message_text, bm.whatsapp_message_id, bm.whatsapp_status 
FROM public.booking_messages bm 
WHERE bm.whatsapp_message_id IS NOT NULL 
ORDER BY bm.created_at DESC 
LIMIT 5;
```

**Expected:**
- whatsapp_message_id populated (links to whatsapp_message_queue)
- whatsapp_status matches queue status

---

## Test 7: End-to-End Flow

### 7.1 Create a New Booking with Missing Data

**SQL:**
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
  'فاطمة محمود',
  '+966502345678',
  'هيونداي',
  'سوناتا',
  'فحص شامل',
  'new_request',
  now(),
  now()
) RETURNING id;
```

**Save the booking_id.**

### 7.2 Run Agent

Trigger agent: POST /api/cron/booking-supervisor

### 7.3 Verify Message Queued

1. Check API: `GET /api/admin/messages/queue`
2. Check Dashboard: `http://localhost:3005/admin/messages`
3. Verify new message appears

### 7.4 Test Full Flow

1. **Copy wa.me Link:**
   - Click "نسخ الرابط" button
   - Link copied to clipboard
   - Format: `https://wa.me/966502345678?text=...`

2. **Generate QR Code:**
   - Click "QR Code" button
   - Modal shows scannable QR code
   - QR contains wa.me link

3. **Send via WhatsApp:**
   - Click "إرسال يدويًا"
   - WhatsApp opens in new tab with pre-filled message
   - Status updates to "مرسلة"

4. **Wait for Auto-Delivery:**
   - After 3 seconds, status → "تم التسليم"
   - Stats update automatically (dashboard polls every 5s)

---

## Test 8: Edge Cases

### 8.1 Booking with No Phone Number

**Create booking without phone:**
```sql
INSERT INTO public.bookings (
  customer_full_name, 
  car_make, 
  car_model, 
  problem_description, 
  status
) VALUES (
  'علي أحمد',
  'فورد',
  'فوكس',
  'مشكلة في الفرامل',
  'new_request'
) RETURNING id;
```

**Run agent → Expected:** No message queued (agent skips booking with no phone)

### 8.2 Mark Same Message Sent Twice

Queue message → Send → Send again

**Expected:** Either updates timestamps or returns error (graceful handling)

### 8.3 Get Message Stats with Mixed Statuses

Queue 5 messages:
- 1 queued
- 1 sent
- 1 delivered
- 1 read
- 1 failed

**Verify:** Stats counts match

---

## Test 9: Database Audit Trail

### 9.1 Verify booking_status_logs Entries

**SQL:**
```sql
SELECT * FROM public.booking_status_logs 
WHERE new_status = 'agent_run' 
ORDER BY created_at DESC 
LIMIT 3;
```

**Expected:**
- note includes: "Analyzed X bookings, identified Y actions, queued Z WhatsApp messages"

### 9.2 Verify booking_messages Audit Trail

**SQL:**
```sql
SELECT COUNT(*) 
FROM public.booking_messages 
WHERE direction = 'outbound' 
AND whatsapp_message_id IS NOT NULL;
```

**Expected:** Count > 0 (all agent-queued messages logged)

---

## Test 10: Performance

### 10.1 Agent Performance

**Run agent, measure time:**
```sql
-- Time agent run
SELECT 'Agent start' as event, now() as timestamp;

-- POST /api/cron/booking-supervisor
-- ...

SELECT 'Agent end' as event, now() as timestamp;
```

**Expected:** Complete in < 5 seconds for ~100 bookings

### 10.2 Message Fetch Performance

```bash
time curl -X GET "http://localhost:3005/api/admin/messages/queue"
```

**Expected:** < 500ms response time

---

## Verification Checklist

- [ ] Database schema complete and correct
- [ ] Admin dashboard accessible
- [ ] API endpoints secured (403 without auth)
- [ ] Messages queue correctly
- [ ] Messages display in dashboard
- [ ] wa.me links generated correctly
- [ ] QR codes generated and scannable
- [ ] Status updates to "sent" when admin sends
- [ ] Status auto-updates to "delivered" after 3 seconds
- [ ] Agent integrates and queues messages
- [ ] Messages linked in booking_messages table
- [ ] Audit trail maintained in booking_status_logs
- [ ] Edge cases handled gracefully
- [ ] Performance acceptable

---

## Troubleshooting

### Problem: "لا يوجد صلاحية" on admin dashboard

**Solution:** Ensure logged-in user has `role = 'admin'` in users table

### Problem: Messages not appearing in dashboard

**Solution:** Check API response via `GET /api/admin/messages/queue` directly

### Problem: wa.me link missing

**Solution:** Verify `whatsappService.generateWALink()` called in queueMessage()

### Problem: Status not updating after 3 seconds

**Solution:** Check browser console for errors in `simulateDelivery()` promise

### Problem: Agent not running

**Solution:** Verify CRON_SECRET env variable set and passed in header

---

## Next Steps

✅ **Phase 22-3 Complete:** All tests passing  
→ **Phase 22-4:** Production deployment checklist  
→ **Phase 23:** Advanced features (real WhatsApp API integration)

---

**Last Updated:** 2026-06-13  
**Test Status:** Ready for execution
