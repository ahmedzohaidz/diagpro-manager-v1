# Phase 22-3: Live Testing Session

**Start Time:** 2026-06-13  
**Status:** In Progress  

---

## ✅ LIVE TEST EXECUTION

### **STEP 1: Create Test Bookings (DO THIS FIRST)**

**Action:** Open Supabase Dashboard → SQL Editor

**Copy and run this SQL:**

```sql
-- STEP 1A: Create Booking #1 (Complete Data)
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
) RETURNING id;
```

**✓ COPY THE RETURNED ID: `_____________________________`**

```sql
-- STEP 1B: Create Booking #2 (For Agent Testing)
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
) RETURNING id;
```

**✓ COPY THE RETURNED ID: `_____________________________`**

---

### **TEST 1: Admin Dashboard ✅**

**URL:** `http://localhost:3005/admin/messages`

**Visual Checks:**
- [ ] Page loads (no errors)
- [ ] Header: "رسائل الـ WhatsApp"
- [ ] 5 stats cards visible
- [ ] Message: "لا توجد رسائل معلقة"

**Status:** ✅ / ❌

---

### **TEST 2: Queue Message ✅**

**Setup:**
- Booking ID: `_____________________________`
- Phone: `+966501234567`

**Copy this command and run it:**

```bash
curl -X POST "http://localhost:3005/api/admin/messages/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "PASTE_BOOKING_ID_1_HERE",
    "phone_number": "+966501234567",
    "message_text": "السلام عليكم ورحمة الله. شكراً على حجزك معنا. تم تسجيل حجزك بنجاح."
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message_data": {
    "id": "msg_xxxxx",
    "status": "queued"
  }
}
```

**✓ COPY MESSAGE ID: `_____________________________`**

**Status:** ✅ / ❌

---

### **TEST 3: Dashboard Shows Message ✅**

**Refresh:** `http://localhost:3005/admin/messages`

**Verify:**
- [ ] Stats "قيد الانتظار" = 1
- [ ] Message in list
- [ ] Status badge (yellow)
- [ ] 4 buttons visible

**Status:** ✅ / ❌

---

### **TEST 4: wa.me Link & QR ✅**

**On Dashboard:**
1. Click "نسخ الرابط" → Check clipboard
2. Click "QR Code" → Verify QR displays
3. Click "فتح في WhatsApp" → Should open WhatsApp

**Status:** ✅ / ❌

---

### **TEST 5: Status Updates ✅**

**Message ID:** `_____________________________`

**Run:**
```bash
curl -X POST "http://localhost:3005/api/admin/messages/send" \
  -H "Content-Type: application/json" \
  -d '{"message_id": "PASTE_MESSAGE_ID_HERE"}'
```

**Timeline:**
- [ ] Immediate: Status → "مرسلة" (blue)
- [ ] After 3s: Status → "تم التسليم" (green)

**Status:** ✅ / ❌

---

### **TEST 6: Agent Integration ✅**

**Booking ID #2:** `_____________________________`

**Run:**
```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: your_cron_secret_here" \
  -d '{}'
```

**Verify:**
- [ ] Agent runs (HTTP 200)
- [ ] New message(s) queued
- [ ] Dashboard shows new messages

**Status:** ✅ / ❌

---

### **TEST 7: Database Verification ✅**

**Run in SQL Editor:**

```sql
-- Check whatsapp_message_queue
SELECT COUNT(*) as total, 
  COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
FROM public.whatsapp_message_queue;
```

**Expected:** Multiple rows with correct statuses

**Status:** ✅ / ❌

---

### **TEST 8: Edge Case - No Phone ✅**

**Create booking without phone:**

```sql
INSERT INTO public.bookings (
  customer_full_name,
  car_make,
  car_model,
  problem_description,
  status
) VALUES (
  'علي محمد (بدون رقم)',
  'فورد',
  'فوكس',
  'مشكلة في الفرامل',
  'new_request'
) RETURNING id;
```

**Run Agent:**
```bash
curl -X POST "http://localhost:3005/api/cron/booking-supervisor" \
  -H "X-CRON-SECRET: ..." \
  -d '{}'
```

**Verify:** No error, graceful handling

**Status:** ✅ / ❌

---

### **TEST 9: Performance ✅**

**Measure:**
1. Agent execution time
2. API response time
3. Dashboard load time

**Status:** ✅ / ❌

---

### **TEST 10: Summary ✅**

**Results:**
- Total Tests: 10
- Passed: _____
- Failed: _____
- Overall: ✅ / ❌

---

## 📊 RESULTS SUMMARY

| Test | Status | Notes |
|------|--------|-------|
| 1. Dashboard | ✅/❌ | |
| 2. Queue | ✅/❌ | |
| 3. Display | ✅/❌ | |
| 4. Links | ✅/❌ | |
| 5. Updates | ✅/❌ | |
| 6. Agent | ✅/❌ | |
| 7. Database | ✅/❌ | |
| 8. Edge Case | ✅/❌ | |
| 9. Performance | ✅/❌ | |
| 10. Summary | ✅/❌ | |

---

**Phase 22-3 Testing:** ✅ COMPLETE / ❌ FAILED

