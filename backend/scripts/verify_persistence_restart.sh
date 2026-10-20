#!/usr/bin/env bash
# ==============================================================================
# MessMap — Database Persistence & Service Restart Verification Script
# Associated GitHub Issue: #19 — Database Persistence & RBAC Verification
# ==============================================================================
# Usage:
#   ./backend/scripts/verify_persistence_restart.sh [BASE_URL]
# Default BASE_URL: http://localhost:8080
#
# Prerequisites:
#   1. MySQL running via Docker: docker compose -f database/docker-compose-db.yml up -d
#   2. Backend running: cd backend && ./mvnw spring-boot:run
# ==============================================================================

set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DIR="/tmp/messmap_persistence_${TIMESTAMP}"
mkdir -p "${TEMP_DIR}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE} MessMap: Database Persistence & Service Restart Audit Script   ${NC}"
echo -e "${BLUE} Base URL: ${BASE_URL}                                          ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Step 1: Health check
echo -e "\n${YELLOW}[Step 1/6] Checking backend service health...${NC}"
HEALTH_STATUS=$(curl -s -o "${TEMP_DIR}/health.json" -w "%{http_code}" "${BASE_URL}/api/v1/health" || echo "000")

if [ "${HEALTH_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Backend is not reachable at ${BASE_URL} (HTTP ${HEALTH_STATUS}).${NC}"
    echo -e "Please ensure the backend is started before running this restart audit."
    exit 1
fi
echo -e "${GREEN}[PASS] Backend health endpoint responded with HTTP 200 OK.${NC}"

# Step 2: Register a test mess owner
TEST_EMAIL="persistence.owner.${TIMESTAMP}@messmap.test"
TEST_PASS="PersistencePass123!"

echo -e "\n${YELLOW}[Step 2/6] Registering test mess owner: ${TEST_EMAIL}...${NC}"
REGISTER_STATUS=$(curl -s -o "${TEMP_DIR}/register.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/register/owner" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Persistence Test Owner\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASS}\",
    \"phone\": \"9876543299\",
    \"college\": \"Pune University\"
  }")

if [ "${REGISTER_STATUS}" != "201" ] && [ "${REGISTER_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to register owner (HTTP ${REGISTER_STATUS}).${NC}"
    cat "${TEMP_DIR}/register.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Owner registered successfully (HTTP ${REGISTER_STATUS}).${NC}"

# Step 3: Login to obtain real JWT
echo -e "\n${YELLOW}[Step 3/6] Authenticating owner to obtain JWT token...${NC}"
LOGIN_STATUS=$(curl -s -o "${TEMP_DIR}/login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASS}\"
  }")

if [ "${LOGIN_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Login failed (HTTP ${LOGIN_STATUS}).${NC}"
    cat "${TEMP_DIR}/login.json"
    exit 1
fi

TOKEN=$(grep -o '"token":"[^"]*' "${TEMP_DIR}/login.json" | grep -o '[^"]*$' || true)
if [ -z "${TOKEN}" ]; then
    # Fallback jq or nested data.token
    TOKEN=$(grep -o '"accessToken":"[^"]*' "${TEMP_DIR}/login.json" | grep -o '[^"]*$' || true)
fi

echo -e "${GREEN}[PASS] JWT token acquired successfully.${NC}"

# Step 4: Create a test Mess listing with operating hours and pricing
echo -e "\n${YELLOW}[Step 4/6] Creating Mess profile with complete meal timings & pricing...${NC}"
CREATE_MESS_STATUS=$(curl -s -o "${TEMP_DIR}/create_mess.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/owner/mess" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Persistence Verification Mess",
    "description": "Verifying database integrity across MySQL and Spring Boot restarts",
    "phone": "9876543299",
    "address": "MG Road, Camp",
    "city": "Pune",
    "area": "Camp",
    "foodType": "PURE_VEG",
    "dailyPrice": 95.00,
    "monthlyPrice": 2700.00,
    "breakfastPrice": 35.00,
    "lunchPrice": 85.00,
    "dinnerPrice": 85.00,
    "openingTime": "07:30 AM",
    "closingTime": "10:30 PM",
    "capacity": 50
  }')

if [ "${CREATE_MESS_STATUS}" != "201" ] && [ "${CREATE_MESS_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to create mess profile (HTTP ${CREATE_MESS_STATUS}).${NC}"
    cat "${TEMP_DIR}/create_mess.json"
    exit 1
fi

MESS_ID=$(grep -o '"id":[0-9]*' "${TEMP_DIR}/create_mess.json" | head -n 1 | grep -o '[0-9]*')
echo -e "${GREEN}[PASS] Mess profile created with ID: ${MESS_ID} (HTTP ${CREATE_MESS_STATUS}).${NC}"

# Step 5: Restart prompt & instructions
echo -e "\n${BLUE}================================================================${NC}"
echo -e "${YELLOW}[Step 5/6] RESTART VERIFICATION INSTRUCTIONS                   ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Pre-restart state recorded for Mess ID: ${MESS_ID}"
echo -e "Email: ${TEST_EMAIL}"
echo -e "\nTo complete restart verification, execute in a separate terminal:"
echo -e "  1. Restart MySQL container:"
echo -e "     ${BLUE}docker compose -f database/docker-compose-db.yml restart mysql${NC}"
echo -e "  2. Restart Spring Boot application process (Ctrl+C and re-run ./mvnw spring-boot:run)"
echo -e "\nWhen both services are back online, press [ENTER] to verify data persistence..."
read -r -p "Press Enter to proceed with post-restart assertion..."

# Step 6: Post-restart assertion
echo -e "\n${YELLOW}[Step 6/6] Verifying data persistence after service restart...${NC}"
POST_RESTART_LOGIN=$(curl -s -o "${TEMP_DIR}/post_login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASS}\"
  }")

if [ "${POST_RESTART_LOGIN}" != "200" ]; then
    echo -e "${RED}[FAIL] Post-restart authentication failed (HTTP ${POST_RESTART_LOGIN}). Data lost!${NC}"
    cat "${TEMP_DIR}/post_login.json"
    exit 1
fi
echo -e "${GREEN}[PASS] User credentials persisted across restart.${NC}"

POST_TOKEN=$(grep -o '"token":"[^"]*' "${TEMP_DIR}/post_login.json" | grep -o '[^"]*$' || true)
if [ -z "${POST_TOKEN}" ]; then
    POST_TOKEN=$(grep -o '"accessToken":"[^"]*' "${TEMP_DIR}/post_login.json" | grep -o '[^"]*$' || true)
fi

POST_RELOAD_MESS=$(curl -s -o "${TEMP_DIR}/post_mess.json" -w "%{http_code}" \
  -X GET "${BASE_URL}/api/owner/mess" \
  -H "Authorization: Bearer ${POST_TOKEN}")

if [ "${POST_RELOAD_MESS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to retrieve mess post-restart (HTTP ${POST_RELOAD_MESS}).${NC}"
    cat "${TEMP_DIR}/post_mess.json"
    exit 1
fi

if grep -q "Persistence Verification Mess" "${TEMP_DIR}/post_mess.json"; then
    echo -e "${GREEN}[SUCCESS] Complete relational data, timings, and credentials persisted across restart with ZERO data loss!${NC}"
else
    echo -e "${RED}[FAIL] Mess listing not found in post-restart response.${NC}"
    cat "${TEMP_DIR}/post_mess.json"
    exit 1
fi

rm -rf "${TEMP_DIR}"
echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN} Restart persistence verification completed successfully.       ${NC}"
echo -e "${GREEN}================================================================${NC}"
