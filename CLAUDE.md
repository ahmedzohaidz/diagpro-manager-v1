# DiagPro Manager V1 — Cash Flow Version

## Project Goal
Build DiagPro Manager V1 — Cash Flow Version.

This is an Arabic RTL web app for managing an auto workshop, starting with the online booking flow.

The first priority is the online booking flow:
1. Capture online bookings.
2. Serve booking customers quickly.
3. Convert bookings into work orders.
4. Track each vehicle clearly.
5. Improve cash flow.

## Build Strategy
Build in very small phases only.

Do not build the full system at once.

Every task must be limited, testable, and easy to review.

After every phase, report:
1. Files changed
2. Commands run
3. How to test locally
4. Any errors or assumptions
5. Recommended next phase

## Tech Stack
Use:
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Arabic RTL UI
- Brand color: #FFD100
- Black accents

## Current Approved V1 Scope
V1 is called:
DiagPro Manager V1 — Cash Flow Version

Approved first build sequence:
1. Project Scaffold
2. Supabase Schema
3. /book Online Booking Page
4. Admin Bookings Dashboard
5. Convert Booking to Work Order
6. WhatsApp-ready booking messages
7. Booking Customer Supervisor Agent later

## Strict Scope Rules
Do not build these unless explicitly requested:
- Full AI agents
- Invoices
- Advanced diagnostics
- Inventory
- Employee rewards
- Full authentication
- Customer mobile app
- Multi-branch SaaS
- Advanced analytics
- WhatsApp Business API integration
- Payment gateway
- Autel / Launch direct integration

If a feature is not requested in the current phase, do not add it.

## First Approved Agent
The first approved future AI agent is:
Booking Customer Supervisor Agent

This agent is not part of Phase 1.

It will be added later after the booking database and admin booking flow exist.

Agent future role:
- Monitor online booking customers
- Detect missing booking data
- Send booking-related replies
- Prioritize urgent bookings
- Suggest or confirm available appointments
- Follow up with booking customers before arrival
- Help convert confirmed bookings into work orders

Agent permissions:
Allowed:
- Booking data
- Customer data
- Vehicle data
- Booking status
- Booking messages
- Appointment confirmation
- Booking follow-up

Not allowed:
- Discounts
- Final repair pricing
- Warranties
- Credit sales
- Invoice changes
- Financial promises
- Legal commitments

## UI Rules
All UI must be Arabic and RTL.

Use Arabic labels such as:
- الرئيسية
- حجز موعد
- الحجوزات
- أوامر العمل
- العملاء
- السيارات
- حالة الحجز
- تأكيد الموعد
- تحويل إلى أمر عمل

Use a clean, simple, modern UI.

Avoid full dark backgrounds for V1.

Use white/light backgrounds with black text and yellow accents.

Primary button color: #FFD100.

## Naming Rules
Use English for:
- File names
- Component names
- Variables
- Database fields
- Functions

Use Arabic for:
- UI labels
- Button text
- User-facing messages
- Displayed status names

## Booking Statuses
Use these internal booking statuses:
- new_request
- missing_data
- pending_review
- appointment_suggested
- confirmed
- reminder_sent
- arrived
- converted_to_work_order
- cancelled
- no_show

Arabic display labels:
- طلب جديد
- بيانات ناقصة
- بانتظار مراجعة الإدارة
- موعد مقترح
- موعد مؤكد
- تم إرسال تذكير
- وصل العميل
- تحول إلى أمر عمل
- ملغي
- لم يحضر

## Work Order Statuses
Use these work order statuses later:
- received
- under_inspection
- waiting_customer_approval
- under_repair
- final_test
- ready_for_pickup
- delivered
- cancelled

Arabic display labels:
- تم الاستلام
- قيد الفحص
- بانتظار موافقة العميل
- قيد الإصلاح
- اختبار نهائي
- جاهزة للاستلام
- تم التسليم
- ملغي

## Initial Database Tables
When the database phase is requested, start with these tables only:
- customers
- vehicles
- bookings
- booking_messages
- booking_status_logs
- work_orders
- users

Do not add invoices, inventory, diagnostics, or agents tables until requested.

## Booking Form Fields
The /book page should eventually collect:
- Customer name
- Phone number
- Car make
- Car model
- Car year
- Plate number optional
- Problem description
- Is the car drivable?
- Is there a check engine light?
- Preferred appointment date
- Preferred appointment time
- Optional dashboard/problem image
- Notes

## Supabase Environment Variables
Use only:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

Never commit real API keys.

Only create .env.example.

Do not create .env.local unless explicitly requested.

## WhatsApp Rules
In early V1, use WhatsApp-ready links only.

Do not implement WhatsApp Business API unless explicitly requested.

## Security Rules
Never commit:
- Real Supabase keys
- Service role keys
- API keys
- Tokens
- Private credentials

## Phase 1 Definition
Phase 1 is only:
Project Scaffold

Phase 1 includes:
1. Next.js setup
2. TypeScript
3. Tailwind CSS
4. Arabic RTL layout
5. DiagPro visual identity
6. Placeholder routes:
   - /book
   - /admin/bookings
   - /admin/work-orders
7. Reusable UI components:
   - Button
   - Card
   - Input
   - StatusBadge
8. Supabase client initialization
9. .env.example
10. README setup notes

Phase 1 does not include:
- Real database tables
- Auth
- AI agents
- Invoices
- Inventory
- Diagnostics
- Payments

## Required Final Report Format
After every task, respond with:

## Files changed
- ...

## Commands run
- ...

## How to test
- ...

## Errors or assumptions
- ...

## Recommended next phase
- ...

## Core Product Principle
This system must always support these business rules:
- No booking should be ignored.
- No car should enter without a record.
- No work should start without a clear work order.
- No repair should happen without customer approval.
- No delivery should happen without financial closure.

For V1, focus first on:
- No booking should be ignored.
- No car should enter without a record.
