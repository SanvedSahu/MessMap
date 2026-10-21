# MessMap — Role-Based Access Control (RBAC) Security Matrix & Audit

**Status**: Verified & Enforced in Code  
**Associated GitHub Issue**: [#6 — [Admin] Integration Coordination & Role-Based Access Control (RBAC) Security Audit](https://github.com/SanvedSahu/MessMap/issues/6)  
**Branch**: `feature/issue-6-rbac-security-audit`  
**Test Suite**: `com.messmap.security.RbacSecurityMatrixTest` (40/40 Passing Tests)  
**Last Audited**: October 19, 2026  

---

## 1. Overview & Architecture

MessMap implements a **defense-in-depth, stateless security architecture** combining:
1. **HTTP-Level URL Route Rules**: Configured via Spring Security's `SecurityFilterChain` in [`com.messmap.config.SecurityConfig`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/main/java/com/messmap/config/SecurityConfig.java).
2. **Method-Level Annotations**: Configured via `@EnableMethodSecurity` and `@PreAuthorize` on controller endpoints.
3. **Business-Layer Resource Ownership Validation**: Strictly prevents Insecure Direct Object Reference (IDOR) attacks where authenticated users attempt to alter resources (messes, menu items, reviews) belonging to other users.
4. **Stateless JWT Token Filter**: Intercepts requests via [`JwtAuthenticationFilter`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/main/java/com/messmap/security/JwtAuthenticationFilter.java), extracting and validating HMAC-SHA256 signed tokens.
5. **CORS Security**: Restricts frontend origins to trusted local Vite/React servers while permitting credentials.

---

## 2. Defined Platform Roles

Defined in enum [`com.messmap.modules.user.entity.Role`](file:///Users/sanvedsahu/Projects/MessMap/backend/src/main/java/com/messmap/modules/user/entity/Role.java):

| Role Identifier | Granted Authority | Description |
| :--- | :--- | :--- |
| `ROLE_STUDENT` | `ROLE_STUDENT` | College student actor who browses messes, manages personal favorite bookmarks, submits/edits reviews, and manages student profile. |
| `ROLE_MESS_OWNER`| `ROLE_MESS_OWNER` | Mess proprietor who registers, manages mess profile, meal timings, amenities, weekly menu schedules, and meal pricing. |
| `ROLE_ADMIN` | `ROLE_ADMIN` | Campus system administrator who reviews mess applications (approve, reject, suspend), audits platform metrics, and manages user accounts. |

---

## 3. CORS Policy Configuration

Configured in `com.messmap.config.CorsConfig` and verified via `com.messmap.config.SecurityAndCorsConfigTest`:
- **Allowed Origins**: `http://localhost:5173`, `http://localhost:3000`, `http://localhost:3001`
- **Allowed HTTP Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Authorization`, `Content-Type`, `X-Requested-With`, `Accept`, `Origin`
- **Allow Credentials**: `true` (enables cross-origin authenticated session headers)
- **Max Age**: `3600` seconds (1 hour pre-flight caching)

---

## 4. Comprehensive Endpoint Authorization Matrix

The matrix below reflects the **actual code rules enforced by Spring Security and controller services**:

| Endpoint Group | HTTP Method | Route Pattern | Permitted Roles | Forbidden Roles | Unauthenticated (No Token) | Enforcement Mechanism |
| :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| **Health Monitoring** | `GET` | `/api/v1/health`, `/api/health/**` | `Public` (All) | None | `200 OK` | `permitAll()` in `SecurityConfig` |
| **Authentication** | `POST` | `/api/v1/auth/login`, `/api/auth/**` | `Public` (All) | None | `200 OK` (with valid credentials) | `permitAll()` in `SecurityConfig` |
| **Student Registration**| `POST` | `/api/v1/auth/register/student` | `Public` (All) | None | `201 Created` | `permitAll()` in `SecurityConfig` |
| **Owner Registration** | `POST` | `/api/v1/auth/register/owner` | `Public` (All) | None | `201 Created` | Server forces `ROLE_MESS_OWNER` |
| **Mess Discovery** | `GET` | `/api/messes`, `/api/v1/messes` | `Public` (All) | None | `200 OK` | `permitAll()` for GET |
| **Mess Details** | `GET` | `/api/messes/{id}` | `Public` (All) | None | `200 OK` | `permitAll()` for GET |
| **Mess Reviews List** | `GET` | `/api/messes/{id}/reviews` | `Public` (All) | None | `200 OK` | `permitAll()` for GET |
| **Admin Metrics** | `GET` | `/api/admin/metrics`, `/dashboard/summary`| `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin Mess Queue** | `GET` | `/api/admin/messes/pending` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin Mess Management**| `GET` | `/api/admin/messes` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin Mess Approve**| `POST`| `/api/admin/messes/{id}/approve` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin Mess Reject** | `POST`| `/api/admin/messes/{id}/reject` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin Mess Suspend**| `POST`| `/api/admin/messes/{id}/suspend` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin User Directory**| `GET` | `/api/admin/users` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasRole("ADMIN")` & `@PreAuthorize` |
| **Admin User Status** | `PUT` | `/api/admin/users/{id}/status` | `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_MESS_OWNER` | `401 Unauthorized` | Self-deactivation blocked in service |
| **Owner Mess Profile** | `GET, POST, PUT` | `/api/owner/mess/**` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `ROLE_STUDENT` | `401 Unauthorized` | `.hasAnyAuthority("ROLE_MESS_OWNER", "ROLE_ADMIN")` |
| **Owner Menu View** | `GET` | `/api/owner/mess/menu/**` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `ROLE_STUDENT` | `401 Unauthorized` | `@PreAuthorize("hasRole('MESS_OWNER') or hasRole('ADMIN')")` |
| **Owner Menu Item Add**| `POST`| `/api/owner/mess/menu/items/**` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `ROLE_STUDENT` | `401 Unauthorized` | `@PreAuthorize` + Ownership validation |
| **Owner Menu Edit/Delete**| `PUT, DELETE` | `/api/owner/mess/menu/items/{id}` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `ROLE_STUDENT` | `401 Unauthorized` | Ownership validation: Owner B $\rightarrow$ Owner A = `403` |
| **Owner Pricing Update**| `PUT`| `/api/owner/mess/pricing` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `ROLE_STUDENT` | `401 Unauthorized` | Ownership validation |
| **Student Favorites** | `GET, POST, DELETE`| `/api/student/favorites/**` | `ROLE_STUDENT`, `ROLE_ADMIN` | `ROLE_MESS_OWNER` | `401 Unauthorized` | `.hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN")` |
| **Student Profile** | `GET, PUT` | `/api/student/profile` | `ROLE_STUDENT`, `ROLE_ADMIN` | `ROLE_MESS_OWNER` | `401 Unauthorized` | Principal-bound query |
| **Review Submission** | `POST`| `/api/messes/{id}/reviews` | `ROLE_STUDENT`, `ROLE_ADMIN` | `ROLE_MESS_OWNER` | `401 Unauthorized` | `@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")` |
| **Review Edit/Delete** | `PUT, DELETE` | `/api/messes/{id}/reviews/{reviewId}` | `ROLE_STUDENT`, `ROLE_ADMIN` | `ROLE_MESS_OWNER` | `401 Unauthorized` | Author check: Student B $\rightarrow$ Student A = `403` |

---

## 5. Insecure Direct Object Reference (IDOR) & Data Isolation

Role-level access control alone is insufficient to prevent horizontal privilege escalation. MessMap implements mandatory resource ownership checks:

1. **Mess Profile Isolation**:
   - When an owner accesses `PUT /api/owner/mess/{id}`, `OwnerMessService` asserts:
     ```java
     if (!mess.getOwner().getId().equals(ownerId) && !isAdmin) {
         throw new AccessDeniedException("You are not authorized to update another owner's mess.");
     }
     ```
   - Verified by test: `CrossOwnerIsolationTests.ownerCannotModifyAnotherOwnersMess()` returns **HTTP 403 Forbidden**.

2. **Menu Item Isolation**:
   - When an owner edits or deletes a menu dish (`PUT/DELETE /api/owner/mess/menu/items/{id}`), `OwnerMenuService` asserts:
     ```java
     if (!menuItem.getMess().getOwner().getId().equals(ownerId) && !isAdmin) {
         throw new AccessDeniedException("You are not authorized to update menu item for another owner's mess.");
     }
     ```
   - Verified by tests: `ownerCannotEditAnotherOwnersMenuItem()` and `ownerCannotDeleteAnotherOwnersMenuItem()` return **HTTP 403 Forbidden**.

3. **Student Review Isolation**:
   - When editing or deleting a review, `ReviewService` checks that `review.getUser().getId().equals(authenticatedUserId)`.
   - Another student attempting deletion receives **HTTP 403 Forbidden**.

---

## 6. How to Run and Verify RBAC Tests

### Run the Dedicated RBAC Test Suite
To execute all 40 end-to-end security matrix test scenarios:
```bash
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw test -Dtest=RbacSecurityMatrixTest
```
**Expected Outcome**: `Tests run: 40, Failures: 0, Errors: 0, Skipped: 0. BUILD SUCCESS`.

### Run the Full Backend Test Suite
To verify that no regressions exist across other modules:
```bash
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw test
```
**Expected Outcome**: `Tests run: 263, Failures: 0, Errors: 0, Skipped: 0. BUILD SUCCESS`.
