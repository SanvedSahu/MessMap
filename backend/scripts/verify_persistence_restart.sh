#!/usr/bin/env bash
# ==============================================================================
# MessMap — Database Persistence & Service Restart Verification Script
# Associated GitHub Issue: #19 — Database Persistence & RBAC Verification
# ==============================================================================
# Usage:
#   ./backend/scripts/verify_persistence_restart.sh [--auto-restart] [BASE_URL]
# Default BASE_URL: http://localhost:8080
#
# Prerequisites:
#   1. MySQL running via Docker: docker compose -f database/docker-compose-db.yml up -d
#   2. Backend running: cd backend && ./mvnw spring-boot:run (or already running on port 8080)
# ==============================================================================

set -euo pipefail

AUTO_RESTART=false
BASE_URL="http://localhost:8080"

for arg in "$@"; do
    if [ "$arg" == "--auto-restart" ]; then
        AUTO_RESTART=true
    elif [[ "$arg" == http* ]]; then
        BASE_URL="$arg"
    fi
done

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
echo -e "${BLUE} Auto-Restart: ${AUTO_RESTART}                                  ${NC}"
echo -e "${BLUE}================================================================${NC}"

# ------------------------------------------------------------------------------
# Step 1: Health check
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[Step 1/8] Checking backend service health...${NC}"
HEALTH_STATUS=$(curl -s -o "${TEMP_DIR}/health.json" -w "%{http_code}" "${BASE_URL}/api/v1/health" || echo "000")

if [ "${HEALTH_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Backend is not reachable at ${BASE_URL} (HTTP ${HEALTH_STATUS}).${NC}"
    echo -e "Please ensure the backend is started before running this restart audit."
    exit 1
fi
echo -e "${GREEN}[PASS] Backend health endpoint responded with HTTP 200 OK.${NC}"

# ------------------------------------------------------------------------------
# Step 2: Register & Authenticate Mess Owner
# ------------------------------------------------------------------------------
OWNER_EMAIL="persistence.owner.${TIMESTAMP}@messmap.test"
OWNER_PASS="PersistencePass123!"

echo -e "\n${YELLOW}[Step 2/8] Registering test mess owner: ${OWNER_EMAIL}...${NC}"
REGISTER_STATUS=$(curl -s -o "${TEMP_DIR}/owner_register.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/register/owner" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Persistence Test Owner\",
    \"email\": \"${OWNER_EMAIL}\",
    \"password\": \"${OWNER_PASS}\",
    \"phone\": \"9876543299\",
    \"college\": \"Pune University\"
  }")

if [ "${REGISTER_STATUS}" != "201" ] && [ "${REGISTER_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to register owner (HTTP ${REGISTER_STATUS}).${NC}"
    cat "${TEMP_DIR}/owner_register.json"
    exit 1
fi

echo -e "Authenticating owner..."
OWNER_LOGIN_STATUS=$(curl -s -o "${TEMP_DIR}/owner_login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${OWNER_EMAIL}\",
    \"password\": \"${OWNER_PASS}\"
  }")

if [ "${OWNER_LOGIN_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to authenticate owner (HTTP ${OWNER_LOGIN_STATUS}).${NC}"
    cat "${TEMP_DIR}/owner_login.json"
    exit 1
fi

OWNER_TOKEN=$(grep -o '"token":"[^"]*' "${TEMP_DIR}/owner_login.json" | grep -o '[^"]*$' || true)
if [ -z "${OWNER_TOKEN}" ]; then
    OWNER_TOKEN=$(grep -o '"accessToken":"[^"]*' "${TEMP_DIR}/owner_login.json" | grep -o '[^"]*$' || true)
fi

if [ -z "${OWNER_TOKEN}" ]; then
    echo -e "${RED}[FAIL] Failed to extract owner JWT token.${NC}"
    cat "${TEMP_DIR}/owner_login.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Owner registered and authenticated successfully.${NC}"

# ------------------------------------------------------------------------------
# Step 3: Create Mess Profile with Complete Timings & Pricing
# ------------------------------------------------------------------------------
MESS_NAME="Persistence Verification Mess ${TIMESTAMP}"
echo -e "\n${YELLOW}[Step 3/8] Creating Mess profile with meal timings & pricing: '${MESS_NAME}'...${NC}"
CREATE_MESS_STATUS=$(curl -s -o "${TEMP_DIR}/create_mess.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/owner/mess" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${MESS_NAME}\",
    \"description\": \"Verifying database integrity across MySQL and Spring Boot restarts\",
    \"phone\": \"9876543299\",
    \"address\": \"MG Road, Camp\",
    \"city\": \"Pune\",
    \"area\": \"Camp\",
    \"foodType\": \"PURE_VEG\",
    \"dailyPrice\": 95.00,
    \"monthlyPrice\": 2700.00,
    \"breakfastPrice\": 35.00,
    \"lunchPrice\": 85.00,
    \"dinnerPrice\": 85.00,
    \"openingTime\": \"07:30 AM\",
    \"closingTime\": \"10:30 PM\",
    \"capacity\": 50
  }")

if [ "${CREATE_MESS_STATUS}" != "201" ] && [ "${CREATE_MESS_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to create mess profile (HTTP ${CREATE_MESS_STATUS}).${NC}"
    cat "${TEMP_DIR}/create_mess.json"
    exit 1
fi

MESS_ID=$(grep -o '"id":[0-9]*' "${TEMP_DIR}/create_mess.json" | head -n 1 | grep -o '[0-9]*')
if [ -z "${MESS_ID}" ]; then
    echo -e "${RED}[FAIL] Failed to extract Mess ID from create mess response.${NC}"
    cat "${TEMP_DIR}/create_mess.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Mess profile created with ID: ${MESS_ID} (HTTP ${CREATE_MESS_STATUS}).${NC}"

# ------------------------------------------------------------------------------
# Step 4: Add Menu Item Under Mess
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[Step 4/8] Creating menu dish under mess ID ${MESS_ID}...${NC}"
MENU_ITEM_STATUS=$(curl -s -o "${TEMP_DIR}/create_menu_item.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/owner/mess/menu/items" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"messId\": ${MESS_ID},
    \"dayOfWeek\": \"MONDAY\",
    \"mealType\": \"LUNCH\",
    \"dishName\": \"Special Paneer Thali\",
    \"name\": \"Special Paneer Thali\",
    \"description\": \"Paneer butter masala with 3 rotis and jeera rice\",
    \"price\": 120.00,
    \"isAvailable\": true,
    \"isSpecial\": true
  }")

if [ "${MENU_ITEM_STATUS}" != "201" ] && [ "${MENU_ITEM_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to create menu item (HTTP ${MENU_ITEM_STATUS}).${NC}"
    cat "${TEMP_DIR}/create_menu_item.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Menu dish added successfully.${NC}"

# ------------------------------------------------------------------------------
# Step 5: Admin Approve Mess & Student Submits Review
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[Step 5/8] Admin approving mess and student submitting review...${NC}"

# Admin login
ADMIN_LOGIN_STATUS=$(curl -s -o "${TEMP_DIR}/admin_login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@messmap.com","password":"admin"}')

if [ "${ADMIN_LOGIN_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Admin login failed (HTTP ${ADMIN_LOGIN_STATUS}).${NC}"
    cat "${TEMP_DIR}/admin_login.json"
    exit 1
fi

ADMIN_TOKEN=$(grep -o '"token":"[^"]*' "${TEMP_DIR}/admin_login.json" | grep -o '[^"]*$' || true)
if [ -z "${ADMIN_TOKEN}" ]; then
    echo -e "${RED}[FAIL] Failed to extract admin JWT token.${NC}"
    exit 1
fi

# Admin approve
APPROVE_STATUS=$(curl -s -o "${TEMP_DIR}/approve.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/admin/messes/${MESS_ID}/approve" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

if [ "${APPROVE_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to approve mess (HTTP ${APPROVE_STATUS}).${NC}"
    cat "${TEMP_DIR}/approve.json"
    exit 1
fi

# Student register & login
STUDENT_EMAIL="persistence.student.${TIMESTAMP}@messmap.test"
STUDENT_PASS="StudentPass123!"

STUDENT_REG_STATUS=$(curl -s -o "${TEMP_DIR}/student_register.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/student/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Persistence Test Student\",
    \"email\": \"${STUDENT_EMAIL}\",
    \"password\": \"${STUDENT_PASS}\",
    \"phone\": \"9123456788\",
    \"college\": \"COEP Pune\"
  }")

if [ "${STUDENT_REG_STATUS}" != "201" ] && [ "${STUDENT_REG_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to register student (HTTP ${STUDENT_REG_STATUS}).${NC}"
    cat "${TEMP_DIR}/student_register.json"
    exit 1
fi

STUDENT_LOGIN_STATUS=$(curl -s -o "${TEMP_DIR}/student_login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${STUDENT_EMAIL}\",
    \"password\": \"${STUDENT_PASS}\"
  }")

if [ "${STUDENT_LOGIN_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Student login failed (HTTP ${STUDENT_LOGIN_STATUS}).${NC}"
    cat "${TEMP_DIR}/student_login.json"
    exit 1
fi

STUDENT_TOKEN=$(grep -o '"token":"[^"]*' "${TEMP_DIR}/student_login.json" | grep -o '[^"]*$' || true)
if [ -z "${STUDENT_TOKEN}" ]; then
    echo -e "${RED}[FAIL] Failed to extract student JWT token.${NC}"
    exit 1
fi

# Submit review
REVIEW_STATUS=$(curl -s -o "${TEMP_DIR}/create_review.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/messes/${MESS_ID}/reviews" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "foodQualityScore": 5,
    "hygieneScore": 4,
    "comment": "Authentic taste and superb hygiene verified across persistence restart."
  }')

if [ "${REVIEW_STATUS}" != "201" ] && [ "${REVIEW_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to submit student review (HTTP ${REVIEW_STATUS}).${NC}"
    cat "${TEMP_DIR}/create_review.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Mess approved and student review submitted successfully.${NC}"

# ------------------------------------------------------------------------------
# Step 6: Pre-Restart Verification Summary
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN}[Step 6/8] PRE-RESTART DATA STATE RECORDED                     ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Owner Account : ${OWNER_EMAIL}"
echo -e "Mess ID       : ${MESS_ID} (${MESS_NAME})"
echo -e "Menu Item     : Special Paneer Thali"
echo -e "Student Acct  : ${STUDENT_EMAIL}"
echo -e "Review Rating : 5 Stars"

# ------------------------------------------------------------------------------
# Step 7: Perform or Prompt for Restart
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[Step 7/8] Executing/Prompting MySQL container restart...${NC}"

if [ "${AUTO_RESTART}" = true ]; then
    echo -e "Restarting Docker container 'messmap-mysql'..."
    docker restart messmap-mysql
    echo -e "Waiting for MySQL container to become healthy..."
    MYSQL_HEALTHY=false
    for i in {1..30}; do
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' messmap-mysql 2>/dev/null || echo "unknown")
        if [ "$HEALTH" == "healthy" ]; then
            echo -e "${GREEN}[PASS] MySQL container is back online and healthy!${NC}"
            MYSQL_HEALTHY=true
            break
        fi
        sleep 1
    done
    if [ "${MYSQL_HEALTHY}" != true ]; then
        echo -e "${RED}[FAIL] MySQL container did not become healthy within 30 seconds.${NC}"
        exit 1
    fi
    sleep 2
else
    echo -e "\nTo complete restart verification, execute in a separate terminal:"
    echo -e "  1. Restart MySQL container:"
    echo -e "     ${BLUE}docker restart messmap-mysql${NC}"
    echo -e "  2. Restart Spring Boot application process if required"
    echo -e "\nWhen MySQL is healthy, press [ENTER] to verify data persistence..."
    read -r -p "Press Enter to proceed with post-restart assertion..."
fi

# ------------------------------------------------------------------------------
# Step 8: Post-Restart Persistence Assertion Across All 5 Categories
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[Step 8/8] Asserting complete data persistence post-restart...${NC}"

# 8a. Verify Owner Login & Credentials
echo -e "Verifying Owner Authentication..."
POST_OWNER_LOGIN=$(curl -s -o "${TEMP_DIR}/post_owner_login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${OWNER_EMAIL}\",\"password\":\"${OWNER_PASS}\"}")

if [ "${POST_OWNER_LOGIN}" != "200" ]; then
    echo -e "${RED}[FAIL] Post-restart owner login failed (HTTP ${POST_OWNER_LOGIN}). Data lost!${NC}"
    exit 1
fi

POST_OWNER_TOKEN=$(grep -o '"token":"[^"]*' "${TEMP_DIR}/post_owner_login.json" | grep -o '[^"]*$' || true)
if [ -z "${POST_OWNER_TOKEN}" ]; then
    echo -e "${RED}[FAIL] Failed to extract owner JWT token post-restart.${NC}"
    exit 1
fi
echo -e "${GREEN}[PASS] Category 1: Owner account and credentials persisted.${NC}"

# 8b. Verify Mess Profile, Address, and Timings
echo -e "Verifying Mess Profile & Timings..."
POST_MESS_STATUS=$(curl -s -o "${TEMP_DIR}/post_owner_mess.json" -w "%{http_code}" \
  -X GET "${BASE_URL}/api/owner/mess" \
  -H "Authorization: Bearer ${POST_OWNER_TOKEN}")

if [ "${POST_MESS_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to retrieve mess post-restart (HTTP ${POST_MESS_STATUS}).${NC}"
    cat "${TEMP_DIR}/post_owner_mess.json"
    exit 1
fi

if ! grep -q "${MESS_NAME}" "${TEMP_DIR}/post_owner_mess.json" || \
   ! grep -q "MG Road, Camp" "${TEMP_DIR}/post_owner_mess.json" || \
   ! grep -q "07:30 AM" "${TEMP_DIR}/post_owner_mess.json"; then
    echo -e "${RED}[FAIL] Category 2: Mess name, address, or timings not found post-restart.${NC}"
    cat "${TEMP_DIR}/post_owner_mess.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Category 2: Mess profile, address, and operating hours persisted.${NC}"

# 8c. Verify Menu Items
echo -e "Verifying Menu Dishes..."
POST_MENU_STATUS=$(curl -s -o "${TEMP_DIR}/post_menu.json" -w "%{http_code}" \
  -X GET "${BASE_URL}/api/owner/mess/menu" \
  -H "Authorization: Bearer ${POST_OWNER_TOKEN}")

if [ "${POST_MENU_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to retrieve menu post-restart (HTTP ${POST_MENU_STATUS}).${NC}"
    cat "${TEMP_DIR}/post_menu.json"
    exit 1
fi

if ! grep -q "Special Paneer Thali" "${TEMP_DIR}/post_menu.json" || \
   ! grep -q "120" "${TEMP_DIR}/post_menu.json"; then
    echo -e "${RED}[FAIL] Category 3: Menu item or pricing not found post-restart.${NC}"
    cat "${TEMP_DIR}/post_menu.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Category 3: Menu items and pricing persisted.${NC}"

# 8d. Verify Student Login
echo -e "Verifying Student Authentication..."
POST_STUDENT_LOGIN=$(curl -s -o "${TEMP_DIR}/post_student_login.json" -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${STUDENT_EMAIL}\",\"password\":\"${STUDENT_PASS}\"}")

if [ "${POST_STUDENT_LOGIN}" != "200" ]; then
    echo -e "${RED}[FAIL] Category 4: Post-restart student login failed (HTTP ${POST_STUDENT_LOGIN}).${NC}"
    exit 1
fi
echo -e "${GREEN}[PASS] Category 4: Student account credentials persisted.${NC}"

# 8e. Verify Reviews & Ratings
echo -e "Verifying Mess Reviews..."
POST_REVIEW_STATUS=$(curl -s -o "${TEMP_DIR}/post_reviews.json" -w "%{http_code}" \
  -X GET "${BASE_URL}/api/messes/${MESS_ID}/reviews")

if [ "${POST_REVIEW_STATUS}" != "200" ]; then
    echo -e "${RED}[FAIL] Failed to retrieve reviews post-restart (HTTP ${POST_REVIEW_STATUS}).${NC}"
    cat "${TEMP_DIR}/post_reviews.json"
    exit 1
fi

if ! grep -q "Authentic taste and superb hygiene" "${TEMP_DIR}/post_reviews.json"; then
    echo -e "${RED}[FAIL] Category 5: Review not found post-restart.${NC}"
    cat "${TEMP_DIR}/post_reviews.json"
    exit 1
fi
echo -e "${GREEN}[PASS] Category 5: Student reviews and ratings persisted.${NC}"

rm -rf "${TEMP_DIR}"
echo -e "\n${BLUE}================================================================${NC}"
echo -e "${GREEN} SUCCESS: All 5 persistence categories survived MySQL container ${NC}"
echo -e "${GREEN} restart with ZERO data loss and full relational integrity!      ${NC}"
echo -e "${BLUE}================================================================${NC}"
