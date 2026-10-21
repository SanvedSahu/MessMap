#!/usr/bin/env bash
# ==============================================================================
# MessMap — Demo Seed Data Loader Script
# File: database/seed/load_demo_data.sh
#
# Usage:
#   ./database/seed/load_demo_data.sh
#
# Environment variables supported (with sensible local defaults):
#   MYSQL_HOST (default: localhost)
#   MYSQL_PORT (default: 3306)
#   MYSQL_DATABASE (default: messmap_dev_db)
#   MYSQL_USER (default: messmap_user)
#   MYSQL_PASSWORD (default: messmap_secret_password)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_FILE="${SCRIPT_DIR}/demo_seed_data.sql"

DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"
DB_NAME="${MYSQL_DATABASE:-messmap_dev_db}"
DB_USER="${MYSQL_USER:-messmap_user}"
DB_PASS="${MYSQL_PASSWORD:-messmap_secret_password}"

echo "================================================================="
echo "   MessMap — Demo Seed Data Loader"
echo "================================================================="
echo "Target Host:     ${DB_HOST}:${DB_PORT}"
echo "Database:        ${DB_NAME}"
echo "User:            ${DB_USER}"
echo "Seed Script:     ${SEED_FILE}"
echo "-----------------------------------------------------------------"

if [ ! -f "${SEED_FILE}" ]; then
  echo "Error: Seed file not found at ${SEED_FILE}" >&2
  exit 1
fi

# Strategy 1: Check if running docker container 'messmap-mysql' is accessible
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q "^messmap-mysql$"; then
  echo "Detected active Docker container 'messmap-mysql'."
  echo "Executing demo seed script inside Docker MySQL..."
  docker exec -i messmap-mysql mysql -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "${SEED_FILE}"
  echo "Successfully loaded demo seed data via Docker!"
  exit 0
fi

# Strategy 2: Check if local mysql client is available
if command -v mysql >/dev/null 2>&1; then
  echo "Executing demo seed script via local mysql client..."
  mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "${SEED_FILE}"
  echo "Successfully loaded demo seed data via local MySQL client!"
  exit 0
fi

echo "Notice: Neither running Docker container 'messmap-mysql' nor local 'mysql' binary found on PATH."
echo "To load manually once MySQL is running, execute:"
echo "  mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SEED_FILE}"
echo "Or via Docker:"
echo "  docker exec -i messmap-mysql mysql -u${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SEED_FILE}"
exit 1
