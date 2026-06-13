# Phase 22-3: Personalized Testing Guide

**Test Phone:** +966535473565  
**Date:** 2026-06-13  
**Status:** Ready to Execute  

---

## ✅ PERSONALIZED COMMANDS FOR YOUR TESTING

All commands below use your phone number: **+966535473565**

---

## STEP 1: Create Test Bookings

**In Supabase SQL Editor, run:**

```sql
-- BOOKING #1 (Complete Data - Phone: 966535473565)
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
  '+966535473565',
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
) RETURNING id, customer_full_name, phone_number;
```

**📌 SAVE THIS ID: `_____________________________`**

---

```sql
-- BOOKING #2 (For Agent Testing - Same Phone)
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
  '+966535473565',
  'هيونداي',
  'سوناتا',
  'فحص شامل وصيانة دورية',
  'new_request',
  now(),
  now()
) RETURNING id, customer_full_name, phone_number;
```

**📌 SAVE THIS ID: `_____________________________`**

---

## TEST 1: Admin Dashboard ✅

**Action:** Navigate to `http://localhost:3005/admin/messages`

**Verify:**
- [ ] Page loads
- [ ] Arabic RTL layout visible
- [ ] Header: "رسائل الـ WhatsApp"
- [ ] 5 stats cards (all showing 0)
- [ ] Message: "لا توجد رسائل معلقة"

**Status:** ✅ / ❌

---

## TEST 2: Queue Message to Your Phone ✅

**Replace BOOKING_ID_1 with your first booking ID**

**Run this command:**

```bash
curl -X POST "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID_1",
    "phone_number": "+966535473565",
    "message_text": "السلام عليكم ورحمة الله. شكراً على حجزك معنا. تم تسجيل حجزك بنجاح. سنتصل بك قريباً لتأكيد الموعد."
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "تم إضافة الرسالة إلى الطابور",
  "message_data": {
    "id": "msg_xxxxx",
    "booking_id": "BOOKING_ID_1",
    "phone_number": "+966535473565",
    "status": "queued",
    "wa_link": "https://wa.me/966535473565?text=..."
  }
}
```

**📌 SAVE MESSAGE ID: `_____________________________`**

**Status:** ✅ / ❌

---

## TEST 3: Dashboard Shows Your Message ✅

**Action:** Refresh `http://localhost:3005/admin/messages`

**Verify:**
- [ ] Stats "قيد الانتظار": shows 1
- [ ] Your message appears in list
- [ ] Phone: **+966535473565** ✓
- [ ] Status badge: "قيد الانتظار" (yellow)
- [ ] 4 buttons visible

**Status:** ✅ / ❌

---

## TEST 4: wa.me Link to Your Phone ✅

**Try these actions on the dashboard:**

### **4A: Copy Link**
1. Click "نسخ الرابط" button
2. Link copied to clipboard
3. Expected format: `https://wa.me/966535473565?text=...`

**Status:** ✅ / ❌

### **4B: QR Code**
1. Click "QR Code" button
2. Modal shows QR code
3. You can scan with your phone: **+966535473565**

**Status:** ✅ / ❌

### **4C: Send to WhatsApp**
1. Click "فتح في WhatsApp"
2. WhatsApp opens with message pre-filled
3. To: **+966535473565**
4. You'll see your message ready to send

**Status:** ✅ / ❌

---

## TEST 5: Send to Your WhatsApp ✅

**On the dashboard:**
1. Click "إرسال يدويًا" (Manual Send)
2. WhatsApp opens with your message
3. **Click send in WhatsApp app**
4. Watch status update

**Or use the wa.me link:**
1. Copy the link
2. Open in browser
3. Confirm in WhatsApp
4. Send manually

**Message Status Timeline:**
- ⏱️ Immediately: "مرسلة" (blue) - sent by you
- ⏱️ After 3 seconds: "تم التسليم" (green) - auto-delivered in demo

**Status:** ✅ / ❌

---

## TEST 6: Message Auto-Delivery ✅

**Replace MSG_ID with your message ID**

```bash
curl -X POST "http://localhost:3005/api/admin/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"message_id": "MSG_ID"}'
```

**Timeline on Dashboard:**
- T=0s: Status → "مرسلة" (blue)
- T=3s: Status → "تم التسليم" (green)

**Status:** ✅ / ❌

---

## TEST 7: Agent Integration ✅

**Replace BOOKING_ID_2 with your second booking ID**

**Run agent:**

```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: your_cron_secret" \
  -d '{}'
```

**Expected Response:**
```json
{
  "status": "success",
  "bookings_analyzed": 2,
  "actions_identified": 1,
  "messages_logged": 1
}
```

**Check Dashboard:**
- [ ] New message(s) appear
- [ ] Phone: **+966535473565** ✓
- [ ] Status: "قيد الانتظار"
- [ ] Message from agent about your booking

**Status:** ✅ / ❌

---

## TEST 8: Verify in Database ✅

**Run in Supabase SQL Editor:**

```sql
-- Check all messages to your phone
SELECT 
  id,
  booking_id,
  phone_number,
  status,
  created_at
FROM public.whatsapp_message_queue
WHERE phone_number = '+966535473565'
ORDER BY created_at DESC;
```

**Expected:** 2+ messages to your phone with correct statuses

**Status:** ✅ / ❌

---

## TEST 9: Send QR Code to Your Phone ✅

**On Dashboard:**

1. Find a "قيد الانتظار" (queued) message
2. Click "QR Code" button
3. Take screenshot of QR code
4. **Scan QR with your phone (+966535473565)**
5. WhatsApp opens with message
6. Send manually from your phone

**What Happens:**
- Your phone receives wa.me link
- WhatsApp opens with pre-filled message
- You send the message manually
- Status updates on dashboard

**Status:** ✅ / ❌

---

## TEST 10: Copy & Send Link Directly ✅

**Get the wa.me link:**

1. Click "نسخ الرابط"
2. Link format: `https://wa.me/966535473565?text=السلام...`
3. Paste link in browser on your phone
4. Click "Continue to WhatsApp"
5. Message appears pre-filled
6. Send from your phone

**Status:** ✅ / ❌

---

## TEST 11: Real WhatsApp Integration Test ✅

**Optional - Test end-to-end:**

1. Queue a message to +966535473565
2. Click "فتح في WhatsApp" or scan QR
3. Open WhatsApp on your phone
4. Message appears
5. **Actually send it**
6. Watch dashboard update in real-time

**In Production (Phase 23):**
- Real WhatsApp API will auto-send
- No manual click needed
- Status updates automatically

**Status:** ✅ / ❌

---

## 📊 TEST RESULTS

| Test | Status | Phone Used |
|------|--------|-----------|
| 1. Dashboard | ✅/❌ | - |
| 2. Queue Message | ✅/❌ | +966535473565 |
| 3. Display | ✅/❌ | +966535473565 |
| 4. wa.me Links | ✅/❌ | +966535473565 |
| 5. Send via WhatsApp | ✅/❌ | +966535473565 |
| 6. Auto-Delivery | ✅/❌ | +966535473565 |
| 7. Agent Integration | ✅/❌ | +966535473565 |
| 8. Database | ✅/❌ | +966535473565 |
| 9. QR Code to Phone | ✅/❌ | +966535473565 |
| 10. Direct Link Send | ✅/❌ | +966535473565 |
| 11. Real WhatsApp | ✅/❌ | +966535473565 |

---

## ✨ What You'll See

### **On Dashboard (Admin Side)**
```
رسائل الـ WhatsApp

Statistics:
  قيد الانتظار (Queued):    1
  مرسلة (Sent):            0
  تم التسليم (Delivered):   0

Messages:
  📱 +966535473565
  📬 [Your booking message]
  🔘 قيد الانتظار (yellow badge)
  
  Buttons:
    [نسخ الرابط] [QR Code] [إرسال يدويًا] [فتح في WhatsApp]
```

### **On Your Phone (Customer Side)**
```
When you click wa.me link or scan QR:

WhatsApp opens →

To: 966535473565
Message: السلام عليكم ورحمة الله...

[Click Send] →

Message sent to you
Dashboard updates: sent → delivered
```

---

## 🎯 Key Points

- ✅ **All messages queue to: +966535473565**
- ✅ **wa.me links generate automatically**
- ✅ **QR codes let you scan on your phone**
- ✅ **Status updates in real-time**
- ✅ **3-second auto-delivery in demo**
- ✅ **No real API costs (mock service)**
- ✅ **Ready for Phase 23 (real API)**

---

## 📝 Notes & Issues

```
[Document any issues here]
```

---

## ✅ READY?

**Start with STEP 1:**
1. Create bookings in Supabase
2. Copy booking IDs
3. Run Test 2 (queue message)
4. Check dashboard
5. Continue with remaining tests

**All commands use your phone: +966535473565**

---

**Good luck! 🚀**

