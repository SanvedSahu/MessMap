# MessMap — Complete Verified API Reference & Endpoint Inventory

> **Audited Branch:** `integration/backend-demo`  
> **Backend Framework:** Spring Boot 3.3.4 (Embedded Apache Tomcat 10.1.30)  
> **Base URLs:** `/api` and `/api/v1` (Dual-path compatibility enabled)  
> **Status Evidence:** `[Verified in source]` | `[Partial]` | `[Planned]`  

---

## Summary Matrix of Implemented Modules

| Module | Primary Controller | Base Routes | Authorized Roles | DB Tables Affected | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `AuthController`, `StudentAuthController` | `/api/auth/**`, `/api/v1/auth/**` | Public / Authenticated | `users` (Read/Write) | `[Verified in source]` |
| **Student Profile** | `StudentProfileController` | `/api/student/profile` | `ROLE_STUDENT`, `ROLE_ADMIN` | `users` (Read/Write) | `[Verified in source]` |
| **Owner Profile** | `OwnerProfileController` | `/api/owner/profile`, `/api/v1/owner/profile` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `users` (Read/Write) | `[Verified in source]` |
| **Mess Discovery (Public)** | `MessController` | `/api/messes/**`, `/api/v1/messes/**` | Public (Unauthenticated) | `messes`, `menu_items`, `reviews`, `facilities`, `mess_images` (Read) | `[Verified in source]` |
| **Owner Mess Management** | `OwnerMessController` | `/api/owner/mess/**`, `/api/v1/owner/mess/**` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `messes`, `facilities`, `mess_facilities` (Read/Write) | `[Verified in source]` |
| **Owner Menu & Pricing** | `OwnerMenuController` | `/api/owner/mess/menu/**`, `/api/v1/owner/mess/menu/**` | `ROLE_MESS_OWNER`, `ROLE_ADMIN` | `menu_items`, `messes` (Read/Write) | `[Verified in source]` |
| **Reviews & Ratings** | `ReviewController` | `/api/reviews/**`, `/api/v1/reviews/**` | Public (GET), `ROLE_STUDENT` (POST/PUT/DEL) | `reviews`, `messes`, `users` (Read/Write) | `[Verified in source]` |
| **Student Favorites** | `StudentFavoriteController` | `/api/student/favorites/**`, `/api/v1/student/favorites/**` | `ROLE_STUDENT`, `ROLE_ADMIN` | `favorites`, `messes` (Read/Write) | `[Verified in source]` |
| **Student Notifications** | `StudentNotificationController` | `/api/student/notifications/**` | `ROLE_STUDENT`, `ROLE_ADMIN` | `notifications`, `messes` (Read/Write) | `[Verified in source]` |
| **Admin Mess Governance** | `AdminMessController` | `/api/admin/messes/**`, `/api/v1/admin/messes/**` | `ROLE_ADMIN` | `messes`, `suspension_review_requests` (Read/Write) | `[Verified in source]` |
| **Admin User Governance** | `AdminUserController` | `/api/admin/users/**`, `/api/v1/admin/users/**` | `ROLE_ADMIN` | `users` (Read/Write) | `[Verified in source]` |
| **Admin Dashboard Metrics** | `AdminMetricsController` | `/api/admin/metrics/**` | `ROLE_ADMIN` | `users`, `messes`, `complaints` (Read) | `[Verified in source]` |
| **System Health** | `HealthController` | `/api/health`, `/api/v1/health` | Public | None | `[Verified in source]` |
| **Complaints & Grievances** | None (Repo only) | *Planned* (`/api/student/complaints`) | `ROLE_STUDENT`, `ROLE_ADMIN` | `complaints` (Table exists in V2) | `[Partial / Planned]` |

---

## 1. Authentication & Registration Module

### 1.1 Register Student Account
- **HTTP Method:** `POST`
- **Routes:** `/api/auth/student/register`, `/api/v1/auth/student/register`
- **Purpose:** Creates a new student user profile with BCrypt hashed password and returns a signed JWT token.
- **Access Role:** Public (Unauthenticated)
- **Headers:** `Content-Type: application/json`
- **Request Body Fields:**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@coep.ac.in",
    "password": "SecurePassword123!",
    "phone": "+91 9822012345",
    "college": "COEP Technological University",
    "hostel": "Hostel Block B",
    "dietaryPreference": "VEG"
  }
  ```
- **Response Example (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Student registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 86400000,
      "user": {
        "id": 101,
        "name": "Aarav Sharma",
        "email": "aarav.sharma@coep.ac.in",
        "phone": "+91 9822012345",
        "role": "ROLE_STUDENT",
        "status": "ACTIVE",
        "college": "COEP Technological University",
        "dietaryPreference": "VEG"
      }
    },
    "timestamp": "2026-10-27T11:30:00"
  }
  ```
- **Source Paths:**
  - Controller: `com.messmap.modules.user.controller.StudentAuthController`
  - Service: `com.messmap.modules.user.service.StudentAuthService`
  - Entity: `com.messmap.modules.user.entity.User`
  - Repository: `com.messmap.modules.user.repository.UserRepository`
- **Tables Affected:** `users` (Write - Insert)
- **Validation & Error Cases:**
  - `400 Bad Request`: Email missing or invalid format; password shorter than 6 characters; email already registered.
- **Status:** `[Verified in source]`

---

### 1.2 Student Login
- **HTTP Method:** `POST`
- **Routes:** `/api/auth/student/login`, `/api/v1/auth/student/login`
- **Purpose:** Authenticates student credentials and returns a 24-hour JWT token.
- **Access Role:** Public
- **Request Body:** `{"email": "aarav.sharma@coep.ac.in", "password": "SecurePassword123!"}`
- **Source Paths:** `StudentAuthController.java` -> `StudentAuthService.java` -> `JwtTokenProvider.java`
- **Tables Affected:** `users` (Read)
- **Status:** `[Verified in source]`

---

### 1.3 Register Mess Owner Account
- **HTTP Method:** `POST`
- **Routes:** `/api/auth/register/owner`, `/api/auth/owner/register`, `/api/v1/auth/register/owner`, `/api/v1/auth/owner/register`
- **Purpose:** Registers a mess owner account. Role assigned is strictly `ROLE_MESS_OWNER`.
- **Access Role:** Public
- **Request Body:**
  ```json
  {
    "name": "Rajesh Patil",
    "email": "rajesh.patil@fc-dining.com",
    "password": "OwnerSecret456!",
    "phone": "+91 9422098765"
  }
  ```
- **Source Paths:** `AuthController.java` -> `AuthService.java`
- **Tables Affected:** `users` (Write - Insert)
- **Status:** `[Verified in source]`

---

### 1.4 General / Owner Login
- **HTTP Method:** `POST`
- **Routes:** `/api/auth/login`, `/api/auth/owner/login`, `/api/v1/auth/login`, `/api/v1/auth/owner/login`
- **Purpose:** Authenticates Owners and Administrators.
- **Access Role:** Public
- **Request Body:** `{"email": "rajesh.patil@fc-dining.com", "password": "OwnerSecret456!"}`
- **Source Paths:** `AuthController.java` -> `AuthService.java`
- **Tables Affected:** `users` (Read)
- **Status:** `[Verified in source]`

---

### 1.5 Get Current Authenticated User (`/me`)
- **HTTP Method:** `GET`
- **Routes:** `/api/auth/me`, `/api/v1/auth/me`
- **Purpose:** Validates the JWT Bearer token and returns the current user profile.
- **Access Role:** Authenticated (`ROLE_STUDENT`, `ROLE_MESS_OWNER`, `ROLE_ADMIN`)
- **Headers:** `Authorization: Bearer <token>`
- **Source Paths:** `AuthController.java`
- **Tables Affected:** `users` (Read)
- **Status:** `[Verified in source]`

---

## 2. Mess Discovery & Public Nearby Search Module

### 2.1 Discover Approved Messes (Multi-Filter & Pagination)
- **HTTP Method:** `GET`
- **Routes:** `/api/messes`, `/api/v1/messes`
- **Purpose:** Discovers approved messes with multi-criteria filtering by search keyword, dietary category, locality, city, price range, and pagination. Excludes non-approved messes.
- **Access Role:** Public (Unauthenticated)
- **Query Parameters:**
  - `search` (string, optional): Matches mess name, area, or street address.
  - `foodType` (string, optional): `VEG`, `NON_VEG`, `BOTH`, `PURE_VEG`, `VEG_AND_NON_VEG`, `JAIN_FRIENDLY`, `ALL`.
  - `locality` (string, optional): Filter by area name.
  - `city` (string, optional): City name (default Pune).
  - `minPrice` (decimal, optional): Minimum monthly or daily price.
  - `maxPrice` (decimal, optional): Maximum monthly or daily price.
  - `includeClosed` (boolean, optional): If false, returns only operatingStatus = OPEN.
  - `page` (int, optional, 0-indexed): Page number.
  - `size` (int, optional, default 20): Page size.
- **Example Request:**
  `GET /api/messes?foodType=PURE_VEG&city=Pune&maxPrice=3500&page=0&size=10`
- **Response Fields:**
  - Array of `MessSummaryResponse`: `id`, `name`, `address`, `area`, `city`, `foodType`, `dailyPrice`, `monthlyPrice`, `status`, `operatingStatus`, `heroImage`, `facilities`, `gallery`.
- **Source Paths:**
  - Controller: `com.messmap.modules.mess.controller.MessController` (line 45)
  - Service: `com.messmap.modules.mess.service.MessDiscoveryService` (line 52)
  - Specification: `com.messmap.modules.mess.repository.MessSpecification`
  - Repository: `com.messmap.modules.mess.repository.MessRepository`
- **Tables Affected:** `messes`, `facilities`, `mess_facilities`, `mess_images` (Read)
- **Validation & Error Cases:**
  - `400 Bad Request`: `minPrice < 0`, `maxPrice < 0`, `minPrice > maxPrice`, `page < 0`, `size <= 0`.
- **Status:** `[Verified in source]`

---

### 2.2 Discover Nearby Approved Messes (Haversine Radius Search)
- **HTTP Method:** `GET`
- **Routes:** `/api/messes/nearby`, `/api/v1/messes/nearby`
- **Purpose:** Discovers approved messes within a specified distance threshold (in kilometers) from student device coordinates using the Haversine formula. Results are sorted ascending by distance.
- **Access Role:** Public (Unauthenticated)
- **Required Query Parameters:**
  - `latitude` (Double, mandatory): Student latitude (`-90.0` to `90.0`).
  - `longitude` (Double, mandatory): Student longitude (`-180.0` to `180.0`).
  - `radiusKm` (Double, optional, default `5.0` km): Search radius threshold (`0.0 < radiusKm <= 100.0`).
  - Optional filters: `search`, `foodType`, `minPrice`, `maxPrice`, `includeClosed`.
- **Example Request:**
  `GET /api/messes/nearby?latitude=18.5298&longitude=73.8565&radiusKm=2.5&foodType=VEG`
- **Example Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Nearby approved messes retrieved successfully (2 found within 2.5 km)",
    "data": [
      {
        "id": 12,
        "name": "Annapurna Executive Mess",
        "address": "Opposite COEP Hostel, Shivajinagar",
        "area": "Shivajinagar",
        "city": "Pune",
        "latitude": 18.5285000,
        "longitude": 73.8552000,
        "foodType": "PURE_VEG",
        "monthlyPrice": 3200.00,
        "dailyPrice": 110.00,
        "status": "APPROVED",
        "operatingStatus": "OPEN",
        "distanceKm": 0.20,
        "heroImage": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
      },
      {
        "id": 18,
        "name": "Fergusson Premium Dining",
        "address": "FC Road, Shivajinagar",
        "area": "Shivajinagar",
        "city": "Pune",
        "latitude": 18.5236000,
        "longitude": 73.8418000,
        "foodType": "PURE_VEG",
        "monthlyPrice": 3400.00,
        "dailyPrice": 120.00,
        "status": "APPROVED",
        "operatingStatus": "OPEN",
        "distanceKm": 1.70,
        "heroImage": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
      }
    ],
    "timestamp": "2026-10-27T11:30:15"
  }
  ```
- **Source Paths:**
  - Controller: `MessController.java` (line 110)
  - Service: `MessDiscoveryService.java` (lines 78-87 Haversine, lines 94-137 radius filter)
- **Tables Affected:** `messes` (Read)
- **Validation & Error Cases:**
  - `400 Bad Request`: Latitude null or `< -90` or `> 90`.
  - `400 Bad Request`: Longitude null or `< -180` or `> 180`.
  - `400 Bad Request`: `radiusKm <= 0` or `radiusKm > 100`.
  - Messes with null coordinates are excluded safely without throwing exceptions.
- **Status:** `[Verified in source]`

---

### 2.3 Get Approved Mess Details by ID
- **HTTP Method:** `GET`
- **Routes:** `/api/messes/{id}`, `/api/v1/messes/{id}`
- **Purpose:** Retrieves full mess profile, verified facilities, active menu items (`is_available = true`), structured meal timings, and aggregated review rating and count.
- **Access Role:** Public (Unauthenticated)
- **Path Variable:** `id` (Long): Mess primary key.
- **Source Paths:**
  - Controller: `MessController.java` (line 150)
  - Service: `MessDiscoveryService.java` (line 168)
  - Repositories: `MessRepository`, `MenuItemRepository`, `ReviewRepository`
- **Tables Affected:** `messes`, `menu_items`, `reviews`, `facilities`, `mess_images` (Read)
- **Validation & Error Cases:**
  - `404 Not Found`: If mess ID does not exist or if mess is in `PENDING`, `REJECTED`, `SUSPENDED`, or `REMOVED` status.
- **Status:** `[Verified in source]`

---

## 3. Mess Owner Management Module

### 3.1 Get Authenticated Owner Mess Profile
- **HTTP Method:** `GET`
- **Routes:** `/api/v1/owner/mess/profile`, `/api/owner/mess/profile`
- **Purpose:** Retrieves the primary mess profile belonging to the authenticated mess owner.
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Headers:** `Authorization: Bearer <token>`
- **Source Paths:** `OwnerMessController.java` -> `OwnerMessService.java`
- **Tables Affected:** `messes` (Read)
- **Status:** `[Verified in source]`

---

### 3.2 Update Owner Mess Profile & Operating Status
- **HTTP Method:** `PUT`
- **Routes:** `/api/v1/owner/mess/profile`, `/api/owner/mess/profile`
- **Purpose:** Updates mess address, pricing, capacity, and operating status (`OPEN` / `CLOSED`).
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Special Business Logic (Trigger Gate):**
  - If `operatingStatus` transitions from `CLOSED` to `OPEN`, the mess MUST be in `APPROVED` status.
  - If mess is `SUSPENDED` -> `400 Bad Request` ("Cannot open mess: The listing is currently suspended by an administrator.").
  - If mess is `REMOVED` -> `400 Bad Request` ("Cannot open mess: The listing has been removed by an administrator.").
  - If transition succeeds, automatically invokes `NotificationService.createMessOpenedNotifications(updatedMess)`.
- **Source Paths:** `OwnerMessController.java` (line 62) -> `OwnerMessService.java` (line 179)
- **Tables Affected:** `messes` (Write - Update), `notifications` (Write - Insert on trigger)
- **Status:** `[Verified in source]`

---

### 3.3 Create New Mess Listing
- **HTTP Method:** `POST`
- **Routes:** `/api/v1/owner/mess/profile`, `/api/owner/mess/profile`
- **Purpose:** Creates a new mess listing in `PENDING` verification status.
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Request Body Fields:** `name`, `address`, `area`, `city`, `pincode`, `latitude`, `longitude`, `foodType`, `dailyPrice`, `monthlyPrice`, `breakfastPrice`, `lunchPrice`, `dinnerPrice`, `capacity`, `facilityIds`.
- **Source Paths:** `OwnerMessController.java` (line 78) -> `OwnerMessService.java` (line 52)
- **Tables Affected:** `messes`, `mess_facilities` (Write - Insert)
- **Status:** `[Verified in source]`

---

### 3.4 Update Mess Meal Timings
- **HTTP Method:** `PUT`
- **Routes:** `/api/v1/owner/mess/timings`, `/api/owner/mess/timings`
- **Purpose:** Configures daily operational schedules for Breakfast, Lunch, Dinner, Opening Time, and Closing Time.
- **Request Body:**
  ```json
  {
    "breakfastTiming": "07:30 AM – 10:00 AM",
    "lunchTiming": "12:15 PM – 03:00 PM",
    "dinnerTiming": "07:30 PM – 10:15 PM",
    "openingTime": "07:30 AM",
    "closingTime": "10:15 PM"
  }
  ```
- **Source Paths:** `OwnerMessController.java` (line 134) -> `OwnerMessService.java` (line 267)
- **Tables Affected:** `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

## 4. Menu & Pricing Module

### 4.1 Get Owner Mess Menu
- **HTTP Method:** `GET`
- **Routes:** `/api/v1/owner/mess/menu`, `/api/owner/mess/menu`
- **Purpose:** Retrieves all dishes categorized by meal type and day of the week, plus configured meal pricing.
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Source Paths:** `OwnerMenuController.java` (line 38) -> `OwnerMenuService.java`
- **Tables Affected:** `menu_items`, `messes` (Read)
- **Status:** `[Verified in source]`

---

### 4.2 Add Menu Item
- **HTTP Method:** `POST`
- **Routes:** `/api/v1/owner/mess/menu/items`, `/api/owner/mess/menu/items`
- **Purpose:** Adds a new dish to the mess menu.
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "name": "Paneer Butter Masala",
    "description": "Rich tomato butter gravy with soft paneer cubes",
    "mealType": "DINNER",
    "price": 120.00,
    "isAvailable": true,
    "isSpecial": true,
    "dayOfWeek": "WEDNESDAY"
  }
  ```
- **Source Paths:** `OwnerMenuController.java` (line 74) -> `OwnerMenuService.java` (line 72)
- **Tables Affected:** `menu_items` (Write - Insert)
- **Validation:** `name` not blank; `mealType` must be `BREAKFAST`, `LUNCH`, or `DINNER`; `price >= 0`.
- **Status:** `[Verified in source]`

---

### 4.3 Update Menu Item
- **HTTP Method:** `PUT`
- **Routes:** `/api/v1/owner/mess/menu/items/{id}`, `/api/owner/mess/menu/items/{id}`
- **Purpose:** Updates dish details, availability toggle, or pricing.
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Source Paths:** `OwnerMenuController.java` (line 92) -> `OwnerMenuService.java` (line 108)
- **Tables Affected:** `menu_items` (Write - Update)
- **Status:** `[Verified in source]`

---

### 4.4 Delete Menu Item
- **HTTP Method:** `DELETE`
- **Routes:** `/api/v1/owner/mess/menu/items/{id}`, `/api/owner/mess/menu/items/{id}`
- **Purpose:** Removes a dish from the menu.
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Source Paths:** `OwnerMenuController.java` (line 110) -> `OwnerMenuService.java` (line 154)
- **Tables Affected:** `menu_items` (Write - Delete)
- **Status:** `[Verified in source]`

---

### 4.5 Update Mess Meal Pricing
- **HTTP Method:** `PUT`
- **Routes:** `/api/v1/owner/mess/menu`, `/api/owner/mess/menu`
- **Purpose:** Updates overarching meal rates (`breakfastPrice`, `lunchPrice`, `dinnerPrice`, `dailyPrice`, `monthlyPrice`).
- **Access Role:** `ROLE_MESS_OWNER`, `ROLE_ADMIN`
- **Source Paths:** `OwnerMenuController.java` (line 56) -> `OwnerMenuService.java` (line 177)
- **Tables Affected:** `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

## 5. Reviews and Ratings Module

### 5.1 Submit Student Review
- **HTTP Method:** `POST`
- **Routes:** `/api/reviews`, `/api/v1/reviews`
- **Purpose:** Allows an authenticated student to submit a rating (1-5 stars) and feedback for a mess.
- **Access Role:** `ROLE_STUDENT`
- **Request Body:**
  ```json
  {
    "messId": 12,
    "rating": 5,
    "comment": "Hygiene is top tier and hot phulkas served promptly!",
    "foodQualityScore": 5,
    "hygieneScore": 5
  }
  ```
- **Source Paths:** `ReviewController.java` -> `ReviewService.java` -> `ReviewRepository.java`
- **Tables Affected:** `reviews` (Write - Insert)
- **Status:** `[Verified in source]`

---

### 5.2 Get Published Reviews for a Mess
- **HTTP Method:** `GET`
- **Routes:** `/api/reviews/mess/{messId}`, `/api/v1/reviews/mess/{messId}`
- **Purpose:** Public endpoint retrieving published reviews for an approved mess.
- **Access Role:** Public (Unauthenticated)
- **Source Paths:** `ReviewController.java` -> `ReviewRepository.findByMessIdAndStatusOrderByCreatedAtDesc`
- **Tables Affected:** `reviews` (Read)
- **Status:** `[Verified in source]`

---

## 6. Student Favorites Module

### 6.1 Get Student Favorites
- **HTTP Method:** `GET`
- **Routes:** `/api/student/favorites`, `/api/v1/student/favorites`
- **Purpose:** Retrieves all messes bookmarked by the authenticated student.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Headers:** `Authorization: Bearer <token>`
- **Source Paths:** `StudentFavoriteController.java` -> `FavoriteService.java`
- **Tables Affected:** `favorites`, `messes` (Read)
- **Status:** `[Verified in source]`

---

### 6.2 Add Mess to Favorites
- **HTTP Method:** `POST`
- **Routes:** `/api/student/favorites`, `/api/v1/student/favorites`
- **Purpose:** Bookmarks a mess. Enforces unique constraint `uk_favorites_user_mess`.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Request Body:** `{"messId": 12}`
- **Source Paths:** `StudentFavoriteController.java` -> `FavoriteService.java`
- **Tables Affected:** `favorites` (Write - Insert)
- **Status:** `[Verified in source]`

---

### 6.3 Remove Mess from Favorites
- **HTTP Method:** `DELETE`
- **Routes:** `/api/student/favorites/{messId}`, `/api/v1/student/favorites/{messId}`
- **Purpose:** Removes a bookmark.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Source Paths:** `StudentFavoriteController.java` -> `FavoriteService.java`
- **Tables Affected:** `favorites` (Write - Delete)
- **Status:** `[Verified in source]`

---

## 7. Student In-App Notifications Module

### 7.1 Get Student Notifications
- **HTTP Method:** `GET`
- **Routes:** `/api/student/notifications`, `/api/v1/student/notifications`
- **Purpose:** Retrieves in-app alerts for the authenticated student, sorted newest first.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Headers:** `Authorization: Bearer <token>`
- **Source Paths:** `StudentNotificationController.java` (line 34) -> `NotificationService.java` (line 110)
- **Tables Affected:** `notifications`, `messes` (Read)
- **Status:** `[Verified in source]`

---

### 7.2 Get Unread Notification Count
- **HTTP Method:** `GET`
- **Routes:** `/api/student/notifications/unread-count`, `/api/v1/student/notifications/unread-count`
- **Purpose:** Lightweight counter query for the navbar notification bell badge.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Response Example:** `{"success": true, "message": "Unread count retrieved", "data": 3}`
- **Source Paths:** `StudentNotificationController.java` (line 45) -> `NotificationRepository.countByRecipientIdAndIsReadFalse`
- **Tables Affected:** `notifications` (Read)
- **Status:** `[Verified in source]`

---

### 7.3 Mark Single Notification as Read
- **HTTP Method:** `PUT`
- **Routes:** `/api/student/notifications/{id}/read`, `/api/v1/student/notifications/{id}/read`
- **Purpose:** Marks an alert as read and timestamps `read_at`. Enforces ownership check.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Source Paths:** `StudentNotificationController.java` (line 56) -> `NotificationService.java` (line 129)
- **Tables Affected:** `notifications` (Write - Update)
- **Status:** `[Verified in source]`

---

### 7.4 Mark All Notifications as Read
- **HTTP Method:** `PUT`
- **Routes:** `/api/student/notifications/read-all`, `/api/v1/student/notifications/read-all`
- **Purpose:** Bulk marks all unread notifications as read in a single transactional query.
- **Access Role:** `ROLE_STUDENT`, `ROLE_ADMIN`
- **Source Paths:** `StudentNotificationController.java` (line 69) -> `NotificationRepository.markAllAsReadForRecipient`
- **Tables Affected:** `notifications` (Write - Bulk Update)
- **Status:** `[Verified in source]`

---

## 8. Platform Administration & Governance Module

### 8.1 List All Messes for Admin Inspection
- **HTTP Method:** `GET`
- **Routes:** `/api/admin/messes`, `/api/v1/admin/messes`
- **Purpose:** Retrieves messes across all lifecycle statuses (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`, `REMOVED`).
- **Access Role:** `ROLE_ADMIN`
- **Query Parameter:** `status` (string, optional)
- **Source Paths:** `AdminMessController.java` (line 44) -> `AdminMessVerificationService.java` (line 53)
- **Tables Affected:** `messes` (Read)
- **Status:** `[Verified in source]`

---

### 8.2 Approve Mess
- **HTTP Method:** `PUT`
- **Routes:** `/api/admin/messes/{id}/approve`, `/api/v1/admin/messes/{id}/approve`
- **Purpose:** Transitions mess status from `PENDING` (or `UNDER_REVIEW`) to `APPROVED`. Listing immediately becomes discoverable on the public map.
- **Access Role:** `ROLE_ADMIN`
- **Path Variable:** `id` (Long): Mess primary key.
- **Source Paths:** `AdminMessController.java` (line 80) -> `AdminMessVerificationService.java` (line 86)
- **Tables Affected:** `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

### 8.3 Reject Mess
- **HTTP Method:** `PUT`
- **Routes:** `/api/admin/messes/{id}/reject`, `/api/v1/admin/messes/{id}/reject`
- **Purpose:** Rejects a pending mess submission with a mandatory explanation note.
- **Access Role:** `ROLE_ADMIN`
- **Request Body:** `{"reason": "Incomplete address verification and missing FSSAI declaration."}`
- **Source Paths:** `AdminMessController.java` (line 92) -> `AdminMessVerificationService.java` (line 120)
- **Tables Affected:** `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

### 8.4 Suspend Mess
- **HTTP Method:** `PUT`
- **Routes:** `/api/admin/messes/{id}/suspend`, `/api/v1/admin/messes/{id}/suspend`
- **Purpose:** Suspends an approved mess due to health, hygiene, or student grievances. Automatically sets `operatingStatus = CLOSED` and excludes from public discovery.
- **Access Role:** `ROLE_ADMIN`
- **Request Body:** `{"reason": "Multiple student reports of food quality issues under investigation."}`
- **Source Paths:** `AdminMessController.java` (line 104) -> `AdminMessVerificationService.java` (line 158)
- **Tables Affected:** `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

### 8.5 Reactivate / Unsuspend Mess
- **HTTP Method:** `PUT`
- **Routes:** `/api/admin/messes/{id}/reactivate`, `/api/v1/admin/messes/{id}/reactivate`, `/api/admin/messes/{id}/unsuspend`, `/api/v1/admin/messes/{id}/unsuspend`
- **Purpose:** Restores a suspended mess back to `APPROVED` status after corrective action.
- **Access Role:** `ROLE_ADMIN`
- **Source Paths:** `AdminMessController.java` (line 116) -> `AdminMessVerificationService.java` (line 194)
- **Tables Affected:** `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

### 8.6 Permanently Remove Mess
- **HTTP Method:** `DELETE`
- **Routes:** `/api/admin/messes/{id}/remove`, `/api/v1/admin/messes/{id}/remove`, `/api/admin/messes/{id}`, `/api/v1/admin/messes/{id}`
- **Purpose:** Soft-deletes a mess listing by setting `status = REMOVED`, `operatingStatus = CLOSED`, and recording a mandatory `removalReason`. Rejects any pending suspension reviews. Prevents owner reactivation.
- **Access Role:** `ROLE_ADMIN`
- **Request Body:** `{"reason": "Permanent business closure requested by owner."}`
- **Source Paths:** `AdminMessController.java` (line 128) -> `AdminMessVerificationService.java` (line 226)
- **Tables Affected:** `messes`, `suspension_review_requests` (Write - Update)
- **Status:** `[Verified in source]`

---

### 8.7 Review Suspension Appeal Request
- **HTTP Method:** `PUT`
- **Routes:** `/api/admin/messes/suspension-reviews/{id}/review`, `/api/v1/admin/messes/suspension-reviews/{id}/review`
- **Purpose:** Admin adjudicates an owner's suspension appeal (`action = APPROVE` or `REJECT`). If approved, the mess status is restored to `APPROVED`.
- **Access Role:** `ROLE_ADMIN`
- **Request Body:** `{"action": "APPROVE", "adminNotes": "Inspection verified hygiene remediation."}`
- **Source Paths:** `AdminMessController.java` (line 155) -> `AdminMessVerificationService.java` (line 297)
- **Tables Affected:** `suspension_review_requests`, `messes` (Write - Update)
- **Status:** `[Verified in source]`

---

### 8.8 Admin Dashboard Metrics
- **HTTP Method:** `GET`
- **Routes:** `/api/admin/metrics/dashboard`, `/api/v1/admin/metrics/dashboard`, `/api/admin/metrics`, `/api/v1/admin/metrics`
- **Purpose:** Aggregates total students, total owners, pending messes, approved messes, suspended messes, and complaint statistics.
- **Access Role:** `ROLE_ADMIN`
- **Source Paths:** `AdminMetricsController.java` -> `AdminMetricsService.java`
- **Tables Affected:** `users`, `messes`, `complaints` (Read)
- **Status:** `[Verified in source]`

---

## 9. System Health & Infrastructure Module

### 9.1 System Health Check
- **HTTP Method:** `GET`
- **Routes:** `/api/health`, `/api/v1/health`
- **Purpose:** Liveness and readiness probe for dev servers, reverse proxies, and test runners.
- **Access Role:** Public (Unauthenticated)
- **Response Example:**
  ```json
  {
    "status": "UP",
    "timestamp": 1729000000000,
    "service": "messmap-backend"
  }
  ```
- **Source Paths:** `HealthController.java`
- **Tables Affected:** None
- **Status:** `[Verified in source]`
