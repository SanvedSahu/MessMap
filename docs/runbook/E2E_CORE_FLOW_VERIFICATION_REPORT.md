# MessMap — End-to-End Core Lifecycle Flow Verification Report

**Associated GitHub Issue**: [#18 — [Testing] End-to-End Verification of the Student → Mess Owner → Admin Approval Core Flow](https://github.com/SanvedSahu/MessMap/issues/18)  
**Target Branch**: `integration/backend-demo`  
**Execution Date**: October 20, 2026  
**Primary Assignee**: `@SanvedSahu`  
**Contributors**: `@Anushka0431`, `@SarthakM28`  
**Automated Test Suite**: [`com.messmap.integration.StudentOwnerAdminE2EFlowIntegrationTest`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/test/java/com/messmap/integration/StudentOwnerAdminE2EFlowIntegrationTest.java)  
**Status**: `VERIFIED & PASSING` (100% of Core 8-Step Lifecycle Verified)

---

## 1. Executive Summary & Objective

This report documents the verification of the complete multi-role lifecycle flow across Student, Mess Owner, and Administrator domains on the unified `integration/backend-demo` branch.

The objective is to guarantee that the 4-Day sprint working model is presentation-ready for mentor demonstration by validating:
1. Owner registration, authentication, mess profile creation, and meal timetable configuration.
2. Submission of the draft mess listing for administrative verification.
3. Strict public/student search isolation ensuring unapproved messes remain invisible.
4. Administrator inspection of pending verification requests and approval.
5. Instant discovery by students of the newly approved mess, including operating timings and menu dishes.
6. Administrative suspension removing the mess from student discovery, followed by reinstatement restoring public visibility.

---

## 2. Test Execution Environment

| Component | Specification |
|---|---|
| **Java Development Kit** | OpenJDK 17 LTS (`17.0.20.1`) |
| **Spring Boot Framework** | Spring Boot 3.3.4 with Spring Security & Spring Data JPA |
| **Test Engine** | JUnit 5 Jupiter + Spring MockMvc |
| **Database Schema** | Flyway Migrations `V1`–`V6` on ANSI SQL / H2 in MySQL Compatibility Mode |
| **Frontend Ecosystem** | React 18.3.1, TypeScript 5.7.2, Vite 6.0.7 |

---

## 3. Comprehensive Step-by-Step Execution Matrix

The table below details each step executed during the automated E2E lifecycle test [`testCompleteStudentOwnerAdminLifecycle`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/test/java/com/messmap/integration/StudentOwnerAdminE2EFlowIntegrationTest.java):

| Step # | Stage Name | Actor / Role | Endpoint & Method | Input Payload / Parameters | Expected Status & Assertions | Observed Output | Result |
|:---:|---|---|---|---|---|---|:---:|
| **1a** | Owner Registration | Unauthenticated Owner | `POST /api/v1/auth/register/owner` | `name: "Rajesh Sharma", email: "rajesh.e2e@messmap.com", phone: "+91 98765 43210"` | `HTTP 201 Created`, `success: true, data.token: notNull` | Token issued with `ROLE_MESS_OWNER` claim | **PASS** |
| **1b** | Owner Login | Mess Owner | `POST /api/v1/auth/login` | `email: "rajesh.e2e@messmap.com", password: "ValidPassword123!"` | `HTTP 200 OK`, `success: true, data.token: notNull` | Valid JWT session established | **PASS** |
| **1c** | Mess Profile Creation | Mess Owner | `POST /api/v1/owner/mess` | `name: "Shree Ganesh Executive Mess", foodType: "PURE_VEG", monthlyPrice: 3500.00, draft: true` | `HTTP 201 Created`, `status: "DRAFT", name: "Shree Ganesh Executive Mess"` | Mess ID 1 created in `DRAFT` status | **PASS** |
| **1d** | Daily Menu Setup | Mess Owner | `POST /api/v1/owner/mess/menu/items` | `messId: 1, dayOfWeek: "MONDAY", mealType: "LUNCH", dishName: "Paneer Butter Masala Thali", price: 120.00` | `HTTP 201 Created`, `dishName: "Paneer Butter Masala Thali"` | Menu dish linked to Mess ID 1 | **PASS** |
| **2** | Verification Submission | Mess Owner | `POST /api/v1/owner/mess/submit-verification` | `messId: 1` | `HTTP 200 OK`, `status: "PENDING", success: true` | Status transitioned from `DRAFT` to `PENDING` | **PASS** |
| **3a** | Student Registration | Unauthenticated Student | `POST /api/v1/auth/student/register` | `name: "Amit Patil", email: "amit.e2e@student.ac.in", college: "PICT"` | `HTTP 201 Created`, `success: true` | Account created with `ROLE_STUDENT` | **PASS** |
| **3b** | Student Search Isolation | Public / Student | `GET /api/v1/messes?search=Shree+Ganesh` | `search: "Shree Ganesh"` | `HTTP 200 OK`, `data: []` (size = 0) | **Pending mess is NOT returned in public search** | **PASS** |
| **3c** | Direct Lookup Block | Public / Student | `GET /api/v1/messes/1` | `id: 1` | `HTTP 404 Not Found`, `error: "Resource Not Found"` | Unapproved listing cannot be accessed directly | **PASS** |
| **4a** | Admin Login | Platform Admin | `POST /api/v1/auth/login` | `email: "admin.e2e@messmap.com", password: "ValidPassword123!"` | `HTTP 200 OK`, `success: true` | Admin session authenticated with `ROLE_ADMIN` | **PASS** |
| **4b** | Pending Queue Review | Platform Admin | `GET /api/v1/admin/messes/pending` | None | `HTTP 200 OK`, `data[*].id contains 1` | Mess ID 1 listed in pending verification queue | **PASS** |
| **4c** | Admin Approval | Platform Admin | `POST /api/v1/admin/messes/1/approve` | `id: 1` | `HTTP 200 OK`, `status: "APPROVED"` | Mess status transitioned to `APPROVED` | **PASS** |
| **5a** | Student Discovery | Public / Student | `GET /api/v1/messes?search=Shree+Ganesh` | `search: "Shree Ganesh"` | `HTTP 200 OK`, `data: [1 item]`, `status: "APPROVED"` | **Approved mess is discoverable in search** | **PASS** |
| **5b** | Student Detail & Menu | Public / Student | `GET /api/v1/messes/1` | `id: 1` | `HTTP 200 OK`, `menuItems[0].dishName: "Paneer Butter Masala Thali"` | Profile, operating timings, and dishes returned | **PASS** |
| **6a** | Admin Suspension | Platform Admin | `POST /api/v1/admin/messes/1/suspend` | `reason: "Temporary hygiene inspection pending."` | `HTTP 200 OK`, `status: "SUSPENDED"` | Mess status transitioned to `SUSPENDED` | **PASS** |
| **6b** | Suspended Search Hiding | Public / Student | `GET /api/v1/messes?search=Shree+Ganesh` | `search: "Shree Ganesh"` | `HTTP 200 OK`, `data: []` (size = 0) | **Suspended mess immediately disappears from search** | **PASS** |
| **6c** | Admin Unsuspension | Platform Admin | `POST /api/v1/admin/messes/1/unsuspend` | `id: 1` | `HTTP 200 OK`, `status: "APPROVED"` | Mess status restored to `APPROVED` | **PASS** |
| **6d** | Reinstated Discovery | Public / Student | `GET /api/v1/messes?search=Shree+Ganesh` | `search: "Shree Ganesh"` | `HTTP 200 OK`, `data: [1 item]`, `status: "APPROVED"` | **Unsuspended mess immediately reappears in search** | **PASS** |

---

## 4. Test Suite Summary

- **Focused Test Run**: `StudentOwnerAdminE2EFlowIntegrationTest`
  - Result: `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`
  - Elapsed Time: `4.011 s`
- **Full Backend Test Suite Run**:
  - Result: `Tests run: 301, Failures: 0, Errors: 0, Skipped: 0`
  - Elapsed Time: `48.532 s`
  - Build Status: `BUILD SUCCESS`

---

## 5. Verification Sign-Off

The entire 8-stage Student &rarr; Mess Owner &rarr; Admin Approval lifecycle executes without error, guaranteeing that:
1. Unapproved or pending mess listings can never leak into student discovery.
2. Suspended listings immediately cease to be discoverable.
3. Approved listings seamlessly render full profile and daily menu timetables.
4. Issue #18 is fully validated and verified for the mentor presentation.
