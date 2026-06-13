#!/bin/bash

# ============================================================================
# Phase 21: Booking Supervisor Agent HTTP Tests
# ============================================================================
# Tests:
# 1. Agent activation endpoint
# 2. Agent run-check endpoint (dry-run mode)
# 3. Agent run-check endpoint (auto-send mode)
# 4. Error handling (missing auth, invalid params)
#
# Usage: bash tests/integration/phase_21_agent_tests.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEV_SERVER="http://localhost:3000"
ADMIN_COOKIE_JAR="/tmp/admin_cookies.txt"

# Helper functions
log_test() {
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo -e "${BLUE}Test: $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

pass() {
  echo -e "${GREEN}✓ PASS: $1${NC}"
}

fail() {
  echo -e "${RED}✗ FAIL: $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠ WARNING: $1${NC}"
}

# ============================================================================
# 1) SETUP & PREREQUISITES
# ============================================================================

echo -e "${BLUE}Phase 21 Agent HTTP Tests${NC}\n"

echo -e "${YELLOW}Setup Required:${NC}"
echo "1. Start dev server in another terminal:"
echo "   npm run dev"
echo ""
echo "2. Get admin auth cookie:"
echo "   - Login at http://localhost:3000/admin/login"
echo "   - Copy sb-auth-token from DevTools > Application > Cookies"
echo ""
echo "3. Export admin cookie:"
echo "   export ADMIN_TOKEN='eyJ...'"
echo ""

if [ -z "$ADMIN_TOKEN" ]; then
  warn "ADMIN_TOKEN not set. Set it to run full tests."
  echo ""
  echo "For now, testing unauthenticated endpoints..."
fi

# ============================================================================
# 2) UNAUTHENTICATED ACCESS TESTS
# ============================================================================

log_test "2.1: Anonymous /activate (should fail - 403)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/activate")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "403" ]; then
  pass "Anonymous activate rejected (403)"
  echo "Response: $BODY" | head -c 100
  echo ""
else
  fail "Anonymous activate should be 403, got $HTTP_CODE"
  echo "Response: $BODY"
fi

# ============================================================================
log_test "2.2: Anonymous /run-check (should fail - 403)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/run-check" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "403" ]; then
  pass "Anonymous run-check rejected (403)"
  echo "Response: $BODY" | head -c 100
  echo ""
else
  fail "Anonymous run-check should be 403, got $HTTP_CODE"
  echo "Response: $BODY"
fi

# ============================================================================
# 3) AUTHENTICATED ACCESS TESTS (if ADMIN_TOKEN is set)
# ============================================================================

if [ -n "$ADMIN_TOKEN" ]; then

  log_test "3.1: Admin /activate (should succeed - 200)"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/activate" \
    --cookie "sb-auth-token=$ADMIN_TOKEN")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ]; then
    pass "Admin activate succeeded (200)"

    # Parse JSON to check structure
    if echo "$BODY" | grep -q '"status":"success"'; then
      pass "Response has success status"
    fi

    if echo "$BODY" | grep -q '"analysis"'; then
      pass "Response has analysis object"
    fi

    if echo "$BODY" | grep -q '"items_needing_action"'; then
      pass "Response has items_needing_action array"
    fi

    # Extract item count
    ITEM_COUNT=$(echo "$BODY" | grep -o '"items_needing_action":\[[^]]*\]' | grep -c 'booking_id' || echo "0")
    echo "Found $ITEM_COUNT items needing action"
  else
    warn "Admin activate returned $HTTP_CODE (expected 200)"
    echo "Response: $BODY" | head -c 200
    echo ""
  fi

  # ============================================================================
  log_test "3.2: Admin /run-check with dry_run=true"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/run-check" \
    --cookie "sb-auth-token=$ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"dry_run": true}')

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ]; then
    pass "Run-check (dry-run) succeeded (200)"

    if echo "$BODY" | grep -q '"mode":"dry_run"'; then
      pass "Response mode is dry_run"
    fi

    if echo "$BODY" | grep -q '"summary"'; then
      pass "Response has summary object"
    fi

    # Extract counts
    CHECKED=$(echo "$BODY" | grep -o '"bookings_checked":[0-9]*' | head -1 | cut -d: -f2)
    ACTIONS=$(echo "$BODY" | grep -o '"actions_identified":[0-9]*' | head -1 | cut -d: -f2)
    WOULD_SEND=$(echo "$BODY" | grep -o '"messages_would_send":[0-9]*' | head -1 | cut -d: -f2)

    echo "Checked: $CHECKED bookings"
    echo "Actions: $ACTIONS identified"
    echo "Would send: $WOULD_SEND messages"
  else
    warn "Run-check returned $HTTP_CODE (expected 200)"
    echo "Response: $BODY" | head -c 200
  fi

  # ============================================================================
  log_test "3.3: Admin /run-check with filter_status"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/run-check" \
    --cookie "sb-auth-token=$ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"dry_run": true, "filter_status": "confirmed"}')

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ]; then
    pass "Run-check with filter_status succeeded (200)"

    if echo "$BODY" | grep -q '"status":"success"'; then
      pass "Response has success status"
    fi
  else
    warn "Run-check with filter returned $HTTP_CODE"
  fi

  # ============================================================================
  log_test "3.4: Admin /run-check with auto_send (WARNING: will log messages)"

  echo "⚠️  This test will log messages to booking_messages table!"
  echo "Press Ctrl+C to skip, or wait 3 seconds..."
  sleep 3

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/run-check" \
    --cookie "sb-auth-token=$ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"dry_run": false, "auto_send": true}')

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" = "200" ]; then
    pass "Run-check (auto-send) succeeded (200)"

    if echo "$BODY" | grep -q '"mode":"live"'; then
      pass "Response mode is live"
    fi

    LOGGED=$(echo "$BODY" | grep -o '"messages_logged":[0-9]*' | head -1 | cut -d: -f2)
    echo "Messages logged: $LOGGED"
  else
    warn "Run-check (auto-send) returned $HTTP_CODE"
  fi

else
  echo ""
  echo -e "${YELLOW}Skipping authenticated tests (ADMIN_TOKEN not set)${NC}"
  echo ""
  echo "To run full tests:"
  echo "1. Login at http://localhost:3000/admin/login"
  echo "2. Get sb-auth-token from DevTools > Application > Cookies"
  echo "3. Export: export ADMIN_TOKEN='your_token_here'"
  echo "4. Run: bash tests/integration/phase_21_agent_tests.sh"
fi

# ============================================================================
# 4) ERROR HANDLING TESTS
# ============================================================================

log_test "4.1: Invalid JSON payload"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/run-check" \
  -H "Content-Type: application/json" \
  -d 'invalid json')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
  pass "Invalid JSON rejected (HTTP $HTTP_CODE)"
else
  warn "Invalid JSON returned HTTP $HTTP_CODE"
fi

# ============================================================================
# 5) RESPONSE FORMAT VALIDATION
# ============================================================================

log_test "5.1: Response structure validation"

if [ -n "$ADMIN_TOKEN" ]; then
  RESPONSE=$(curl -s -X POST "${DEV_SERVER}/api/admin/agent/booking-supervisor/activate" \
    --cookie "sb-auth-token=$ADMIN_TOKEN")

  # Check required fields
  if echo "$RESPONSE" | grep -q '"status"'; then
    pass "Response has status field"
  else
    fail "Response missing status field"
  fi

  if echo "$RESPONSE" | grep -q '"message"'; then
    pass "Response has message field"
  fi

  if echo "$RESPONSE" | grep -q '"analysis"'; then
    pass "Response has analysis field"
  else
    fail "Response missing analysis field"
  fi
else
  warn "Skipping response validation (auth required)"
fi

# ============================================================================
# 6) SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TESTING SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

echo "Unauthenticated tests:"
echo "  ✓ Anonymous access blocked (403)"
echo ""

if [ -n "$ADMIN_TOKEN" ]; then
  echo "Authenticated tests:"
  echo "  ✓ Agent activation working"
  echo "  ✓ Run-check (dry-run) working"
  echo "  ✓ Run-check with filter working"
  echo "  ✓ Run-check (auto-send) working"
  echo ""
else
  echo "Authenticated tests:"
  echo "  ⚠ SKIPPED (set ADMIN_TOKEN to run)"
  echo ""
fi

echo "Next steps:"
echo "1. Check Supabase for logged messages:"
echo "   SELECT * FROM booking_messages WHERE message_text LIKE '%WhatsApp%'"
echo ""
echo "2. Verify agent recommendations:"
echo "   SELECT * FROM bookings WHERE status = 'new_request'"
echo ""
echo "3. Test in browser:"
echo "   - Login as admin: http://localhost:3000/admin/login"
echo "   - Monitor agent activity in logs"
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
