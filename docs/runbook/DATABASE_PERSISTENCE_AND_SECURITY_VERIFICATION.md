# MessMap — Database Persistence, JWT Session Lifecycle, and RBAC Security Verification Runbook

**Associated GitHub Issue**: [#19 — [Testing] Database Persistence, JWT Session Lifecycle, and RBAC Security Verification](https://github.com/SanvedSahu/MessMap/issues/19)
**Feature Branch**: `feature/issue-19-persistence-jwt-rbac-verification`
**Base Commit**: `6a1800f` (on `integration/backend-demo`)
**Audit Date**: October 20, 2026
**Primary Assignee**: `@SanvedSahu`
**Status**: `PASS WITH WARNINGS` (All automated tests pass; local Docker restart verification procedure documented)

---

## 1. Overview & Scope

This runbook documents the verification of three critical non-functional platform requirements for the MessMap 4-Day Working Model:
1. **JWT Session Lifecycle & Security**: Proper rejection of expired, forged, untrusted, malformed, and missing JWT tokens with HTTP 401 Unauthorized and standardized JSON error payloads.
2. **Role-Based Access Control (RBAC) Negative Tests**: Strict HTTP 403 Forbidden enforcement preventing privilege escalation across Student, Mess Owner, and Administrator domains, as well as cross-owner Insecure Direct Object Reference (IDOR) tampering.
3. **Database Persistence & Data Integrity**: Reliable persistence of user accounts, mess profiles, meal timings, weekly menus, facility associations, and student reviews across persistence context flushes, cache evictions, and application restarts.

---

## 2. Environment & Prerequisites

- **JDK Version**: Java 21 LTS (`/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home`)
- **Build Tool**: Maven Wrapper (`./mvnw`)
- **Active Spring Profile for Automated Tests**: `test` (`application-test.yml` using H2 MySQL-compatibility mode with Flyway migrations `V1`–`V6`)
- **Optional Local Docker MySQL Environment**: `database/docker-compose-db.yml` (MySQL 8.0 on port 3306)

---

## 3. JWT Session Lifecycle Verification

### 3.1 Scenario Matrix

All scenarios are implemented and automated in [`com.messmap.security.JwtSessionLifecycleTest`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/test/java/com/messmap/security/JwtSessionLifecycleTest.java):

| Category | Test Scenario | Request Endpoint & Method | Token State | Expected Status | Error Response Payload Assertion | Result |
|---|---|---|---|:---:|---|:---:|
| **Expired Tokens** | Expired Admin Token | `GET /api/admin/metrics` | Expired (-60s) | `401 Unauthorized` | `status: 401, error: "Unauthorized", path: "/api/admin/metrics"` | **PASS** |
| **Expired Tokens** | Expired Owner Token | `GET /api/owner/mess` | Expired (-60s) | `401 Unauthorized` | `status: 401, error: "Unauthorized", path: "/api/owner/mess"` | **PASS** |
| **Expired Tokens** | Expired Student Token | `GET /api/student/favorites` | Expired (-60s) | `401 Unauthorized` | `status: 401, error: "Unauthorized", path: "/api/student/favorites"` | **PASS** |
| **Expired Tokens** | Expired Mutation Attempt | `POST /api/student/favorites/1` | Expired (-60s) | `401 Unauthorized` | Mutation prevented before service invocation | **PASS** |
| **Forged Signatures** | Untrusted Secret Key (Admin) | `GET /api/admin/metrics` | Signed with forged key | `401 Unauthorized` | Signature exception caught; returns standard 401 | **PASS** |
| **Forged Signatures** | Untrusted Secret Key (Student) | `GET /api/student/favorites` | Signed with forged key | `401 Unauthorized` | Signature exception caught; returns standard 401 | **PASS** |
| **Malformed Tokens** | Corrupt Base64 String | `GET /api/admin/metrics` | `Bearer corrupted.jwt...` | `401 Unauthorized` | Handled safely without 500 internal server error | **PASS** |
| **Malformed Tokens** | Truncated JWT (Missing Signature) | `GET /api/admin/metrics` | `Bearer header.payload` | `401 Unauthorized` | Handled safely without 500 internal server error | **PASS** |
| **Malformed Headers** | Empty Bearer Header | `GET /api/student/favorites` | `Bearer ` | `401 Unauthorized` | Returns 401 without NullPointerException | **PASS** |
| **Malformed Headers** | Whitespace Bearer Header | `GET /api/student/favorites` | `Bearer    ` | `401 Unauthorized` | Returns 401 without NullPointerException | **PASS** |
| **Missing Headers** | Unauthenticated Request | `GET /api/student/favorites` | None | `401 Unauthorized` | Returns standard 401 ErrorResponse | **PASS** |
| **Positive Control** | Valid Admin Token | `GET /api/admin/metrics` | Valid HMAC-SHA256 | `200 OK` | `success: true, data: notNull` | **PASS** |
| **Positive Control** | Valid Student Token | `GET /api/student/favorites` | Valid HMAC-SHA256 | `200 OK` | `success: true, data: []` | **PASS** |

### 3.2 Error Response Standard Format

Whenever an invalid or expired token is presented, `JwtAuthenticationEntryPoint` intercepts the request and guarantees the following standardized JSON format:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource. Please provide a valid Bearer token.",
  "path": "/api/admin/metrics",
  "timestamp": "2026-10-20T11:53:01.417"
}
```

---

## 4. RBAC Negative Security Verification

RBAC negative security tests are enforced in [`com.messmap.security.RbacSecurityMatrixTest`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/test/java/com/messmap/security/RbacSecurityMatrixTest.java) (40 tests total):

### 4.1 Cross-Role Authorization Matrix

| Actor Role | Target Route Category | HTTP Method & Path | Enforced Status | Enforcement Mechanism |
|---|---|---|:---:|---|
| `ROLE_STUDENT` | Admin Metrics | `GET /api/admin/metrics` | `403 Forbidden` | `.hasRole("ADMIN")` in `SecurityConfig` |
| `ROLE_STUDENT` | Admin Pending Messes | `GET /api/admin/messes/pending` | `403 Forbidden` | `.hasRole("ADMIN")` in `SecurityConfig` |
| `ROLE_STUDENT` | Admin Mess Approval | `POST /api/admin/messes/{id}/approve` | `403 Forbidden` | `.hasRole("ADMIN")` in `SecurityConfig` |
| `ROLE_STUDENT` | Admin User Management | `GET /api/admin/users` | `403 Forbidden` | `.hasRole("ADMIN")` in `SecurityConfig` |
| `ROLE_STUDENT` | Owner Mess Profile | `GET, POST /api/owner/mess/**` | `403 Forbidden` | `.hasAnyAuthority("ROLE_MESS_OWNER", "ROLE_ADMIN")` |
| `ROLE_STUDENT` | Owner Menu Management | `POST, PUT /api/owner/mess/menu/**` | `403 Forbidden` | `@PreAuthorize` in `OwnerMenuController` |
| `ROLE_STUDENT` | Owner Verification Submit | `POST /api/owner/verification/submit` | `403 Forbidden` | `@PreAuthorize` in `OwnerVerificationController` |
| `ROLE_MESS_OWNER` | Admin Metrics | `GET /api/admin/metrics` | `403 Forbidden` | `.hasRole("ADMIN")` in `SecurityConfig` |
| `ROLE_MESS_OWNER` | Admin Pending Messes | `GET /api/admin/messes/pending` | `403 Forbidden` | `.hasRole("ADMIN")` in `SecurityConfig` |
| `ROLE_MESS_OWNER` | Student Favorites | `GET, POST /api/student/favorites/**` | `403 Forbidden` | `.hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN")` |
| `ROLE_MESS_OWNER` | Student Reviews | `POST /api/messes/{id}/reviews` | `403 Forbidden` | `@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")` |

### 4.2 Cross-Owner Insecure Direct Object Reference (IDOR) Isolation

| Actor | Action Attempted | Target Resource | Enforced Status | Service Guard |
|---|---|---|:---:|---|
| Owner B | Update Mess Profile | Mess belonging to Owner A | `403 Forbidden` | `OwnerMessService.updateMess()` checks `owner.getId()` |
| Owner B | Update Meal Timings | Timings belonging to Owner A | `403 Forbidden` | `OwnerMessService.updateTimings()` checks `owner.getId()` |
| Owner B | Update Amenities | Amenities belonging to Owner A | `403 Forbidden` | `OwnerMessService.updateAmenities()` checks `owner.getId()` |
| Owner B | Add Menu Item | Menu of Owner A | `403 Forbidden` | `OwnerMenuService.addMenuItem()` checks mess ownership |
| Owner B | Edit Menu Item | Dish ID belonging to Owner A | `403 Forbidden` | `OwnerMenuService.updateMenuItem()` checks item ownership |
| Owner B | Delete Menu Item | Dish ID belonging to Owner A | `403 Forbidden` | `OwnerMenuService.deleteMenuItem()` checks item ownership |
| Owner B | Submit Verification | Mess belonging to Owner A | `403 Forbidden` | `OwnerVerificationService.submitForVerification()` checks ownership |

---

## 5. Database Persistence Verification

### 5.1 Automated Entity Graph Persistence Tests

Implemented in [`com.messmap.persistence.DatabasePersistenceVerificationTest`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/test/java/com/messmap/persistence/DatabasePersistenceVerificationTest.java):

1. **Cache Eviction Guarantee**: All test entities are persisted, followed by explicit `entityManager.flush()` and `entityManager.clear()`. This clears the Hibernate Level-1 session cache, guaranteeing that subsequent assertions load state from physical SQL queries.
2. **Relational Graph Verified**:
   - **User Accounts**: `ROLE_MESS_OWNER` and `ROLE_STUDENT` accounts verified with BCrypt password hashes, college, hostel, and active status.
   - **Mess Profiles**: Verified name, description, address, city (`Pune`), state, pincode, food type (`PURE_VEG`), capacity, and geo-coordinates (`18.5312000`, `73.8553000`).
   - **Meal Timings**: Verified `openingTime`, `closingTime`, `breakfastTiming`, `lunchTiming`, and `dinnerTiming` string columns.
   - **Meal Pricing**: Verified `dailyPrice`, `monthlyPrice`, `breakfastPrice`, `lunchPrice`, and `dinnerPrice` with exact `BigDecimal` scale (`0.00`).
   - **Facility Associations**: Verified many-to-many relationship mapping (`mess_facilities`) with linked `Facility` records ("WiFi", "RO Water").
   - **Menu Timetable**: Verified dishes across Breakfast, Lunch, and Dinner with day of week (`MONDAY`), availability flag, and special item designation.
   - **Student Reviews**: Verified 1–5 rating scale, `foodQualityScore`, `hygieneScore`, and text comment.
3. **Referential Integrity**: Verified unique constraints (duplicate email throws `DataIntegrityViolationException`) and foreign key constraints.

---

## 6. Local Service & Database Restart Verification Procedure

### 6.1 Automated Verification Script

A non-destructive restart verification script is provided at:
```bash
./backend/scripts/verify_persistence_restart.sh http://localhost:8080
```

### 6.2 Manual Step-by-Step Procedure for Local MySQL

To execute and verify persistence across an actual service/database restart on your local development machine:

1. **Boot Isolated MySQL Container**:
   ```bash
   cd ~/Projects/MessMap
   docker compose -f database/docker-compose-db.yml up -d
   ```
2. **Launch Backend Service**:
   ```bash
   cd ~/Projects/MessMap/backend
   JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./mvnw spring-boot:run
   ```
3. **Create Seed Records via REST API**:
   - Register an owner account:
     ```bash
     curl -X POST http://localhost:8080/api/v1/auth/register/owner \
       -H "Content-Type: application/json" \
       -d '{"name":"Local Owner","email":"local.owner@messmap.test","password":"LocalPass123!","phone":"9876543210"}'
     ```
   - Log in to obtain JWT:
     ```bash
     TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"local.owner@messmap.test","password":"LocalPass123!"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
     ```
   - Create Mess Profile with Operating Hours:
     ```bash
     curl -X POST http://localhost:8080/api/owner/mess \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"name":"Camp Delights","address":"East St","city":"Pune","foodType":"PURE_VEG","dailyPrice":90,"openingTime":"07:00 AM","closingTime":"10:00 PM"}'
     ```
4. **Perform Actual Service & Database Restarts**:
   - Stop and restart MySQL container:
     ```bash
     docker compose -f database/docker-compose-db.yml restart mysql
     ```
   - Restart the Spring Boot process (kill process and re-run `./mvnw spring-boot:run`).
5. **Verify Data Persistence Post-Restart**:
   - Log in with the same credentials and query `GET /api/owner/mess`:
     ```bash
     curl -s -X GET http://localhost:8080/api/owner/mess \
       -H "Authorization: Bearer $TOKEN"
     ```
   - Confirm that the mess record, address, and timings remain intact with zero data loss.

---

## 7. Verification Execution Results

### 7.1 Focused Test Execution Commands

```bash
# 1. Focused JWT Session Lifecycle Tests (13 tests)
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./mvnw test -Dtest=JwtSessionLifecycleTest

# 2. Focused Database Persistence Verification Tests (3 tests)
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./mvnw test -Dtest=DatabasePersistenceVerificationTest

# 3. RBAC Security Matrix Tests (40 tests)
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./mvnw test -Dtest=RbacSecurityMatrixTest
```

### 7.2 Full Backend Suite Results

```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./mvnw test
```

- **Total Tests Run**: **299**
- **Failures**: **0**
- **Errors**: **0**
- **Skipped**: **0**
- **Build Status**: **BUILD SUCCESS**
- **Execution Time**: ~44 seconds

---

## 8. Environmental Status & Known Limitations

- **Automated Verification**: **COMPLETE (100% PASS)**. 299 tests pass covering JWT session lifecycle, expired token handling, header sanitization, RBAC access boundaries, IDOR cross-owner tamper resistance, and entity graph persistence with cache eviction.
- **Docker Daemon Note**: The local Docker daemon was inactive during this run (`DOCKER_NOT_AVAILABLE`). The automated persistence test suite verified data persistence via Flyway migrations and physical database queries after cache eviction. A dedicated restart verification script (`backend/scripts/verify_persistence_restart.sh`) and detailed runbook instructions are provided for local container restart testing.
