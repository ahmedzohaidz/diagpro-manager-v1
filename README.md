# DiagPro Manager V1 — Cash Flow Version

نظام إدارة ورشة السيارات (واجهة عربية RTL) — يبدأ بتدفق الحجوزات الإلكترونية.

This is **Phase 1: Project Scaffold** only. It contains the base Next.js app,
Arabic RTL layout, DiagPro visual identity, reusable UI components, placeholder
routes, and a Supabase client. No database tables, authentication, AI agents,
invoices, inventory, diagnostics, or payments are included yet.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS 3
- Supabase JS client
- Arabic RTL UI
- Brand colors: `#FFD100` (yellow) + black accents

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase environment variables

Copy the example env file and fill in your own values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

> **Note:** Only `.env.example` is committed. Never commit real keys.
> `.env.local` is git-ignored. The scaffold runs without these values, but the
> Supabase client will log a warning until they are set.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Routes

| Route                 | Arabic           | Description                          |
| --------------------- | ---------------- | ------------------------------------ |
| `/`                   | الرئيسية         | Home page with navigation            |
| `/book`               | حجز موعد         | Online booking page (placeholder)    |
| `/admin/bookings`     | الحجوزات         | Admin bookings dashboard (placeholder) |
| `/admin/work-orders`  | أوامر العمل      | Work orders dashboard (placeholder)  |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Global Arabic RTL layout (lang="ar" dir="rtl")
│   ├── globals.css                # Tailwind + base styles
│   ├── page.tsx                   # Home page
│   ├── book/page.tsx              # /book placeholder
│   └── admin/
│       ├── bookings/page.tsx      # /admin/bookings placeholder
│       └── work-orders/page.tsx   # /admin/work-orders placeholder
├── components/
│   ├── layout/SiteHeader.tsx      # Top navigation
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── StatusBadge.tsx
└── lib/
    ├── supabaseClient.ts          # Reusable Supabase client
    └── statuses.ts                # Booking & work order status labels (Arabic)
```

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint

## Database Schema (Supabase)

The initial schema lives in
[`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).
It creates only the approved V1 tables: `customers`, `vehicles`, `bookings`,
`booking_messages`, `booking_status_logs`, `work_orders`, `users`.

### Apply it manually in the Supabase SQL Editor

1. Open your project at [app.supabase.com](https://app.supabase.com).
2. In the left sidebar, go to **SQL Editor** → **New query**.
3. Open `supabase/migrations/001_initial_schema.sql`, copy its entire contents,
   and paste it into the editor.
4. Click **Run**. The script is idempotent (`create ... if not exists`), so it is
   safe to re-run.
5. Verify the tables under **Table Editor** (or **Database → Tables**).
6. Then run the integrity migration
   [`supabase/migrations/002_integrity.sql`](supabase/migrations/002_integrity.sql)
   the same way (paste → Run). It is additive and idempotent.

### Integrity migration (Phase 11)

`002_integrity.sql` strengthens data integrity without changing the approved
tables:

- Adds a **UNIQUE constraint on `work_orders.booking_id`** so the same booking
  can never be converted into two work orders (closes the race window the app's
  in-code check leaves open). Multiple `NULL` booking_ids are still allowed.
- Adds supporting indexes for work order lookups
  (`customer_id`, `vehicle_id`, `created_at`, `status`) and drops the now
  redundant non-unique `idx_work_orders_booking_id`.

> If duplicate non-null `booking_id` rows already exist, resolve them before
> running, or the UNIQUE constraint creation will fail.

### Row Level Security (RLS) — deferred

**RLS is intentionally NOT enabled yet.** With the publishable/anon key the
tables are currently open. RLS policies will be added in a **later phase, after
authentication is implemented**, so policies can be scoped to real users/roles.
Do not expose this to the public internet before RLS is in place.

After the schema exists, copy your project's API values into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

> **Security reminder:** Never commit real Supabase keys (URL is public, but the
> publishable key and any service-role key must stay out of git). Only
> `.env.example` is committed; `.env.local` is git-ignored.

## Data mode: local vs. Supabase (Phase 10)

Persistence is selected at build time by `NEXT_PUBLIC_DATA_MODE`:

| Value | Behavior |
| --- | --- |
| `local` (or unset) | Browser `localStorage` — the default; works fully offline. |
| `supabase` | Reads/writes the Supabase tables from the schema above. |

The pages never touch a storage layer directly — they import
`bookingRepository` (`src/lib/bookings/bookingRepository.ts`) and
`workOrderRepository` (`src/lib/work-orders/workOrderRepository.ts`), each of
which picks the implementation from the env var. The local repositories are
**kept** as the default/fallback.

### Run locally in Supabase mode

1. Apply the SQL schema in the Supabase SQL Editor (see above).
2. Create `.env.local` (copy from `.env.example`) with:

   ```env
   NEXT_PUBLIC_DATA_MODE=supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Restart `npm run dev`. To switch back, set `NEXT_PUBLIC_DATA_MODE=local`
   (or remove it) and restart.

> `NEXT_PUBLIC_*` vars are inlined at build/start time, so **restart the dev
> server after changing them.** Never commit `.env.local` or real keys.

## Booking Form (Phase 3 — local mode)

The `/book` page is a working Arabic RTL booking form. **In Phase 3 it persists
bookings to the browser's `localStorage`** (key: `diagpro_bookings`) — it does
**not** connect to Supabase yet. Submitting creates a booking with status
`new_request`; priority becomes `high` automatically when the car is not
drivable or has a check engine light. After submit, a WhatsApp-ready link
(plain `wa.me`) is generated to confirm the request.

Persistence is behind a `BookingRepository` interface
(`src/lib/bookings/`), so a `supabaseBookingRepository` can replace the local
one in a later phase without changing the UI. **Supabase persistence will be
connected in a later phase.**

## Work Orders (Phase 5 — local mode)

From `/admin/bookings`, a booking with status `confirmed` or `arrived` shows a
**تحويل إلى أمر عمل** button. Converting it:

- creates a work order (status `received` / "تم الاستلام") stored in
  `localStorage` under `diagpro_work_orders`, with a readable number like
  `WO-2026-0001`;
- sets the booking status to `converted_to_work_order`;
- is blocked if the booking was already converted (no duplicates).

Work orders are listed at `/admin/work-orders` with status filter and search
(by name, phone, or work order number). Persistence sits behind a
`WorkOrderRepository` interface (`src/lib/work-orders/`). **Phase 5 converts
bookings to work orders locally using localStorage; Supabase persistence will
be connected in a later phase.**

## WhatsApp Messages (Phase 6 — ready links only)

Both admin pages have per-record WhatsApp action buttons that open WhatsApp with
a prepared Arabic message:

- `/admin/bookings`: إرسال تأكيد الحجز · طلب بيانات ناقصة · إرسال تذكير ·
  إشعار وصول السيارة
- `/admin/work-orders`: إرسال رقم أمر العمل · تحديث: قيد الفحص · طلب موافقة
  العميل · إشعار جاهزية الاستلام

The message generators live in `src/lib/whatsapp/whatsappMessages.ts` and build
plain `wa.me/966535473565` links with URL-encoded text. **Phase 6 uses
WhatsApp-ready links only — the WhatsApp Business API is not implemented, and
messages are triggered manually by the admin (nothing is sent automatically).**

## Booking Customer Supervisor (Phase 8 — local rule-based)

`/admin/booking-supervisor` ("مشرف الحجز") analyzes local bookings and ranks
them by an urgency score, showing Arabic recommendations + suggested actions and
the same status / WhatsApp / convert actions used elsewhere. The logic lives in
`src/lib/booking-supervisor/`. **Phase 8 adds a local, rule-based supervisor —
it does NOT use OpenAI or any external AI API yet. Later this module can be
upgraded to a real AI agent.**

## Next Phase

**Phase 4: Admin Bookings Dashboard** — list bookings (read from the same
`BookingRepository`), filter by status, and view details.
