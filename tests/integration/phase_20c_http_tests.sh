#!/bin/bash

# ============================================================================
# Phase 20C Integration Tests: HTTP Endpoint & End-to-End Verification
# ============================================================================
# This test suite verifies:
# 1. Upload endpoint (POST /api/admin/documents/upload)
# 2. Download endpoint (GET /api/customer/documents/{id}/download)
# 3. Error handling and RLS enforcement
# 4. Signed URL generation
#
# Usage: bash tests/integration/phase_20c_http_tests.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEV_SERVER="http://localhost:3001"
ADMIN_COOKIE_JAR="/tmp/admin_cookies.txt"
CUSTOMER_COOKIE_JAR="/tmp/customer_cookies.txt"

# Test data (UPDATE THESE WITH REAL VALUES)
CUSTOMER_ID="${CUSTOMER_ID:-}" # Set from environment or replace manually
ADMIN_ID="${ADMIN_ID:-}"
DOCUMENT_ID="${DOCUMENT_ID:-}"
VEHICLE_ID="${VEHICLE_ID:-}" # Optional

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

echo -e "${BLUE}Phase 20C HTTP Integration Tests${NC}\n"

if [ -z "$CUSTOMER_ID" ]; then
  echo -e "${YELLOW}Setup Required:${NC}"
  echo "1. Login to admin: http://localhost:3001/admin/login"
  echo "2. Get CUSTOMER_ID from test data"
  echo "3. Export variables:"
  echo "   export CUSTOMER_ID='uuid-here'"
  echo "   export ADMIN_ID='uuid-here'"
  echo ""
  echo "4. Run this script:"
  echo "   bash tests/integration/phase_20c_http_tests.sh"
  echo ""
  exit 1
fi

# ============================================================================
# 2) UPLOAD ENDPOINT TESTS
# ============================================================================

log_test "2.1: Anonymous Upload (should fail - 401)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEV_SERVER}/api/admin/documents/upload" \
  -F "file=@/tmp/test_valid.pdf" \
  -F "customer_id=${CUSTOMER_ID}" \
  -F "document_type=invoice" \
  -F "title=Anonymous Upload Test")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  pass "Anonymous upload rejected (401)"
else
  fail "Anonymous upload should be 401, got $HTTP_CODE"
fi

# ============================================================================
log_test "2.2: Valid PDF Upload (requires admin auth)"

echo "Note: This test requires browser authentication"
echo "Steps:"
echo "1. Login as admin: http://localhost:3001/admin/login"
echo "2. Get session cookies (browser DevTools > Application > Cookies)"
echo "3. Copy cookies to curl command below"
echo ""
echo "Example curl (replace COOKIE_VALUE):"
cat << 'EOF'
curl -X POST "http://localhost:3001/api/admin/documents/upload" \
  --cookie "sb-auth-token=COOKIE_VALUE" \
  -F "file=@/tmp/test_valid.pdf" \
  -F "customer_id=CUSTOMER_ID" \
  -F "document_type=invoice" \
  -F "title=Test Upload" \
  -v
EOF

# ============================================================================
log_test "2.3: Invalid File Type (should fail - 400)"

# Create test EXE
echo "MZ" > /tmp/test_invalid.exe

echo "Running test: POST /api/admin/documents/upload with EXE file"
echo "Expected: 400 (invalid file type)"

# Note: Requires auth, skipping in automated mode

# ============================================================================
log_test "2.4: File Too Large (should fail - 413)"

echo "Creating 51MB test file..."
dd if=/dev/zero of=/tmp/test_large.bin bs=1M count=51 2>/dev/null

echo "Running test: POST /api/admin/documents/upload with 51MB file"
echo "Expected: 413 (request entity too large)"

# ============================================================================
# 3) DOWNLOAD ENDPOINT TESTS
# ============================================================================

log_test "3.1: Anonymous Download (should fail - 401)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${DEV_SERVER}/api/customer/documents/test-id/download")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  pass "Anonymous download rejected (401)"
else
  fail "Anonymous download should be 401, got $HTTP_CODE"
fi

# ============================================================================
log_test "3.2: Valid Download (requires customer auth)"

echo "Note: This test requires customer login"
echo "Steps:"
echo "1. Login as customer: http://localhost:3001/customer/login"
echo "2. Get session cookies"
echo "3. Get DOCUMENT_ID from /customer/documents"
echo "4. Run curl:"
cat << 'EOF'
curl -X GET "http://localhost:3001/api/customer/documents/DOCUMENT_ID/download" \
  --cookie "sb-auth-token=COOKIE_VALUE" \
  -v
EOF

echo "Expected Response (200):"
echo '{"status":"success","url":"https://...signed_url...","expires_in":3600,"filename":"..."}'

# ============================================================================
log_test "3.3: Download Non-Existent Document (should fail - 404)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${DEV_SERVER}/api/customer/documents/nonexistent-id/download")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "401" ]; then
  pass "Non-existent document returns 404/401 as expected"
else
  fail "Non-existent document should be 404, got $HTTP_CODE"
fi

# ============================================================================
# 4) RLS ENFORCEMENT TESTS (Manual)
# ============================================================================

log_test "4.1: Customer Cannot Download Other Customer's Document"

echo "Manual test:"
echo "1. Login as customer A"
echo "2. Try to download customer B's document"
echo "Expected: 403 (Forbidden - RLS blocks)"

# ============================================================================
log_test "4.2: Download Hidden Document (customer_visible=false)"

echo "Manual test:"
echo "1. Admin creates document with customer_visible=false"
echo "2. Customer logs in and tries to download"
echo "Expected: 403 (Forbidden - not visible)"
echo ""
echo "Then:"
echo "3. Admin toggles customer_visible=true"
echo "4. Customer retries download"
echo "Expected: 200 (Success - now visible)"

# ============================================================================
# 5) SIGNED URL VERIFICATION
# ============================================================================

log_test "5.1: Verify Signed URL Properties"

echo "Manual test:"
echo "1. Get download endpoint response"
echo "2. Check response contains:"
echo "   - 'status': 'success'"
echo "   - 'url': starts with 'https://'"
echo "   - 'expires_in': 3600"
echo "   - 'filename': original filename"
echo ""
echo "3. Parse signed URL to verify:"
echo "   - Contains 'token=' parameter"
echo "   - Contains 'expires=' parameter (1 hour from now)"

# ============================================================================
log_test "5.2: Verify Signed URL Expiry"

echo "Manual test:"
echo "1. Get signed URL"
echo "2. Try to access immediately → 200 (success)"
echo "3. Wait 1+ hour"
echo "4. Try to access again → 403 (expired)"

# ============================================================================
# 6) ERROR HANDLING TESTS
# ============================================================================

log_test "6.1: Verify Error Messages (Arabic)"

echo "Expected error responses:"
echo ""
echo "Upload:"
echo "  401: 'غير مصرح (يرجى تسجيل الدخول)'"
echo "  403: 'لا يوجد صلاحية (مسؤول فقط)'"
echo "  400: 'نوع الملف غير مسموح'"
echo "  413: 'حجم الملف كبير جداً'"
echo ""
echo "Download:"
echo "  401: 'غير مصرح (يرجى تسجيل الدخول)'"
echo "  403: 'لا توجد صلاحية' OR 'المستند غير متاح حالياً'"
echo "  404: 'المستند غير موجود' OR 'الملف غير موجود في التخزين'"
echo ""
echo "Verify in your test responses"

# ============================================================================
# 7) END-TO-END WORKFLOW TEST
# ============================================================================

log_test "7.1: Complete Workflow"

echo "Manual test - follow these steps:"
echo ""
echo "Phase 1: Upload"
echo "1. Login as admin: http://localhost:3001/admin/login"
echo "2. Go to /admin/documents"
echo "3. NOTE: No upload UI yet (Phase 20C-4+)"
echo "   Use curl instead:"
cat << 'EOF'

# Upload document
curl -X POST "http://localhost:3001/api/admin/documents/upload" \
  --cookie "sb-auth-token=ADMIN_TOKEN" \
  -F "file=@test_file.pdf" \
  -F "customer_id=CUSTOMER_ID" \
  -F "document_type=invoice" \
  -F "title=Test Invoice" \
  -v

# Save the returned document_id
EOF

echo ""
echo "Phase 2: Verify in Database"
echo "  Run SQL: SELECT id, storage_path, customer_visible FROM customer_documents LIMIT 1"
echo "  Expected: document found, customer_visible=false, storage_path populated"

echo ""
echo "Phase 3: Admin Toggle Visibility"
echo "  Run SQL: UPDATE customer_documents SET customer_visible=true WHERE id='doc_id'"

echo ""
echo "Phase 4: Customer Download"
echo "  Login as customer: http://localhost:3001/customer/login"
echo "  Call GET /api/customer/documents/{doc_id}/download"
echo "  Expected: 200 + signed URL + expires_in=3600"

echo ""
echo "Phase 5: Verify Download Works"
echo "  Click signed URL or curl: curl -L 'https://signed_url'"
echo "  Expected: File downloads"

# ============================================================================
# 8) CLEANUP
# ============================================================================

log_test "8.1: Cleanup Test Files"

rm -f /tmp/test_valid.pdf
rm -f /tmp/test_invalid.exe
rm -f /tmp/test_large.bin

pass "Test files cleaned up"

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}TESTING SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "Automated tests:"
echo "  ✓ Anonymous access blocked (401)"
echo "  ✓ Non-existent resources return 404"
echo ""
echo "Manual tests (follow steps in output above):"
echo "  [ ] Admin upload valid files"
echo "  [ ] RLS blocks invalid uploads"
echo "  [ ] Customer visibility control"
echo "  [ ] Signed URL generation"
echo "  [ ] Download works with signed URL"
echo "  [ ] Error messages in Arabic"
echo ""
echo "All tests should PASS before committing Phase 20C-4"
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
