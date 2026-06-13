#!/bin/bash

# ============================================================================
# Phase 22-3: Quick Verification Tests
# ============================================================================

echo "==============================================="
echo "Phase 22-3: WhatsApp Integration Testing"
echo "==============================================="
echo ""

PASS=0
FAIL=0

# Test 1: Files exist
echo "1. Files Check:"
files=(
  "src/lib/whatsapp/whatsapp-service.ts"
  "src/lib/whatsapp/types.ts"
  "src/app/admin/messages/page.tsx"
  "src/lib/agents/booking-supervisor-agent.ts"
  "supabase/migrations/010_whatsapp_message_queue.sql"
  "PHASE_23_TEST_GUIDE.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
    ((PASS++))
  else
    echo "  ✗ $file MISSING"
    ((FAIL++))
  fi
done

echo ""
echo "2. Code Quality:"

# Test 2: Agent imports WhatsApp service
if grep -q "whatsappService" src/lib/agents/booking-supervisor-agent.ts; then
  echo "  ✓ Agent imports WhatsApp service"
  ((PASS++))
else
  echo "  ✗ Agent missing WhatsApp import"
  ((FAIL++))
fi

# Test 3: Agent calls queueMessage
if grep -q "queueMessage" src/lib/agents/booking-supervisor-agent.ts; then
  echo "  ✓ Agent queues messages"
  ((PASS++))
else
  echo "  ✗ Agent doesn't queue messages"
  ((FAIL++))
fi

# Test 4: Agent calls simulateDelivery
if grep -q "simulateDelivery" src/lib/agents/booking-supervisor-agent.ts; then
  echo "  ✓ Agent simulates delivery"
  ((PASS++))
else
  echo "  ✗ Agent missing delivery simulation"
  ((FAIL++))
fi

# Test 5: Dashboard has QR code
if grep -q "QRCode" src/app/admin/messages/page.tsx; then
  echo "  ✓ Dashboard generates QR codes"
  ((PASS++))
else
  echo "  ✗ Dashboard missing QR code"
  ((FAIL++))
fi

# Test 6: Service exports singleton
if grep -q "export const whatsappService" src/lib/whatsapp/whatsapp-service.ts; then
  echo "  ✓ WhatsApp service exports singleton"
  ((PASS++))
else
  echo "  ✗ Service export missing"
  ((FAIL++))
fi

echo ""
echo "3. Database Schema:"

# Test 7: Migration creates table
if grep -qi "create table.*whatsapp_message_queue" supabase/migrations/010_whatsapp_message_queue.sql; then
  echo "  ✓ Migration creates table"
  ((PASS++))
else
  echo "  ✗ Migration missing table creation"
  ((FAIL++))
fi

# Test 8: Migration has status constraint
if grep -qi "check.*status" supabase/migrations/010_whatsapp_message_queue.sql; then
  echo "  ✓ Status constraint defined"
  ((PASS++))
else
  echo "  ✗ Status constraint missing"
  ((FAIL++))
fi

# Test 9: Migration adds linking columns
if grep -q "whatsapp_message_id" supabase/migrations/010_whatsapp_message_queue.sql; then
  echo "  ✓ booking_messages linking added"
  ((PASS++))
else
  echo "  ✗ Linking columns missing"
  ((FAIL++))
fi

echo ""
echo "4. API Endpoints:"

# Test 10: Queue endpoint exists
if [ -f src/app/api/admin/messages/queue/route.ts ]; then
  echo "  ✓ Queue API endpoint exists"
  ((PASS++))
else
  echo "  ✗ Queue endpoint missing"
  ((FAIL++))
fi

# Test 11: Send endpoint exists
if [ -f src/app/api/admin/messages/send/route.ts ]; then
  echo "  ✓ Send API endpoint exists"
  ((PASS++))
else
  echo "  ✗ Send endpoint missing"
  ((FAIL++))
fi

# Test 12: Queue endpoint has GET
if grep -q "export async function GET" src/app/api/admin/messages/queue/route.ts; then
  echo "  ✓ Queue GET handler present"
  ((PASS++))
else
  echo "  ✗ Queue GET handler missing"
  ((FAIL++))
fi

# Test 13: Send endpoint has POST
if grep -q "export async function POST" src/app/api/admin/messages/send/route.ts; then
  echo "  ✓ Send POST handler present"
  ((PASS++))
else
  echo "  ✗ Send POST handler missing"
  ((FAIL++))
fi

echo ""
echo "5. Dev Server:"

# Test 14: Server is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/admin/messages | grep -q "307\|200"; then
  echo "  ✓ Dev server responding"
  ((PASS++))
else
  echo "  ✗ Dev server not responding"
  ((FAIL++))
fi

echo ""
echo "6. Git Status:"

# Test 15: Files are committed
git_status=$(git status --porcelain src/lib/agents/booking-supervisor-agent.ts)
if [ -z "$git_status" ]; then
  echo "  ✓ Agent changes committed"
  ((PASS++))
else
  echo "  ⚠ Agent changes not committed"
fi

echo ""
echo "==============================================="
echo "Results: $PASS passed, $FAIL failed"
echo "==============================================="

if [ $FAIL -eq 0 ]; then
  echo ""
  echo "✓ All checks passed!"
  echo ""
  echo "Next steps:"
  echo "  1. Create test booking in Supabase"
  echo "  2. Queue message via API"
  echo "  3. Verify in admin dashboard"
  echo "  4. Mark as sent and check auto-delivery"
  echo "  5. Run agent and verify integration"
  echo ""
  exit 0
else
  echo ""
  echo "✗ Some checks failed. Please review above."
  exit 1
fi
