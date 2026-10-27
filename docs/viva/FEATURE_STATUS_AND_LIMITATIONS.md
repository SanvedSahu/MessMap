# MessMap — Feature Status, Viva Walkthroughs & Limitations Reference

> **Audited Branch:** `integration/backend-demo`  
> **Evaluation Mode:** Final-Year Viva Defense & Technical Readiness  

---

## 1. Feature Implementation Status Matrix

Every feature is classified based on verifiable source code evidence:
- **`[Verified in source]`**: Fully implemented across backend controllers, services, database tables, and frontend UI.
- **`[Partial]`**: Database schema, repository, or service exists, but controller or frontend integration is incomplete.
- **`[Planned / not implemented]`**: Conceptual feature documented in design requirements but not written in this codebase.

| Feature / Capability | Frontend UI | Backend API | Database Tables | Status Evidence | Implementation Details / File References |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student Registration & Auth** | Yes (`RegisterPage.tsx`) | Yes (`StudentAuthController`) | `users` | `[Verified in source]` | Full validation, BCrypt password hashing, JWT Bearer token generation. |
| **Mess Owner Registration** | Yes (`RegisterPage.tsx`) | Yes (`AuthController`) | `users` | `[Verified in source]` | Direct role assignment `ROLE_MESS_OWNER`. |
| **Interactive Map Pinning** | Yes (`RegisterPage.tsx`) | Yes (`OwnerMessController`) | `messes` | `[Verified in source]` | Leaflet custom SVG marker with drag and click events. |
| **Device Geolocation (GPS)** | Yes (`RegisterPage.tsx`) | N/A (Browser API) | N/A | `[Verified in source]` | HTML5 `navigator.geolocation` with high accuracy and permission error handling. |
| **Reverse Geocoding (Area & PIN)** | Yes (`geocoding.ts`) | N/A (Client fetch) | `messes` | `[Verified in source]` | OSM Nominatim API integration with async request counter and 31 Pune campus fallbacks. |
| **Nearby Mess Discovery (Haversine)** | Yes (`FindMessPage.tsx`) | Yes (`MessController`) | `messes` | `[Verified in source]` | Haversine formula (\(R = 6371.0\text{ km}\)), radius threshold filtering, distance sorting. |
| **Mess Detail Profile & Timings** | Yes (`MessDetailPage.tsx`) | Yes (`MessController`) | `messes`, `menu_items`, `facilities` | `[Verified in source]` | Structured breakfast, lunch, and dinner operational hours. |
| **Daily Menus & Pricing Management** | Yes (`OwnerMenuPage.tsx`) | Yes (`OwnerMenuController`) | `menu_items`, `messes` | `[Verified in source]` | Dish CRUD, meal type categorization, special flags, and meal rates. |
| **Student Bookmarks / Favorites** | Yes (`FavoritesPage.tsx`) | Yes (`StudentFavoriteController`) | `favorites` | `[Verified in source]` | Unique composite key `(user_id, mess_id)` preventing duplicate bookmarks. |
| **Student Reviews & Ratings** | Yes (`MessDetailPage.tsx`) | Yes (`ReviewController`) | `reviews` | `[Verified in source]` | 1-5 star ratings, SQL `AVG(rating)` aggregation, Half-Up rounding. |
| **In-App Mess Open Notifications** | Yes (`StudentNotificationBell.tsx`)| Yes (`StudentNotificationController`)| `notifications` | `[Verified in source]` | Automatically triggered when mess opens with a 1-hour deduplication window. |
| **Admin Mess Moderation** | Yes (`AdminDashboard.tsx`)| Yes (`AdminMessController`) | `messes` | `[Verified in source]` | Verification queue: Approve, Reject, Suspend, Unsuspend, Remove with mandatory reasons. |
| **Suspension Appeals & Reviews** | Yes (`OwnerDashboard.tsx`)| Yes (`AdminMessController`) | `suspension_review_requests` | `[Verified in source]` | Owner appeal submission and admin adjudication workflow. |
| **Admin User Management** | Yes (`AdminUsersPage.tsx`)| Yes (`AdminUserController`) | `users` | `[Verified in source]` | Status toggling (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`). |
| **Student Grievances / Complaints** | No UI forms | Repository only (`ComplaintRepository`) | `complaints` | `[Partial]` | Flyway migration `V2` created table; entity exists; REST controller not yet implemented. |
| **Cloud Image File Upload (S3/Disk)** | URL text fields | URL string persistence | `mess_images`, `messes` | `[Partial]` | Image URLs stored in DB; no multipart binary file upload endpoint exists. |
| **Real-Time WebSockets** | HTTP Polling (10s) | Stateless REST | N/A | `[Planned / not implemented]` | Notifications use client interval polling; WebSockets/STOMP are planned. |
| **Online Tiffin Subscription & Payments** | No UI | No API | N/A | `[Planned / not implemented]` | Pricing displayed for information only; payment gateways (Razorpay/Stripe) are planned. |

---

## 2. Five-Minute Technical Walkthrough Script

Use this script when a mentor asks: *"Give me a quick 5-minute technical walkthrough of your project."*

1. **Introduction & Motivation (45 seconds):**  
   "MessMap is a campus food discovery platform connecting college students with hygienic, verified local messes and tiffin services. In university hubs like Pune, students struggle to locate affordable food within walking distance, while mess owners lack an easy way to showcase their daily menus and operating status."

2. **Technology Stack (45 seconds):**  
   "The frontend is a single-page application built with React 18, TypeScript, and Vite, using Leaflet and OpenStreetMap for interactive maps. The backend is built with Java 17 and Spring Boot 3, using Spring Security for stateless JWT authentication, Spring Data JPA with Hibernate for ORM, and MySQL 8 for relational persistence, with all migrations managed by Flyway."

3. **Core Engineering Highlights (90 seconds):**  
   "Our primary technical achievement is accurate nearby mess discovery. During registration, mess owners drop an exact pin on an interactive map or use device GPS. The frontend reverse-geocodes their coordinates via OpenStreetMap Nominatim to auto-populate the campus locality and PIN code.  
   When a student opens the nearby search, their device coordinates are captured, and our backend applies the Haversine great-circle formula (\(R = 6371.0\text{ km}\)) to calculate real-world distances, filter results by the student's selected radius threshold, and return listings sorted from nearest to farthest."

4. **Security & Moderation (60 seconds):**  
   "To protect students from unhygienic or unauthorized businesses, all messes enter a `PENDING` moderation state and are hidden from student discovery until a platform administrator verifies and approves them. We implement strict Role-Based Access Control (`ROLE_STUDENT`, `ROLE_MESS_OWNER`, `ROLE_ADMIN`) with BCrypt password hashing."

5. **Testing & Reliability (60 seconds):**  
   "The backend is backed by 344 automated tests across controllers, services, repositories, and end-to-end integration flows. Every single test passes under the Java 17 LTS runtime, and the frontend builds cleanly with zero TypeScript errors."

---

## 3. Ten-Minute Detailed Technical Walkthrough Script

Use this expanded script for a formal project evaluation presentation.

- **Minute 0–2: Problem Statement, Architectural Diagram & Stack Rationale:**  
  Show the architecture diagram from `TECHNICAL_VIVA_GUIDE.md`. Explain the separation of the React SPA client, stateless Spring Boot backend, and MySQL persistence layer. Explain why JWT was chosen (stateless horizontal scalability) and why Flyway is used (versioned database migrations).
- **Minute 2–4: Owner Onboarding & Reverse Geocoding:**  
  Walk through `RegisterPage.tsx`. Demonstrate how clicking on the Leaflet map triggers `reverseGeocodeCoordinates()`. Explain how the asynchronous request counter ref (`reverseGeocodeCounterRef`) prevents race conditions when dragging the pin, and how the offline campus directory (`KNOWN_CAMPUS_LOCATIONS`) provides zero-latency fallbacks.
- **Minute 4–6: Haversine Algorithm & Student Discovery Pipeline:**  
  Explain the mathematical formula in `MessDiscoveryService.java`. Emphasize that the radius is an algorithmic threshold (\(d \le \text{radiusKm}\)), not a physical geometric circle. Walk through the numerical example: COEP to Fergusson College is 1.70 km, which qualifies under a 2.0 km radius.
- **Minute 6–8: Governance, State Machine & Notification Deduplication:**  
  Show the Admin Moderation state machine (`PENDING -> APPROVED -> SUSPENDED -> REMOVED`). Explain the business rule: an unapproved mess owner cannot open their mess. Explain how opening an approved mess triggers student in-app notifications with a 1-hour deduplication window (`NotificationService.java`) to prevent notification spam.
- **Minute 8–10: Testing Results, Limitations & Future Roadmap:**  
  Show the test suite summary (344 tests passing). Transparently state the limitations: in-memory distance filtering rather than MySQL spatial indexes, HTTP polling rather than WebSockets, and image URLs rather than direct S3 binary uploads. Conclude with the roadmap for scaling to city-wide datasets.

---

## 4. Top 10 Source Files You Must Know

Memorize these 10 core files before your viva:

1. **`backend/src/main/java/com/messmap/modules/mess/service/MessDiscoveryService.java`** (Lines 78-87, 94-137)  
   *Why:* Contains the core Haversine distance formula, radius filtering, coordinate validation, and review aggregation logic.
2. **`backend/src/main/java/com/messmap/modules/mess/controller/MessController.java`** (Lines 45, 110, 150)  
   *Why:* The public REST gateway for mess discovery, paged searches, and nearby lookups. Demonstrates how route precedence avoids path variable collisions.
3. **`backend/src/main/java/com/messmap/config/SecurityConfig.java`** (Lines 41-71)  
   *Why:* The central security filter chain configuring stateless sessions, JWT filter ordering, public endpoints, and role-based URL access rules.
4. **`backend/src/main/java/com/messmap/security/JwtTokenProvider.java`** (Lines 74-87, 130-146)  
   *Why:* Generates, parses, and validates signed HMAC-SHA256 JWT tokens with custom user ID and role claims.
5. **`backend/src/main/java/com/messmap/modules/admin/service/AdminMessVerificationService.java`** (Lines 86-263)  
   *Why:* Implements the deterministic state machine for approving, rejecting, suspending, unsuspending, and removing mess listings with audit logging.
6. **`backend/src/main/java/com/messmap/modules/mess/service/OwnerMessService.java`** (Lines 230-260)  
   *Why:* Enforces ownership verification (preventing IDOR) and gates operating status transitions (`OPEN`/`CLOSED`), triggering notifications.
7. **`backend/src/main/java/com/messmap/modules/notification/service/NotificationService.java`** (Lines 42-104)  
   *Why:* Implements student in-app notification creation, recipient prioritization (favorited students first), and the 1-hour deduplication window.
8. **`frontend/src/utils/geocoding.ts`** (Lines 108-286)  
   *Why:* Core frontend geospatial utility containing OpenStreetMap Nominatim forward/reverse geocoding, 31 offline campus fallbacks, and Haversine math.
9. **`frontend/src/modules/auth/RegisterPage.tsx`** (Lines 56-72, 167-285)  
   *Why:* Demonstrates interactive Leaflet map integration, device geolocation acquisition, and race-condition prevention during marker dragging.
10. **`backend/src/main/resources/db/migration/V1__initial_schema.sql`** (Lines 12-168)  
    *Why:* The foundational Flyway database migration script defining primary keys, foreign key cascading constraints, indexes, and column datatypes.

---

## 5. Key API Routes to Memorize

| Action | HTTP Method | Exact Route | Auth Required |
| :--- | :--- | :--- | :--- |
| **Student Register** | `POST` | `/api/auth/student/register` | None (Public) |
| **Student Login** | `POST` | `/api/auth/student/login` | None (Public) |
| **Owner / Admin Login** | `POST` | `/api/auth/login` | None (Public) |
| **Get Current User** | `GET` | `/api/auth/me` | Bearer Token |
| **Discover Messes** | `GET` | `/api/messes` | None (Public) |
| **Nearby Mess Search** | `GET` | `/api/messes/nearby?latitude=...&longitude=...&radiusKm=...` | None (Public) |
| **Mess Details** | `GET` | `/api/messes/{id}` | None (Public) |
| **Owner Mess Profile** | `GET / PUT` | `/api/v1/owner/mess/profile` | `ROLE_MESS_OWNER` |
| **Owner Menu Items** | `POST / PUT / DEL` | `/api/v1/owner/mess/menu/items` | `ROLE_MESS_OWNER` |
| **Student Favorites** | `GET / POST / DEL` | `/api/student/favorites` | `ROLE_STUDENT` |
| **Student Notifications** | `GET` | `/api/student/notifications` | `ROLE_STUDENT` |
| **Unread Alerts Count** | `GET` | `/api/student/notifications/unread-count` | `ROLE_STUDENT` |
| **Admin Pending Queue** | `GET` | `/api/admin/messes/pending` | `ROLE_ADMIN` |
| **Admin Approve Mess** | `PUT` | `/api/admin/messes/{id}/approve` | `ROLE_ADMIN` |
| **Admin Suspend Mess** | `PUT` | `/api/admin/messes/{id}/suspend` | `ROLE_ADMIN` |

---

## 6. Glossary of Technical Terms in Plain English

- **ACID:** A set of database properties (Atomicity, Consistency, Isolation, Durability) ensuring transactions are processed reliably without partial failures.
- **BCrypt:** A secure, one-way password hashing function with an adaptive cost factor and built-in salt that protects passwords against rainbow table attacks.
- **CORS (Cross-Origin Resource Sharing):** A browser security mechanism that controls whether web pages running on one origin (e.g. `localhost:5173`) can make HTTP requests to a backend on another origin (e.g. `localhost:8080`).
- **DTO (Data Transfer Object):** A plain object used to transfer data between client and server, stripping out database-specific concerns and sensitive fields.
- **Flyway:** An open-source database migration tool that manages schema changes using numbered SQL scripts (`V1`, `V2`, etc.).
- **Great-Circle Distance:** The shortest distance between two points on the spherical surface of the Earth, measured along the surface rather than through the interior.
- **Haversine Formula:** An astronomical and navigational mathematical equation used to calculate great-circle distances between pairs of latitude and longitude coordinates.
- **IDOR (Insecure Direct Object Reference):** A security vulnerability where an application allows an attacker to access or modify resources belonging to another user simply by altering a record ID in the request.
- **JWT (JSON Web Token):** A compact, URL-safe standard (RFC 7519) for transmitting digitally signed claims between two parties.
- **Lazy Loading:** A design pattern where child database relationships (e.g. a mess's reviews) are not loaded into memory until they are explicitly accessed in code.
- **Nominatim:** The official open-source search engine for OpenStreetMap data, providing forward and reverse geocoding APIs.
- **RBAC (Role-Based Access Control):** A security model where system permissions are assigned to specific roles (`ROLE_STUDENT`, `ROLE_MESS_OWNER`, `ROLE_ADMIN`) rather than individual users.
- **Reverse Geocoding:** The process of converting geographic GPS coordinates (latitude and longitude) into a readable street address, neighborhood, and postal PIN code.
- **Stateless Session:** A server architecture where each HTTP request contains all necessary authentication credentials (e.g. in a JWT), requiring no server-side session memory.

---

## 7. Common Mentor Follow-Up Questions & Traps to Avoid

### Trap 1: Claiming the map calculates the distances
- **The Mistake:** Saying *"Leaflet calculates which messes are nearby."*
- **The Correction:** *"Leaflet is purely a client-side rendering library for tile display and markers. Distance calculations and radius filtering are executed by our backend `MessDiscoveryService` using the mathematical Haversine formula, with an identical formula implemented in TypeScript for responsive client-side toggling."*

### Trap 2: Claiming you use Google Maps API
- **The Mistake:** Saying *"We use Google Maps for finding locations."*
- **The Correction:** *"We deliberately avoid Google Maps to keep MessMap 100% free and open-source without requiring paid billing credentials. We use Leaflet with OpenStreetMap raster tiles for rendering, and the OpenStreetMap Nominatim API for forward and reverse geocoding."*

### Trap 3: Claiming all database migrations run automatically without Flyway
- **The Mistake:** Saying *"Hibernate auto-generates our database schema using `ddl-auto=update`."*
- **The Correction:** *"In production-grade software, `ddl-auto=update` is dangerous because it can alter or drop production columns unexpectedly. We use `ddl-auto=validate` and rely exclusively on Flyway versioned SQL scripts (`V1` through `V8`) for controlled, auditable schema evolution."*

### Trap 4: Claiming complaints are fully functional in the UI
- **The Mistake:** Demonstrating or claiming students can file complaints through the website.
- **The Correction:** *"The database table (`complaints`) and Spring Data JPA repository are implemented in backend migration `V2`, but the student grievance submission controller and UI forms are currently planned. Open complaints are currently monitored via administrative metrics."*

### Trap 5: Claiming tests pass on any arbitrary Java version
- **The Mistake:** Saying *"Our tests run anywhere on Java 8 to Java 25."*
- **The Correction:** *"Our project targets Java 17 LTS. Java 25 enforces strict ByteBuddy agent loading restrictions under JEP 451 that require additional JVM runtime flags for Mockito inlined mocks. All 344 tests pass cleanly with zero failures under Java 17."*
