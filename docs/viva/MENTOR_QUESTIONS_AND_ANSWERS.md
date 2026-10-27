# MessMap — Mentor Viva Defense Questions & Model Answers

> **Final-Year Project Technical Viva Guide**  
> **Repository:** `SanvedSahu/MessMap` | **Branch:** `integration/backend-demo`  
> **Total Questions:** 44 Verified Technical Questions with Spoken Summaries, Deep Explanations & Source Citations.

---

## Category 1: Location, Maps & Geocoding

### Q1. How do you calculate the distance between a student and a mess?
- **Spoken Summary:**  
  "We calculate the great-circle distance between the student's device coordinates and the mess's stored latitude and longitude using the Haversine formula with Earth's volumetric mean radius set to 6,371 km. This calculation is executed on both the Spring Boot backend and the React frontend to guarantee accuracy and real-time UI responsiveness."
- **Deep Technical Explanation:**  
  Euclidean distance on a flat plane (\(\sqrt{\Delta x^2 + \Delta y^2}\)) fails across geographic coordinates because lines of longitude converge toward the poles. The Haversine formula converts degrees to radians, calculates the angular distance \(c = 2 \cdot \arctan2(\sqrt{a}, \sqrt{1-a})\), and multiplies by \(R = 6371.0\text{ km}\). In our backend, distances are rounded to two decimal places using `BigDecimal.setScale(2, RoundingMode.HALF_UP)`.
- **Source Citation:** `backend/src/main/java/com/messmap/modules/mess/service/MessDiscoveryService.java` (lines 78-87) and `frontend/src/utils/geocoding.ts` (lines 264-286).
- **Status:** `[Verified in source]`

---

### Q2. What is the Haversine formula and why is it used instead of Euclidean distance?
- **Spoken Summary:**  
  "The Haversine formula computes the shortest spherical distance between two points on the Earth's surface using their latitudes and longitudes in radians. We use it because the Earth is an oblate sphere, where one degree of longitude spans approximately 111 km at the equator but shrinks significantly as latitude increases."
- **Deep Technical Explanation:**  
  The formula is:
  \[
  a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)
  \]
  \[
  d = 2R \cdot \arctan2\left(\sqrt{a}, \sqrt{1-a}\right)
  \]
  MessMap uses the \(\arctan2\) variant rather than \(\arcsin\) because \(\arctan2\) is numerically stable across floating-point implementations and avoids roundoff errors near antipodal points.
- **Source Citation:** `MessDiscoveryService.java` (lines 80-86).
- **Status:** `[Verified in source]`

---

### Q3. How does the selected radius filter messes?
- **Spoken Summary:**  
  "The selected radius is a maximum scalar distance threshold, not a physical geometric circle. Candidate messes retrieved from the database have their Haversine distance evaluated against this threshold, and any mess where `distanceKm <= effectiveRadius` is retained and sorted from nearest to farthest."
- **Deep Technical Explanation:**  
  In `MessDiscoveryService.java` (line 106), if the student does not specify a radius, a default of 5.0 km is applied. The service validates that `0.0 < radiusKm <= 100.0`. It filters candidates via Java streams: `.filter(s -> s.getDistanceKm() <= effectiveRadius)` and orders them using `.sorted(Comparator.comparingDouble(MessSummaryResponse::getDistanceKm))`.
- **Source Citation:** `MessDiscoveryService.java` (lines 106-136).
- **Status:** `[Verified in source]`

---

### Q4. How do you get the student's current location in the browser?
- **Spoken Summary:**  
  "We use the standard HTML5 Geolocation API via `navigator.geolocation.getCurrentPosition`. We configure it with high accuracy enabled to leverage device GPS and Wi-Fi triangulation over coarse IP lookups."
- **Deep Technical Explanation:**  
  Options passed to `getCurrentPosition` are `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }`. If the user denies permission, the error callback traps `err.PERMISSION_DENIED` and prompts the user to place a pin manually on the interactive Leaflet map canvas.
- **Source Citation:** `frontend/src/modules/auth/RegisterPage.tsx` (lines 245-285) and `frontend/src/modules/student/pages/FindMessPage.tsx`.
- **Status:** `[Verified in source]`

---

### Q5. What is the difference between geocoding and reverse geocoding in MessMap?
- **Spoken Summary:**  
  "Geocoding converts a text address or locality name into geographic latitude and longitude coordinates. Reverse geocoding takes exact coordinates from a map click or device GPS and resolves them into human-readable address attributes such as area locality and postal PIN code."
- **Deep Technical Explanation:**  
  In MessMap:
  - **Forward Geocoding:** `geocodeAddress(address, area, city)` queries OpenStreetMap Nominatim `/search` to place a default marker.
  - **Reverse Geocoding:** `reverseGeocodeCoordinates(lat, lng)` queries Nominatim `/reverse?format=json&lat=...&lon=...` to automatically populate the `Area / Campus Locality` and `PIN Code` fields during mess registration.
- **Source Citation:** `frontend/src/utils/geocoding.ts` (lines 108-258).
- **Status:** `[Verified in source]`

---

### Q6. How do you prevent race conditions during rapid map pin dragging or clicking?
- **Spoken Summary:**  
  "We maintain an asynchronous request counter ref (`reverseGeocodeCounterRef`). When a network response returns, we compare its request ID against the current ref value; if a newer click or drag occurred in the interim, the stale response is discarded immediately."
- **Deep Technical Explanation:**  
  In `RegisterPage.tsx`, every call to `resolveLocationDetails` increments `reverseGeocodeCounterRef.current`. The asynchronous fetch to Nominatim carries this local `currentRequestId`. If `currentRequestId !== reverseGeocodeCounterRef.current` upon completion, state setters (`setArea`, `setPincode`) are bypassed, ensuring older delayed responses never overwrite the user's latest pin position.
- **Source Citation:** `frontend/src/modules/auth/RegisterPage.tsx` (lines 167-179).
- **Status:** `[Verified in source]`

---

### Q7. What happens if a mess in the database has no coordinates?
- **Spoken Summary:**  
  "Messes with missing or null coordinates are safely excluded from distance-based nearby searches using a stream filter check. However, they remain viewable in regular non-distance listings filtered by city or locality text."
- **Deep Technical Explanation:**  
  `MessDiscoveryService.java` (line 124) applies `.filter(m -> m.getLatitude() != null && m.getLongitude() != null)` before calculating Haversine distances. This prevents `NullPointerException` and ensures distance queries only operate on physically mapped messes.
- **Source Citation:** `MessDiscoveryService.java` (line 124).
- **Status:** `[Verified in source]`

---

### Q8. Why can two messes in the same campus locality have different distances?
- **Spoken Summary:**  
  "A locality like 'Shivajinagar' or 'Kothrud' is an area spanning several square kilometers. Two messes within the same locality have unique street addresses and distinct physical coordinates, meaning their actual distance to a student can differ by several hundred meters to kilometers."
- **Deep Technical Explanation:**  
  Earlier iterations of MessMap derived coordinates from a single predefined locality centroid. We refactored the owner registration to capture exact entrance coordinates (`DECIMAL(10, 7)`), allowing precision down to approximately 1.1 centimeters.
- **Source Citation:** `frontend/src/modules/auth/RegisterPage.tsx` and `backend/src/main/resources/db/migration/V1__initial_schema.sql` (lines 47-48).
- **Status:** `[Verified in source]`

---

## Category 2: API & Backend Architecture

### Q9. What is the overall architectural pattern of the MessMap backend?
- **Spoken Summary:**  
  "MessMap implements a standard layered architecture: Controller-Service-Repository with DTO and Entity separation, secured by Spring Security with stateless JWT Bearer token authentication."
- **Deep Technical Explanation:**  
  - Controllers expose REST endpoints, parse query/path parameters, and return standardized `ApiResponse<T>` envelopes.
  - Services encapsulate transactional business logic (`@Transactional`), domain validations, and security authorization checks.
  - Repositories provide Spring Data JPA abstraction over MySQL 8.
  - DTOs prevent over-fetching, eliminate circular references during JSON serialization, and shield sensitive database fields like password hashes.
- **Source Citation:** `backend/src/main/java/com/messmap/config/SecurityConfig.java` and `MessController.java`.
- **Status:** `[Verified in source]`

---

### Q10. What is a REST API and how is it implemented in MessMap?
- **Spoken Summary:**  
  "A REST API is an architectural style for network communication using standard HTTP methods—GET, POST, PUT, DELETE—operating on URI-identified resources with stateless request-response semantics. In MessMap, it is implemented using Spring Boot `@RestController` annotations returning JSON payloads."
- **Deep Technical Explanation:**  
  Resources are logically structured: `/api/messes` (collections), `/api/messes/{id}` (individual resources), `/api/messes/nearby` (sub-resource discovery), and `/api/student/notifications` (student-scoped resources). All endpoints follow HTTP status code semantics (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).
- **Source Citation:** `backend/src/main/java/com/messmap/modules/mess/controller/MessController.java`.
- **Status:** `[Verified in source]`

---

### Q11. Why do your controllers support dual paths like `/api/messes` and `/api/v1/messes`?
- **Spoken Summary:**  
  "To maintain backward compatibility and support API versioning. While newer frontend services target `/api/v1`, existing endpoints and legacy client services configured with `/api` continue to function without route-not-found regressions."
- **Deep Technical Explanation:**  
  Spring MVC allows array syntax in request mappings: `@GetMapping({"/api/messes", "/api/v1/messes"})`. This ensures our system supports future breaking API version iterations while maintaining uninterrupted availability for active clients.
- **Source Citation:** `MessController.java` (line 45, 110, 150).
- **Status:** `[Verified in source]`

---

### Q12. How does the frontend handle backend errors?
- **Spoken Summary:**  
  "The backend exposes a unified `GlobalExceptionHandler` that formats errors into a standardized `ApiResponse<T>` containing `success: false`, an informative `message`, and timestamp. Frontend fetch wrappers check `response.ok` and unwrap `data.message` to display user-friendly toast messages."
- **Deep Technical Explanation:**  
  `com.messmap.common.exception.GlobalExceptionHandler` catches `BadRequestException` (400), `ResourceNotFoundException` (404), `AccessDeniedException` (403), `MethodArgumentNotValidException` (400 field validation list), and unhandled `Exception` (500). In the frontend, client APIs throw standard JavaScript `Error(data.message || fallback)` caught by React component state.
- **Source Citation:** `backend/src/main/java/com/messmap/common/exception/GlobalExceptionHandler.java`.
- **Status:** `[Verified in source]`

---

### Q13. How was the bug `Invalid parameter 'id': 'nearby' is not a valid Long` resolved?
- **Spoken Summary:**  
  "In Spring MVC, route matching order matters. If `@GetMapping('/api/messes/{id}')` precedes `/nearby`, the string `'nearby'` is captured as an `id` path variable and fails type conversion to `Long`. We resolved this by defining the explicit literal route `@GetMapping('/api/messes/nearby')` ahead of the parameterized path variable route."
- **Deep Technical Explanation:**  
  Spring matches literal path segments before variable segments when properly ordered. Additionally, in `MessController.java`, line 110 explicitly binds `/api/messes/nearby` with dedicated query parameters (`latitude`, `longitude`, `radiusKm`), completely isolating it from the single-mess lookup endpoint at line 150.
- **Source Citation:** `MessController.java` (lines 110 vs 150).
- **Status:** `[Verified in source]`

---

### Q14. What is a DTO and why is it bad practice to return JPA Entities directly to the client?
- **Spoken Summary:**  
  "A DTO is an object designed specifically for carrying data between processes. Returning JPA entities directly exposes sensitive database fields, risks leaking password hashes, and triggers Hibernate `LazyInitializationException` when accessing uninitialized relationships outside an active persistence context."
- **Deep Technical Explanation:**  
  Entities like `User` contain fields such as `password` (BCrypt hash) and bidirectional relationships like `messes` which can cause infinite recursion in Jackson JSON serialization. DTOs like `MessSummaryResponse` and `StudentProfileApiResponse` cleanly decouple network payloads from database normalization.
- **Source Citation:** `com.messmap.modules.mess.dto.MessSummaryResponse`.
- **Status:** `[Verified in source]`

---

### Q15. How do you prevent Insecure Direct Object References (IDOR) when a mess owner updates a mess?
- **Spoken Summary:**  
  "We enforce strict server-side ownership checks in `OwnerMessService`. When an owner attempts to modify a mess, the service verifies that the mess's `owner_id` matches the authenticated `UserPrincipal.getId()`, rejecting unauthorized requests with HTTP 403 Access Denied."
- **Deep Technical Explanation:**  
  In `OwnerMessService.java`:
  ```java
  Mess mess = messRepository.findById(messId)
      .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));
  if (!isAdmin && !mess.getOwner().getId().equals(ownerId)) {
      throw new AccessDeniedException("Access denied: You are not authorized to modify another owner's mess.");
  }
  ```
  The client cannot bypass this by simply tampering with the `messId` in the request URL.
- **Source Citation:** `backend/src/main/java/com/messmap/modules/mess/service/OwnerMessService.java` (lines 510-525).
- **Status:** `[Verified in source]`

---

### Q16. How is meal pricing structured and updated in MessMap?
- **Spoken Summary:**  
  "MessMap supports multi-tier pricing: overarching daily and monthly meal rates stored on the `messes` table, specific breakfast, lunch, and dinner meal prices, and itemized dish-level pricing stored on `menu_items`."
- **Deep Technical Explanation:**  
  Flyway migration `V5` added `breakfast_price`, `lunch_price`, and `dinner_price` (`DECIMAL(8, 2)`) to `messes`, and `is_special` to `menu_items`. Owners update overarching meal prices via `PUT /api/v1/owner/mess/menu` and dish-specific prices via `POST/PUT /api/v1/owner/mess/menu/items`.
- **Source Citation:** `backend/src/main/java/com/messmap/modules/menu/controller/OwnerMenuController.java`.
- **Status:** `[Verified in source]`

---

## Category 3: Database & Persistence

### Q17. Why did you choose MySQL instead of MongoDB or PostgreSQL?
- **Spoken Summary:**  
  "MessMap has inherently relational and transactional business requirements: strict foreign key integrity between users, messes, menus, reviews, and notifications, ACID compliance for status transitions, and structured schema evolution managed via Flyway."
- **Deep Technical Explanation:**  
  Relational integrity ensures that deleting an owner or mess properly cascades or restricts child entities (`ON DELETE CASCADE` on `menu_items`, `favorites`, `notifications`). Unique composite constraints like `uk_favorites_user_mess (user_id, mess_id)` prevent duplicate data at the storage engine level.
- **Source Citation:** `backend/src/main/resources/db/migration/V1__initial_schema.sql`.
- **Status:** `[Verified in source]`

---

### Q18. What is Flyway and why is it used in MessMap?
- **Spoken Summary:**  
  "Flyway is an open-source database migration tool. It provides version-controlled, repeatable, and automated schema evolution, ensuring all developers, CI/CD environments, and production databases share identical table structures."
- **Deep Technical Explanation:**  
  Flyway tracks applied migrations in the `flyway_schema_history` table. Migrations run in sequential order (`V1` through `V8`). In our test suite, Flyway automatically builds the in-memory H2 schema before Hibernate initializes, validating that our migration scripts are syntactically and relationally correct.
- **Source Citation:** `backend/src/main/resources/db/migration/` (scripts `V1` to `V8`).
- **Status:** `[Verified in source]`

---

### Q19. How are geographic coordinates persisted in MySQL?
- **Spoken Summary:**  
  "Coordinates are stored as `DECIMAL(10, 7)` columns for both `latitude` and `longitude` in the `messes` table. This provides numeric precision down to 7 decimal places, which corresponds to approximately 1.1 centimeters on the Earth's surface."
- **Deep Technical Explanation:**  
  `DECIMAL(10, 7)` allocates 10 total digits with 7 digits following the decimal point (e.g. `18.5236000`). This completely avoids floating-point binary representation errors associated with `FLOAT` or `DOUBLE` types in database storage.
- **Source Citation:** `V1__initial_schema.sql` (lines 47-48) and `com.messmap.modules.mess.entity.Mess.java`.
- **Status:** `[Verified in source]`

---

### Q20. What is a foreign key and what cascade rules are used in MessMap?
- **Spoken Summary:**  
  "A foreign key establishes a referential constraint between two tables. In MessMap, child tables like `menu_items`, `reviews`, `favorites`, and `notifications` use `ON DELETE CASCADE` referencing `messes.id`, ensuring no orphaned records remain if a mess is deleted."
- **Deep Technical Explanation:**  
  For critical governance tables like `complaints` and `suspension_review_requests`, cascading deletes are deliberately restricted or set to `NULL` (`ON DELETE SET NULL` on `reviewed_by`) to preserve administrative audit history even if a user account is removed.
- **Source Citation:** `V1__initial_schema.sql` (line 161) and `V7__add_mess_removal_and_suspension_review_schema.sql` (line 23).
- **Status:** `[Verified in source]`

---

### Q21. How do you prevent duplicate bookmarks in the database?
- **Spoken Summary:**  
  "We define a database-level composite unique constraint on `(user_id, mess_id)` in the `favorites` table named `uk_favorites_user_mess`."
- **Deep Technical Explanation:**  
  Even if concurrent network requests are sent from a double-clicked UI button, the MySQL storage engine rejects the second transaction with a unique constraint violation error, which the service layer handles gracefully.
- **Source Citation:** `V1__initial_schema.sql` (line 163).
- **Status:** `[Verified in source]`

---

### Q22. How does the student discovery query retrieve only eligible messes?
- **Spoken Summary:**  
  "The discovery query uses Spring Data JPA Specifications with an invariant predicate that strictly enforces `status = 'APPROVED'`. Unapproved, pending, rejected, or suspended messes are never returned to students."
- **Deep Technical Explanation:**  
  In `MessSpecification.java`, the criteria builder prepends `cb.equal(root.get("status"), MessStatus.APPROVED)`. If a student performs a lookup by ID on an unapproved mess, `MessDiscoveryService.getApprovedMessDetails` queries `findByIdAndStatusWithDetails(id, MessStatus.APPROVED)`, throwing a 404 `ResourceNotFoundException` if not approved.
- **Source Citation:** `backend/src/main/java/com/messmap/modules/mess/repository/MessSpecification.java` (line 23).
- **Status:** `[Verified in source]`

---

### Q23. What database indexes are created to optimize query performance?
- **Spoken Summary:**  
  "We create indexes on high-frequency lookup and filter columns: `email`, `role`, and `status` in `users`; `city`, `area`, `food_type`, and `status` in `messes`; foreign keys in `menu_items`, `reviews`, and `favorites`; and a composite index on `(recipient_id, is_read)` in `notifications`."
- **Deep Technical Explanation:**  
  The composite index `idx_notifications_recipient_read` on `(recipient_id, is_read)` allows MySQL to resolve the unread notification count query in \(O(\log N)\) index-scan time without performing a full table scan.
- **Source Citation:** `backend/src/main/resources/db/migration/V8__create_notifications_schema.sql` (line 23).
- **Status:** `[Verified in source]`

---

### Q24. How do you handle N+1 query performance problems in JPA?
- **Spoken Summary:**  
  "We use JPQL `JOIN FETCH` queries and entity graph projections in our repositories to fetch parent messes and their associated facilities or images in a single SQL query, rather than executing N additional child queries."
- **Deep Technical Explanation:**  
  In `MessRepository.java`, methods like `findByIdAndStatusWithDetails` and `findByOwnerIdWithDetails` use `@Query("SELECT DISTINCT m FROM Mess m LEFT JOIN FETCH m.facilities LEFT JOIN FETCH m.images WHERE ...")` to initialize collections within the primary database round-trip.
- **Source Citation:** `backend/src/main/java/com/messmap/modules/mess/repository/MessRepository.java`.
- **Status:** `[Verified in source]`

---

## Category 4: Authentication, Security & Roles

### Q25. How are students, mess owners, and administrators separated?
- **Spoken Summary:**  
  "MessMap uses Role-Based Access Control (RBAC) enforced by Spring Security. Every user has a `role` attribute stored in the database as `ROLE_STUDENT`, `ROLE_MESS_OWNER`, or `ROLE_ADMIN`, which is encoded into their JWT token and verified on every request."
- **Deep Technical Explanation:**  
  `SecurityConfig.java` defines URL pattern matchers:
  - `/api/admin/**` requires `.hasRole("ADMIN")`
  - `/api/owner/**` requires `.hasAnyAuthority("ROLE_MESS_OWNER", "ROLE_ADMIN")`
  - `/api/student/**` requires `.hasAnyAuthority("ROLE_STUDENT", "ROLE_ADMIN")`
  Method-level `@PreAuthorize` annotations provide secondary enforcement on individual service methods.
- **Source Citation:** `backend/src/main/java/com/messmap/config/SecurityConfig.java` (lines 50-67).
- **Status:** `[Verified in source]`

---

### Q26. What is the difference between authentication and authorization in MessMap?
- **Spoken Summary:**  
  "Authentication verifies *who* the user is (e.g. validating email and password during login and issuing a signed JWT). Authorization determines *what* that authenticated user has permission to do (e.g. allowing an admin to suspend a mess, but forbidding a student from doing so)."
- **Deep Technical Explanation:**  
  Authentication is handled by `AuthenticationManager` and `JwtAuthenticationFilter`. Authorization is handled by Spring Security filter chains and `@PreAuthorize` rules inspecting the `GrantedAuthority` collection of the `UserPrincipal`.
- **Source Citation:** `SecurityConfig.java` and `com.messmap.security.JwtAuthenticationFilter`.
- **Status:** `[Verified in source]`

---

### Q27. What algorithm is used to hash passwords and why?
- **Spoken Summary:**  
  "We use the BCrypt adaptive hashing function provided by Spring Security's `BCryptPasswordEncoder` with a default cost factor of 10."
- **Deep Technical Explanation:**  
  BCrypt incorporates an internal 128-bit salt to defend against rainbow table attacks and is computationally intensive to resist brute-force hardware cracking. The resulting hash string begins with the format identifier `$2a$10$...`. Raw passwords are never stored or logged.
- **Source Citation:** `SecurityConfig.java` (lines 35-38).
- **Status:** `[Verified in source]`

---

### Q28. How does stateless JWT authentication work in MessMap?
- **Spoken Summary:**  
  "When a user logs in, the backend signs a JSON Web Token containing their user ID, email, and role using a secret 256-bit key. The client includes this token in the `Authorization: Bearer <token>` header for subsequent requests. The server validates the signature on every request without maintaining an in-memory session."
- **Deep Technical Explanation:**  
  `SecurityConfig` sets `SessionCreationPolicy.STATELESS`. The `JwtAuthenticationFilter` intercepts requests, extracts the Bearer token, validates the HMAC-SHA256 signature via `JwtTokenProvider.validateToken()`, constructs a `UserPrincipal`, and populates the `SecurityContextHolder`.
- **Source Citation:** `backend/src/main/java/com/messmap/security/JwtTokenProvider.java` and `JwtAuthenticationFilter.java`.
- **Status:** `[Verified in source]`

---

### Q29. Why is CSRF protection disabled in `SecurityConfig`?
- **Spoken Summary:**  
  "Cross-Site Request Forgery (CSRF) relies on browsers automatically attaching session cookies to cross-origin requests. Because MessMap is a stateless REST API using JWT Bearer tokens passed in HTTP Authorization headers—not cookies—it is inherently immune to standard CSRF attacks, making CSRF tokens redundant."
- **Deep Technical Explanation:**  
  In `SecurityConfig.java` (line 44), `http.csrf(AbstractHttpConfigurer::disable)` disables CSRF token generation. Browser cross-origin protection is instead enforced via strict CORS configuration (`CorsConfigurationSource`) allowing only authorized frontend origins (`localhost:5173`, etc.).
- **Source Citation:** `SecurityConfig.java` (line 44).
- **Status:** `[Verified in source]`

---

### Q30. What happens if a JWT token expires?
- **Spoken Summary:**  
  "When an expired token is sent, `JwtTokenProvider` catches an `ExpiredJwtException` during signature verification and fails validation. The security filter terminates the chain, and `JwtAuthenticationEntryPoint` returns an HTTP 401 Unauthorized JSON response, prompting the frontend to redirect the user to login."
- **Deep Technical Explanation:**  
  Token expiration is set to 24 hours (`86,400,000 ms`). The entry point outputs:
  `{"status": 401, "error": "Unauthorized", "message": "JWT token has expired", "path": "/api/..."}`.
- **Source Citation:** `backend/src/main/java/com/messmap/security/JwtTokenProvider.java` (line 138) and `JwtAuthenticationEntryPoint.java`.
- **Status:** `[Verified in source]`

---

### Q31. How does the mess approval lifecycle work?
- **Spoken Summary:**  
  "When an owner registers, their mess is created with status `PENDING`. It remains hidden from students until an administrator reviews and approves it via `/api/admin/messes/{id}/approve`. Only after approval does the mess become discoverable on the map."
- **Deep Technical Explanation:**  
  The state machine in `AdminMessVerificationService.java` enforces:
  - `PENDING -> APPROVED` (via `/approve`)
  - `PENDING -> REJECTED` (via `/reject` with mandatory reason)
  - `APPROVED -> SUSPENDED` (via `/suspend` due to violations, automatically closes operating status)
  - `SUSPENDED -> APPROVED` (via `/reactivate`)
  - `* -> REMOVED` (terminal deletion state with audit reason)
- **Source Citation:** `backend/src/main/java/com/messmap/modules/admin/service/AdminMessVerificationService.java`.
- **Status:** `[Verified in source]`

---

### Q32. Can an unapproved or suspended mess owner open their mess?
- **Spoken Summary:**  
  "No. `OwnerMessService` strictly forbids opening any mess that is not in `APPROVED` status. Attempting to set operating status to `OPEN` for a pending, suspended, or removed mess immediately throws an HTTP 400 Bad Request exception."
- **Deep Technical Explanation:**  
  In `OwnerMessService.java` (lines 230-237), if `operatingStatus == OPEN`:
  ```java
  if (mess.getStatus() == MessStatus.SUSPENDED) throw new BadRequestException("Cannot open mess: The listing is currently suspended by an administrator.");
  if (mess.getStatus() == MessStatus.REMOVED) throw new BadRequestException("Cannot open mess: The listing has been removed by an administrator.");
  if (mess.getStatus() != MessStatus.APPROVED) throw new BadRequestException("Cannot open mess: The listing must be approved by an administrator before opening.");
  ```
- **Source Citation:** `backend/src/main/java/com/messmap/modules/mess/service/OwnerMessService.java` (lines 230-237).
- **Status:** `[Verified in source]`

---

## Category 5: Testing & Reliability

### Q33. What is the difference between a unit test and an integration test in MessMap?
- **Spoken Summary:**  
  "A unit test isolates a single class or method using mocks (e.g. testing `MessDiscoveryService` Haversine math with Mockito mocks). An integration test spins up the Spring application context, boots an in-memory database with Flyway migrations, and tests the end-to-end flow across controllers, services, and repositories."
- **Deep Technical Explanation:**  
  - **Unit Tests:** Run rapidly without database or Spring container dependencies.
  - **Integration Tests (`@SpringBootTest` / `@AutoConfigureMockMvc`):** Validate that SQL constraints, Flyway migrations, JPA mappings, security filter chains, and JSON serialization function cohesively together.
- **Source Citation:** `backend/src/test/java/com/messmap/integration/StudentOwnerAdminE2EFlowIntegrationTest.java`.
- **Status:** `[Verified by automated test]`

---

### Q34. How many automated tests exist in the MessMap backend and do they pass?
- **Spoken Summary:**  
  "There are 344 automated tests across controllers, services, repositories, security, and integration flows. All 344 tests pass with zero failures and zero errors when executed under the supported Java 17 LTS runtime."
- **Deep Technical Explanation:**  
  Command to run: `JAVA_HOME=<path-to-jdk-17> ./mvnw test`. Output:
  `[INFO] Tests run: 344, Failures: 0, Errors: 0, Skipped: 0`.
- **Source Citation:** Maven Surefire test report and test logs.
- **Status:** `[Verified by automated test]`

---

### Q35. Why can tests pass in an H2 test database while failing in production MySQL?
- **Spoken Summary:**  
  "H2 is an in-memory Java database that emulates MySQL syntax. Subtle differences in case sensitivity, SQL dialect functions, lock handling, collation rules, or native spatial indexing can succeed in H2 but fail in real MySQL."
- **Deep Technical Explanation:**  
  To minimize divergence, our H2 test configuration sets `jdbc:h2:mem:messmap_test_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE` and runs the exact same Flyway SQL scripts (`V1` to `V8`) that execute on production MySQL.
- **Source Citation:** `backend/src/test/resources/application-test.yml` and `HealthControllerTest.java`.
- **Status:** `[Verified in source]`

---

### Q36. What build commands are used to test and compile the project?
- **Spoken Summary:**  
  "For the backend: `./mvnw clean test` to execute all automated test suites, and `./mvnw clean package -DskipTests` to build the production executable JAR. For the frontend: `npm run build`, which executes `tsc` for TypeScript type verification followed by `vite build`."
- **Deep Technical Explanation:**  
  Both the Maven build and Vite build complete with exit code 0 on the `integration/backend-demo` branch, producing optimized artifacts in `backend/target/` and `frontend/dist/`.
- **Source Citation:** `backend/pom.xml` and `frontend/package.json`.
- **Status:** `[Verified by automated test]`

---

### Q37. How would you debug an issue where a student's nearby search returns zero results?
- **Spoken Summary:**  
  "I would systematically inspect: 1. Whether device coordinates are within range; 2. Whether candidate messes in that locality have `status = 'APPROVED'`; 3. Whether candidate messes have non-null latitude and longitude; and 4. Whether the requested search radius is too small for the physical distance."
- **Deep Technical Explanation:**  
  Using server logs at `MessDiscoveryService.java` line 111 (`Executing nearby approved mess discovery: origin=(lat, lng), radius=...`), check the SQL query executed by Hibernate. If a mess is in `PENDING` or `SUSPENDED` status, it is excluded by `MessSpecification`. If its calculated Haversine distance is 2.4 km and radius is set to 2.0 km, it is filtered out by `s.getDistanceKm() <= effectiveRadius`.
- **Source Citation:** `MessDiscoveryService.java` (lines 111-136).
- **Status:** `[Verified in source]`

---

### Q38. How is the frontend tested?
- **Spoken Summary:**  
  "The frontend relies on strict TypeScript static analysis (`tsc`), Vite production bundling validation, and comprehensive manual testing across Chrome DevTools simulating device geolocation, network throttling, and various viewport widths."
- **Deep Technical Explanation:**  
  `npm run build` runs `tsc && vite build`, ensuring zero type errors across all React components, contexts, and API clients. Automated unit test runners like Jest or Vitest are not currently configured in `package.json`, representing an area for future CI test enhancement.
- **Source Citation:** `frontend/package.json` (lines 6-10).
- **Status:** `[Verified in source]`

---

## Category 6: Limitations & Future Scope

### Q39. What are the primary architectural limitations of the current implementation?
- **Spoken Summary:**  
  "The primary limitations are: 1. Distance filtering is evaluated in application memory rather than via MySQL spatial indexes (R-Tree); 2. In-app notifications use polling rather than real-time WebSockets; and 3. Image uploads store URL strings rather than uploading directly to cloud object storage like AWS S3."
- **Deep Technical Explanation:**  
  Currently, `MessDiscoveryService` fetches candidate approved messes matching search filters into memory and iterates through them to calculate Haversine distances. While highly performant for campus-scale datasets (< 5,000 messes), city-scale deployment (100,000+ messes) will require MySQL Spatial Extensions (`ST_Distance_Sphere` with `POINT` spatial indexes).
- **Source Citation:** `MessDiscoveryService.java` (line 123) and `docs/viva/FEATURE_STATUS_AND_LIMITATIONS.md`.
- **Status:** `[Verified in source]`

---

### Q40. How could the system scale to support thousands of concurrent students?
- **Spoken Summary:**  
  "By: 1. Introducing Redis caching for frequent discovery queries and geocoding centroids; 2. Adding MySQL spatial indexing with `ST_Distance_Sphere`; 3. Establishing database read replicas; and 4. Deploying stateless backend instances behind a reverse proxy load balancer like Nginx."
- **Deep Technical Explanation:**  
  Because our Spring Security architecture is completely stateless (JWT Bearer tokens without server-side HTTP sessions), horizontal scaling is straightforward. Multiple Spring Boot application instances can run behind Nginx or AWS Application Load Balancer without session sticky routing.
- **Source Citation:** `SecurityConfig.java` (line 45: `SessionCreationPolicy.STATELESS`).
- **Status:** `[Inferred]`

---

### Q41. How could real-time notifications be improved beyond client polling?
- **Spoken Summary:**  
  "Currently, the student navbar polls `/api/student/notifications/unread-count`. In the future, this can be transitioned to WebSocket connections using Spring STOMP over SockJS or Server-Sent Events (SSE), pushing instant alerts to students the exact millisecond a mess opens."
- **Deep Technical Explanation:**  
  In `OwnerMessService.java` line 254, when `operatingStatus` changes to `OPEN`, the service already triggers `notificationService.createMessOpenedNotifications()`. Replacing or augmenting the database insert with `SimpMessagingTemplate.convertAndSend("/topic/mess-opened", payload)` would deliver zero-latency push events to connected browsers.
- **Source Citation:** `OwnerMessService.java` (line 254).
- **Status:** `[Planned / not implemented]`

---

### Q42. Is there a Student Grievances / Complaints API implemented in this repository?
- **Spoken Summary:**  
  "The complaints database schema (`V2__create_complaints_schema.sql`), JPA entity (`Complaint.java`), and repository (`ComplaintRepository.java`) are fully implemented. However, the student-facing REST controller and UI forms for submitting complaints are currently planned and not yet integrated into the frontend."
- **Deep Technical Explanation:**  
  This is a critical distinction for viva integrity: the table `complaints` exists in the database and admin dashboard metrics count open complaints, but student complaint submission endpoints are not yet mapped in `com.messmap.modules.complaint`.
- **Source Citation:** `backend/src/main/resources/db/migration/V2__create_complaints_schema.sql` and `ComplaintRepository.java`.
- **Status:** `[Partial / Planned]`

---

### Q43. What external third-party services are used and do they require paid API keys?
- **Spoken Summary:**  
  "MessMap is architected to be 100% free and open-source without requiring any paid subscriptions or API keys. We use OpenStreetMap tile servers for map rendering and the OpenStreetMap Nominatim API for forward and reverse geocoding."
- **Deep Technical Explanation:**  
  Leaflet pulls raster map tiles from `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. Geocoding queries execute against `https://nominatim.openstreetmap.org/`. To comply with Nominatim's Acceptable Use Policy, our client supplies a customized `User-Agent: MessMap-StudentDiningApp/1.0` header and implements an offline campus fallback directory to minimize request volume.
- **Source Citation:** `frontend/src/utils/geocoding.ts` (lines 144, 207).
- **Status:** `[Verified in source]`

---

### Q44. How does the notification system prevent spam if an owner rapidly toggles their mess open and closed?
- **Spoken Summary:**  
  "We enforce a 1-hour deduplication time window in `NotificationService`. If a student was already notified about that specific mess opening within the preceding 60 minutes, the system skips creating a duplicate alert."
- **Deep Technical Explanation:**  
  In `NotificationService.java` (lines 68-80):
  ```java
  LocalDateTime dedupWindow = LocalDateTime.now().minusHours(1);
  boolean alreadyNotified = notificationRepository.existsByRecipientIdAndMessIdAndCreatedAtAfter(
      student.getId(), mess.getId(), dedupWindow
  );
  if (!alreadyNotified) { /* create notification */ }
  ```
  This defends students against notification flooding while maintaining high engagement when messes genuinely open.
- **Source Citation:** `backend/src/main/java/com/messmap/modules/notification/service/NotificationService.java` (lines 68-80).
- **Status:** `[Verified in source]`
