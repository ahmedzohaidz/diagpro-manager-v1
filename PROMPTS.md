# DiagPro Manager V1 — Optimized Prompts for Claude Code / Cursor

This file contains ready-to-use prompts for implementing features efficiently.
Copy and paste directly into Claude Code or Cursor for consistent, high-quality implementation.

---

## Phase 20B-2: Admin Document List UI

```
Phase 20B-2: Admin Document List UI

Context:
- Phase 20B-1 (database schema) is complete and committed
- customer_documents table has: id, customer_id, vehicle_id, booking_id, 
  work_order_id, document_type, title, summary, file_url, storage_path, 
  original_filename, file_size_bytes, mime_type, customer_visible, 
  uploaded_by, created_at, updated_at
- RLS is enabled: admin can SELECT/INSERT/UPDATE, customer can SELECT own (if visible=true)

Requirements:
1. Create /admin/documents/page.tsx
   - Reuse existing admin auth pattern from /admin/bookings
   - Display documents in a table: customer name | title | type | visibility | date
   
2. Filters:
   - Filter by customer (search by name/phone)
   - Filter by document_type
   - Filter by visibility (visible to customer Y/N)
   
3. Actions:
   - Toggle customer_visible boolean
   - View document details (summary, metadata)
   - Delete document (admin only)
   - Placeholder: "Upload in Phase 20C" (no actual upload)
   
4. Design:
   - Use existing Card, Button, Input components
   - Arabic labels: "المستندات", "اسم العميل", "النوع", "مرئي للعميل"
   - Yellow (#FFD100) buttons for primary actions
   
5. Data loading:
   - Query: SELECT * FROM customer_documents WHERE ... (RLS applies)
   - Join customers table for display_name
   - Sort by created_at DESC
   
6. Testing:
   - Admin logs in → sees all documents
   - Filter works correctly
   - Toggle visible → RLS updates (customer can see only if visible=true)
   
7. Security:
   - No DELETE action without confirmation
   - Log visibility changes (optional)
   - No exposure of internal file paths
   
Do NOT:
- Add file upload
- Add Storage integration
- Modify RLS policies
- Modify customer_documents schema
- Add new tables
```

---

## Phase 20B-3: Customer Document Portal UI

```
Phase 20B-3: Customer Document Portal (Read-Only View)

Context:
- /customer portal exists and requires customer_accounts auth
- Customer should see ONLY their own documents where customer_visible = true
- RLS automatically enforces this (is_customer() AND customer_id = current_customer_id())

Requirements:
1. Create /customer/documents/page.tsx
   - Reuse /customer/page.tsx layout pattern
   - Require authentication (redirect to /customer/login if not)
   
2. Display:
   - List of documents: title | type | date | summary
   - Read-only (no actions)
   - Group by document_type if helpful
   
3. Document Detail (Modal/Drawer):
   - Click document → show title, summary, date, file_size
   - Placeholder: "File will be available in Phase 20C"
   
4. Design:
   - Clean card layout
   - Arabic labels: "المستندات الخاصة بي", "نوع المستند", "التاريخ"
   - No admin-only fields visible
   
5. Query:
   - SELECT * FROM customer_documents 
     WHERE customer_id = current_customer_id() 
       AND customer_visible = true
     ORDER BY created_at DESC
   - RLS enforces row-level access automatically
   
6. Security Verification:
   - Try to query with customer auth → sees own docs only
   - Try to access another customer's ID → 403 (RLS blocks)
   - Verify summary is shown, not internal fields
   
7. Testing:
   - Admin creates document with customer_visible = false
   - Customer logs in → document NOT visible
   - Admin toggles customer_visible = true
   - Customer logs in → document visible
   
Do NOT:
- Add file download
- Add upload
- Modify RLS
- Show file_url (null anyway until Phase 20C)
- Show admin-only fields
```

---

## Phase 20C-1: File Upload Backend (API Route)

```
Phase 20C-1: File Upload Validation & Metadata Storage

Context:
- Customer documents schema exists (008)
- No Storage bucket yet (will add in 20C-2)
- This phase: validate + store metadata in customer_documents
- Phase 20C-2: integrate Supabase Storage

Requirements:
1. Create API route: /api/admin/documents/upload

2. Endpoint spec:
   POST /api/admin/documents/upload
   
   Body (multipart/form-data):
   {
     file: File,
     customer_id: uuid,
     document_type: 'invoice' | 'diagnostic_report' | 'approval' | ...,
     title: string,
     summary?: string,
     work_order_id?: uuid,
     vehicle_id?: uuid
   }
   
   Response:
   {
     id: uuid,
     status: 'success' | 'error',
     message: string,
     document_id?: uuid
   }

3. Validations:
   - Auth: admin only (use current_staff_role)
   - File type: [.pdf, .jpg, .jpeg, .png] only
   - File size: max 50MB
   - Customer exists
   - document_type is valid
   
4. Logic:
   - Validate file
   - Store metadata in customer_documents:
     * file_url = null (will fill in 20C-2)
     * storage_path = null (will fill in 20C-2)
     * original_filename = file.name
     * file_size_bytes = file.size
     * mime_type = file.type
     * uploaded_by = auth.uid()
     * customer_visible = false (admin must toggle)
   - Return document_id for frontend
   
5. Error handling:
   - Invalid file type → 400 + message
   - File too large → 413 + message
   - Unauthorized → 403
   - DB error → 500 + log
   
6. Testing:
   - Upload valid PDF → success, metadata stored
   - Upload .exe → 400 error
   - Upload 100MB file → 413 error
   - Non-admin tries → 403
   
Do NOT:
- Actually upload to Storage (Phase 20C-2)
- Create signed URLs yet
- Modify RLS
- Modify schema
```

---

## Phase 20C-2: Storage Integration & Download

```
Phase 20C-2: Supabase Storage Integration

Context:
- Metadata stored in customer_documents (Phase 20C-1)
- Now integrate Supabase Storage bucket
- Generate signed URLs for download
- Handle cleanup on delete

Requirements:
1. Setup:
   - Create bucket: diagpro_documents (public: false)
   - Path structure: customers/{customer_id}/documents/{document_id}.{ext}
   
2. Update upload route:
   - After validation, upload file to Storage
   - Get public_url or signed_url
   - Update customer_documents.file_url
   - Update storage_path = path used in bucket
   
3. Download endpoint:
   GET /api/customer/documents/{document_id}/download
   
   - Auth: customer_accounts only
   - RLS check: document.customer_id = current_customer_id()
   - Return signed URL (valid 1 hour)
   - Log download (optional)
   
4. Security:
   - Storage RLS: only owner can read
   - Signed URLs expire quickly
   - Log all downloads
   - No direct file path exposure
   
5. Delete handling:
   - When customer_documents deleted → Storage file deleted
   - Use trigger or cascade delete
   
Do NOT:
- Skip RLS on Storage
- Create world-readable bucket
- Expose file paths in responses
```

---

## Phase 21: Booking Customer Supervisor Agent

```
Phase 21: Booking Customer Supervisor Agent (AI Agent Foundation)

Context:
- All booking data exists (customers, bookings, vehicles)
- Customer portal auth is ready (Phase 20A)
- Agent should monitor bookings and auto-respond

Scope:
1. Agent permissions (admin-defined):
   - Read: bookings, customers, vehicles, booking_messages
   - Write: booking_messages, booking_status_logs
   - NOT allowed: delete, discount, pricing, warranties
   
2. Capabilities:
   - Detect missing data (empty phone, no vehicle type, etc.)
   - Send reminder messages (WhatsApp-ready format)
   - Suggest available appointments
   - Log interactions as booking_messages
   
3. Trigger conditions:
   - Booking status = new_request AND no phone → "Please provide phone"
   - Booking status = appointment_suggested AND >24h no response → reminder
   - Booking status = confirmed AND 1 day before → "See you tomorrow"
   
4. Implementation:
   - Create agents/BookingCustomerSupervisor.ts
   - Use Supabase RLS for data access
   - Call via cron job or event (to decide)
   - Log all messages to booking_messages
   
5. Testing:
   - Create test booking with missing data
   - Trigger agent → should send message
   - Verify message logged in booking_messages
   
Do NOT:
- Modify bookings directly
- Change status without approval
- Make pricing decisions
- Send actual SMS/WhatsApp yet (Phase 22)
```

---

## Phase 22: WhatsApp Integration (Ready-Made Template)

```
Phase 22: WhatsApp-Ready Message Format

Requirements:
1. Create utils/whatsapp.ts
   - formatBookingReminder(booking): string
   - formatConfirmation(booking): string
   - formatStatusUpdate(booking, new_status): string
   - All Arabic, WhatsApp format
   
2. Example format:
   ```
   السلام عليكم ورحمة الله وبركاته 🙏
   
   مرحباً احمد، شكراً لتعاملك معنا
   
   📋 تفاصيل الحجز:
   • السيارة: تويوتا كامري (أسود)
   • المشكلة: أصوات غريبة من المحرك
   • الموعد المقترح: غداً الساعة 10:00 صباحاً
   
   ✅ هل هذا الموعد مناسب لك؟
   - ✔ نعم، أؤكد
   - ❌ اختر موعد آخر
   - 📞 اتصل بنا
   
   رابط التأكيد: https://diagpro.com/confirm/booking-id
   ```
   
3. No actual WhatsApp API yet (Phase 23)
   - Just format strings
   - Ready for Twilio/WhatsApp Business API later
   
Do NOT:
- Integrate actual WhatsApp API
- Send SMS
- Modify schema
```

---

## Testing Template: Phase 20C Integration Test

```sql
-- SQL to test Phase 20C end-to-end
-- Run in Supabase SQL Editor after Phase 20C implementation

-- 1. Admin creates document
INSERT INTO public.customer_documents (
  customer_id, document_type, title, summary, customer_visible, uploaded_by
) 
SELECT 
  c.id, 
  'invoice', 
  'Invoice #2025-001',
  'Total repair cost: 500 SAR',
  false,
  u.id
FROM public.customers c, public.users u
WHERE c.phone = '5551234567' AND u.role = 'admin'
LIMIT 1
RETURNING id, customer_id, document_type, customer_visible;

-- 2. Verify RLS: customer should NOT see (visible=false)
-- Run as: SET SESSION authorization = 'customer-auth-id'
SELECT id, title FROM public.customer_documents 
WHERE customer_id = 'customer-uuid'
-- Should return: 0 rows

-- 3. Admin toggles visibility
UPDATE public.customer_documents 
SET customer_visible = true 
WHERE id = 'doc-id'
RETURNING customer_visible;

-- 4. Verify RLS: customer should NOW see
-- Run as: SET SESSION authorization = 'customer-auth-id'
SELECT id, title, summary FROM public.customer_documents 
WHERE customer_id = 'customer-uuid'
-- Should return: 1 row with title, summary (not internal fields)

-- 5. Verify admin sees all
SELECT COUNT(*) FROM public.customer_documents
-- Should return: all documents (no filtering)
```

---

## Git Commit Message Template

```
Phase 20B-2: Admin document list UI

This commit adds the admin interface for viewing and managing customer documents.

Changes:
- src/app/admin/documents/page.tsx: List all documents with filters
- src/components/admin/DocumentTable.tsx: Reusable document table
- src/lib/documents.ts: Document query helpers
- Styling: Arabic RTL, yellow accent buttons

Features:
- Filter by customer, type, visibility
- Toggle customer_visible with confirmation
- View document metadata (no file download yet)

Testing:
- Admin logs in → sees all documents
- Filters work correctly
- Toggle visible → RLS enforces access
- No file operations (Phase 20C)

Security:
- RLS enforces admin-only access
- No exposure of internal file paths
- Confirmation required for visibility changes

Do NOT merge until:
- [ ] Admin can filter documents
- [ ] Toggle visibility works
- [ ] RLS verified via Supabase
- [ ] No Storage integration added
```

---

## Quick Reference: Atomic Commit Sequence

```bash
# Phase 20B
git commit -m "Phase 20B-1: Customer documents foundation (schema + RLS)"
git commit -m "Phase 20B-2: Admin document list UI"
git commit -m "Phase 20B-3: Customer read-only document view"
git push origin codex-mobile-booking-ui

# Phase 20C (with AI assistance)
git commit -m "Phase 20C-1: File upload validation & metadata storage"
git commit -m "Phase 20C-2: Supabase Storage integration & signed URLs"
git commit -m "Phase 20C-3: Document download endpoint"
git commit -m "Phase 20C-4: Integration tests & security verification"
git push origin codex-mobile-booking-ui

# Phase 21
git commit -m "Phase 21-1: Booking supervisor agent foundation"
git commit -m "Phase 21-2: Missing data detection"
git commit -m "Phase 21-3: Auto-reminder messaging"
git push origin codex-mobile-booking-ui
```

---

## Usage Instructions

1. **For Feature Implementation:**
   - Copy relevant prompt from this file
   - Paste into Claude Code or Cursor
   - Adjust if needed
   - Implement with high consistency

2. **For Team Communication:**
   - Share specific prompt with team
   - Ensures everyone implements same way
   - Reduces review back-and-forth

3. **For Testing:**
   - Use SQL templates to verify
   - Run integration tests from template

4. **For Commits:**
   - Use commit message template
   - Ensures atomic, clear history
