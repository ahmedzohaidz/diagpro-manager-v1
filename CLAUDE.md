# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DiagPro Manager V1 is an Arabic RTL auto workshop management system. The current scope is **Phase 1: Online Booking Flow only**. The project does not yet have application code — scaffolding is the first task.

## Tech Stack

- **Next.js** + **TypeScript** + **React**
- **Tailwind CSS** for styling
- **Supabase** (PostgreSQL, real-time, storage) as the backend
- Arabic RTL UI; all customer-facing text in Arabic

## Development Commands

Once scaffolded, expected commands are:

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint with zero warnings
npm run type-check   # tsc --noEmit
npm test             # Run test suite
```

For Supabase migrations:
```bash
supabase migration new <name>   # Create migration file
supabase db reset               # Reset local DB and re-run migrations
supabase db push                # Push to remote
```

## Architecture

The app uses **Next.js App Router** (`src/app/`). Key planned routes:
- `/book` — public booking form (Arabic RTL)
- `/admin/bookings` — admin dashboard
- `/api/bookings` — REST API for bookings

Data layer lives in `src/lib/supabase/`. Types in `src/types/`. Reusable components in `src/components/`.

Database tables (to be created via migrations in `supabase/migrations/`):
- `customers` → `bookings` → `work_orders` → `messages`

## Phase 1 Scope

Build only these items, in order:
1. Project scaffold (Next.js, TypeScript, Tailwind, Supabase)
2. `/book` page — public booking form
3. Admin bookings dashboard
4. Booking → work order conversion
5. WhatsApp-ready message templates

**Do not add** until explicitly requested: authentication, invoices, inventory, diagnostics, AI agents, cash flow reporting.

## Key Constraints

- All UI text in Arabic; layout uses `dir="rtl"` and `lang="ar"` on `<html>`
- Brand colors: `#FFD100` (primary) and `#000000` (accents); avoid full dark-page backgrounds
- Keep each phase small and independently runnable without errors
- No `any` TypeScript types
- After each task, report: files changed, commands run, how to test, what remains

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

WhatsApp and email env vars are deferred to later phases.
