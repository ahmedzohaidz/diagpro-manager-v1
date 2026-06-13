# Phase 21-3: Testing & Verification Guide

## Overview

Phase 21-3 provides comprehensive testing for the Booking Supervisor Agent (Phase 21-1 & 21-2).

**Test Files:**
- `tests/integration/phase_21_agent_tests.sql` — SQL test suite (150 assertions)
- `tests/integration/phase_21_agent_tests.sh` — HTTP endpoint tests
- `tests/integration/phase_21_cron_tests.sh` — Cron trigger tests
- `tests/integration/phase_21_integration_tests.sql` — End-to-end integration tests

**Estimated Time:** 1.5-2 hours (manual execution)

---

## Test Suite Overview

### 1. Phase 21-1: Agent Foundation Tests

**File:** `tests/integration/phase_21_agent_tests.sql`

Tests the basic agent endpoints and logic.

```bash
# Run in Supabase SQL Editor
cat tests/integration/phase_21_agent_tests.sql
```

**Test Coverage:**
- ✅ Data setup (4 test bookings)
- ✅ Data integrity
- ✅ Missing data detection
- ✅ Urgency scoring
- ✅ Message logging
- ✅ Reminder eligibility
- ✅ Complete data detection

---

### 2. Phase 21-1: HTTP Endpoint Tests

**File:** `tests/integration/phase_21_agent_tests.sh`

Tests the API endpoints.

```bash
# Ensure dev server running on port 3005
npm run dev

# In another terminal:
bash tests/integration/phase_21_agent_tests.sh
```

**Test Coverage:**
- ✅ Anonymous access blocked (403)
- ✅ Valid endpoint responses
- ✅ Error handling
- ✅ Response format validation

**Expected Output:**
```
✓ PASS: Anonymous activate rejected (403)
✓ PASS: Anonymous run-check rejected (403)
✓ PASS: Invalid JSON rejected (HTTP 403)
```

---

### 3. Phase 21-2: Cron Trigger Tests

**File:** `tests/integration/phase_21_cron_tests.sh`

Tests the cron endpoint and agent execution.

```bash
# Set cron secret (from .env.local)
export CRON_SECRET='your-secret-here'

# Run tests
bash tests/integration/phase_21_cron_tests.sh
```

**Test Coverage:**
- ✅ Authentication (correct/wrong/missing)
- ✅ Agent execution
- ✅ Response metrics validation
- ✅ Message logging verification
- ✅ Security (no sensitive data)
- ✅ Performance (< 5s execution)

**Expected Output:**
```
✓ PASS: Unauthenticated cron blocked (401)
✓ PASS: Wrong secret rejected (401)
✓ PASS: Authenticated cron succeeded (200)
✓ PASS: Response has success status
✓ PASS: Agent executed in XXXms (< 5s)
```

---

### 4. Phase 21-3: Integration Tests

**File:** `tests/integration/phase_21_integration_tests.sql`

Tests end-to-end message flow and data consistency.

```bash
# Run in Supabase SQL Editor
cat tests/integration/phase_21_integration_tests.sql
```

**Test Coverage:**
- ✅ Message logging (outbound/WhatsApp)
- ✅ Message content (Arabic validation)
- ✅ Message timestamps
- ✅ Booking linking
- ✅ Relationship integrity
- ✅ Agent run tracking
- ✅ Rule validation (missing data, reminders, confirmations)
- ✅ Data consistency (orphan detection)
- ✅ Performance metrics
- ✅ Message distribution by status

---

## Step-by-Step Execution

### Prerequisites

```bash
# 1. Ensure environment setup
echo $CRON_SECRET  # Should be set
echo $NEXT_PUBLIC_SUPABASE_URL  # Should be set

# 2. Start dev server (if running HTTP tests)
npm run dev
# Server will be on port 3005

# 3. Open Supabase SQL Editor
# https://app.supabase.com/projects/mdgelkvneenpevyjjtls/sql/new
```

---

### Test Execution Plan

#### **Phase 1: SQL Data Setup (5 min)**

```bash
# Run: tests/integration/phase_21_agent_tests.sql (Section 0)
# This creates 4 test bookings with different statuses

Expected Result:
✓ Test booking 1: new_request (high priority)
✓ Test booking 2: missing_data (missing phone)
✓ Test booking 3: confirmed (booking tomorrow)
✓ Test booking 4: appointment_suggested
```

---

#### **Phase 2: HTTP Endpoint Tests (10 min)**

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Run HTTP tests
bash tests/integration/phase_21_agent_tests.sh

Expected Result:
✓ All anonymous tests pass (403)
✓ Error handling working
✓ Server responding
```

---

#### **Phase 3: Cron Trigger Tests (15 min)**

```bash
# Terminal 3: Run cron tests
bash tests/integration/phase_21_cron_tests.sh

Expected Result:
✓ Authentication: 401/401/200/200 responses
✓ Agent execution: Success + valid metrics
✓ Response format: All fields present
✓ Performance: < 5 seconds
```

---

#### **Phase 4: Integration Tests (20 min)**

```bash
# Back in Supabase SQL Editor
# Run: tests/integration/phase_21_integration_tests.sql

# This validates:
✓ Messages logged correctly
✓ Bookings linked properly
✓ Agent runs tracked
✓ Rules applied correctly
✓ Data consistent
✓ No orphans
✓ Performance good
```

---

### Manual Verification Checklist

#### **Message Flow Testing**

- [ ] Create a new booking with missing phone
  - [ ] Trigger agent manually
  - [ ] Verify message logged in `booking_messages`
  - [ ] Check message starts with "السلام عليكم"

- [ ] Create a confirmed booking for tomorrow
  - [ ] Trigger agent
  - [ ] Verify reminder message logged
  - [ ] Check message mentions appointment time

- [ ] Create appointment_suggested booking
  - [ ] Trigger agent
  - [ ] Verify confirmation request message
  - [ ] Check message asks for confirmation

#### **Dashboard Testing**

- [ ] Navigate to `/admin/agent-activity`
  - [ ] Page loads (< 2 seconds)
  - [ ] Summary cards display
  - [ ] Agent runs listed
  - [ ] Recent messages table populated
  - [ ] Auto-refresh working (check 5 min interval)

#### **Database Validation**

```sql
-- Check messages table
SELECT COUNT(*) FROM booking_messages WHERE direction = 'outbound';
-- Should be > 0 after agent runs

-- Check agent logs
SELECT COUNT(*) FROM booking_status_logs WHERE new_status = 'agent_run';
-- Should increase after each trigger

-- Check for orphans
SELECT COUNT(*) FROM booking_messages 
WHERE booking_id NOT IN (SELECT id FROM bookings);
-- Should be 0

-- Check message content
SELECT message_text FROM booking_messages 
WHERE direction = 'outbound' LIMIT 1;
-- Should contain Arabic text
```

---

## Expected Test Results

### Successful Cron Test Output

```
═══════════════════════════════════════
Test: 1.1: Unauthenticated cron request
═══════════════════════════════════════
✓ PASS: Unauthenticated cron blocked (401)

═══════════════════════════════════════
Test: 1.3: Cron request with correct secret
═══════════════════════════════════════
✓ PASS: Authenticated cron succeeded (200)
✓ PASS: Response has success status
✓ PASS: Response has timestamp
✓ PASS: Response has summary
Bookings analyzed: 45
Actions identified: 12
Messages logged: 12

═══════════════════════════════════════
Test: 2.1: Agent runs without errors
═══════════════════════════════════════
✓ PASS: Agent execution successful

═══════════════════════════════════════
TESTING SUMMARY
═══════════════════════════════════════
Cron Authentication:
  ✓ Unauthenticated blocked (401)
  ✓ Wrong secret blocked (401)
  ✓ Correct secret accepted (200)
  ✓ Query parameter works

Agent Execution:
  ✓ Runs without errors
  ✓ Returns valid metrics
  ✓ Response structure valid

Security:
  ✓ No sensitive data exposed
  ✓ Only POST method allowed
```

---

## Troubleshooting

### Cron Tests Fail (401 Unauthorized)

**Problem:** Authentication failing

**Solution:**
```bash
# 1. Check CRON_SECRET is set
echo $CRON_SECRET

# 2. Ensure secret matches in environment
# .env.local should have CRON_SECRET set

# 3. Verify header format
curl -X POST http://localhost:3005/api/cron/booking-supervisor \
  -H "Authorization: Bearer correct-secret"
```

---

### Agent Tests Show 0 Bookings Analyzed

**Problem:** No bookings in database

**Solution:**
```bash
# 1. Check if bookings exist
SELECT COUNT(*) FROM bookings;

# 2. Create test bookings (Phase 21-1 SQL test)
# Run: tests/integration/phase_21_agent_tests.sql (Section 0)

# 3. Re-run agent
bash tests/integration/phase_21_cron_tests.sh
```

---

### Dashboard Not Loading

**Problem:** Page shows error or blank

**Solution:**
```bash
# 1. Check server is running
curl http://localhost:3005 -I

# 2. Check browser console for errors
# DevTools > Console tab

# 3. Verify database connection
# Check .env.local has SUPABASE_URL and PUBLISHABLE_KEY

# 4. Restart server
pkill -f "next dev"
npm run dev
```

---

### Messages Not Logging

**Problem:** Agent runs but no messages appear

**Solution:**
```bash
# 1. Check booking_messages table
SELECT * FROM booking_messages LIMIT 10;

# 2. Verify booking data is complete
SELECT id, customer_full_name, phone_number, status
FROM bookings LIMIT 5;

# 3. Check agent run logs for errors
SELECT * FROM booking_status_logs 
WHERE new_status = 'agent_run' 
ORDER BY created_at DESC LIMIT 1;

# 4. Verify RLS policies allow insert
-- Should be inserting as service_role (agent context)
```

---

## Performance Expectations

| Metric | Expected | Acceptable | Poor |
|--------|----------|-----------|------|
| Agent execution | < 3s | < 5s | > 10s |
| Cron endpoint response | < 5s | < 10s | > 15s |
| Dashboard load | < 2s | < 3s | > 5s |
| Message logging | < 1s | < 2s | > 5s |
| SQL queries | < 500ms | < 1s | > 2s |

---

## Success Criteria

✅ **Phase 21-3 Complete When:**

- [ ] All HTTP endpoint tests pass (6/6)
- [ ] All cron trigger tests pass (8/8)
- [ ] All integration tests pass (15+)
- [ ] Messages logged to database
- [ ] Agent runs tracked in logs
- [ ] Dashboard displays data
- [ ] Auto-refresh working
- [ ] No orphan records
- [ ] Performance within limits
- [ ] All data consistent

---

## Next Steps

After successful Phase 21-3 testing:

1. **Push to GitHub**
   ```bash
   git push origin codex-mobile-booking-ui
   ```

2. **Create Pull Request**
   - Title: "Phase 21: Booking Supervisor Agent (Complete)"
   - Include test results
   - Link to test files

3. **Code Review**
   - Security review
   - Performance review
   - Architecture review

4. **Merge to Main**
   - After approval
   - Delete branch
   - Deploy to production

---

## Test File Locations

```
tests/
├── integration/
│   ├── phase_21_agent_tests.sql (150+ lines, 7 suites)
│   ├── phase_21_agent_tests.sh (390+ lines, 6 tests)
│   ├── phase_21_cron_tests.sh (350+ lines, 8 tests)
│   └── phase_21_integration_tests.sql (400+ lines, 7 suites)
```

---

## Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 21-1: Foundation | 45 min | ✅ Complete |
| Phase 21-2: Cron & Auto | 60 min | ✅ Complete |
| Phase 21-3: Testing | 90 min | 🔄 In Progress |
| **Total** | **195 min (3.25 hrs)** | - |

---

End of Phase 21-3 Test Guide
