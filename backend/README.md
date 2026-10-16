# MessMap — Spring Boot 3 Backend Foundation

Backend service for **MessMap**, the campus mess discovery and meal subscription platform.

---

## 🛠️ Technology Stack

- **Java:** 17 LTS (Compatible with Java 17 and 21)
- **Framework:** Spring Boot 3.3.4
- **Build Tool:** Maven 3.9+ (includes Maven Wrapper `./mvnw`)
- **Database:** MySQL 8.x
- **ORM / Persistence:** Spring Data JPA, Hibernate ORM 6.5
- **Database Migrations:** Flyway 10.x (`flyway-mysql`)
- **Security & Cryptography:** Spring Security 6 with BCrypt password hashing (`BCryptPasswordEncoder`)
- **Validation:** Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Size`, `@Email`)
- **Boilerplate Reduction:** Project Lombok
- **Testing:** JUnit 5, MockMvc, AssertJ, Spring Test, In-Memory H2 in MySQL mode

---

## 📋 Environment Variables

All sensitive credentials and environment-dependent options are loaded from environment variables or `.env`.

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `BACKEND_PORT` | `8080` | Port for the Spring Boot HTTP server |
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profile (`dev`, `prod`, `h2`, `test`) |
| `MYSQL_HOST` | `localhost` | MySQL host address |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DATABASE` | `messmap_db` | MySQL database name |
| `MYSQL_USER` | `messmap_user` | MySQL database username |
| `MYSQL_PASSWORD` | `messmap_secret_password` | MySQL database password |
| `MYSQL_ROOT_PASSWORD` | `messmap_root_password` | MySQL root administrative password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000` | Comma-separated list of allowed frontend origins |
| `SHOW_SQL` | `false` | Enable/disable SQL query logging to console |
| `JWT_SECRET` | `404E6352...` | 256-bit secret key for JWT signing |
| `JWT_EXPIRATION_MS` | `86400000` | JWT expiration duration in milliseconds (24 hours) |

---

## 🗄️ Database Setup & Migrations

### 1. Running MySQL with Docker

From the root of the repository:

```bash
docker compose -f database/docker-compose-db.yml up -d
```

This starts a containerized MySQL 8 instance with persistent data storage and creates the `messmap_db` database with the user `messmap_user`.

### 2. Manual MySQL Setup

If using a local native MySQL installation:

```sql
CREATE DATABASE messmap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'messmap_user'@'localhost' IDENTIFIED BY 'messmap_secret_password';
GRANT ALL PRIVILEGES ON messmap_db.* TO 'messmap_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Flyway Database Migrations

Database schema versioning is managed via **Flyway**.
- Migration scripts are located in: `backend/src/main/resources/db/migration/`
- Naming format: `V<Version>__<Description>.sql` (e.g., `V1__initial_schema.sql`)
- Flyway automatically checks and executes pending migrations on application startup.
- Never modify an already-executed migration script. Always create a new version (`V2__...`).

---

## 🚀 Building & Running

### Prerequisites
- JDK 17 or JDK 21 installed.
- Ensure `JAVA_HOME` points to your JDK 17 or 21 installation (e.g. `export JAVA_HOME=$(/usr/libexec/java_home -v 21)` on macOS).

### 1. Build & Package
```bash
cd backend
./mvnw clean package
```

### 2. Run Automated Tests
```bash
cd backend
./mvnw test
```
The test suite utilizes in-memory H2 running in MySQL mode, executing the full Flyway migration and validating all entity relationships without requiring an active external MySQL connection.

### 3. Run Locally with MySQL (Default)
```bash
cd backend
./mvnw spring-boot:run
```
The server will start on `http://localhost:8080`.

### 4. Run Standalone with In-Memory Database (H2 Profile)
For rapid frontend testing or demonstrations without running a MySQL server:
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```

---

## 🩺 Health Check Endpoint

- **URL:** `GET /api/v1/health`
- **Response Format:**
```json
{
  "success": true,
  "message": "MessMap backend service is operational",
  "data": {
    "status": "UP",
    "service": "MessMap Backend API",
    "version": "1.0.0",
    "environment": "dev",
    "timestamp": "2026-10-16T16:17:08.21605"
  },
  "timestamp": "2026-10-16T16:17:08.21654"
}
```

---

## 📐 Shared Entity Schema & Relationships

### Core Entities

1. **`User` (`users`)**
   - **Fields:** `id`, `name`, `email`, `password`, `phone`, `role`, `status`, `college`, `hostel`, `avatarUrl`, `createdAt`, `updatedAt`
   - **Roles:** `ROLE_STUDENT`, `ROLE_MESS_OWNER`, `ROLE_ADMIN`
   - **Statuses:** `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`
   - **Security:** Passwords hashed with BCrypt. Never stored in plaintext.

2. **`Mess` (`messes`)**
   - **Fields:** `id`, `owner_id` (FK to `users`), `name`, `description`, `phone`, `email`, `address`, `area`, `city`, `state`, `pincode`, `latitude`, `longitude`, `foodType`, `dailyPrice`, `monthlyPrice`, `status`, `operatingStatus`, `openingTime`, `closingTime`, `rejectionReason`, `heroImage`, `capacity`, `createdAt`, `updatedAt`
   - **Status (`MessStatus`):** `PENDING`, `APPROVED`, `REJECTED`, `UNDER_REVIEW`, `SUSPENDED`
   - **Operating Status (`OperatingStatus`):** `OPEN`, `CLOSED`, `TEMPORARY_CLOSURE`
   - **Food Type (`FoodType`):** `PURE_VEG`, `VEG_AND_NON_VEG`, `JAIN_FRIENDLY`

3. **`Facility` & `mess_facilities`**
   - Standard mess amenities (`WiFi`, `RO Purified Water`, `Hot Water`, `AC Dining`, `Parking Space`, `CCTV Security`).
   - Many-to-many relationship with `Mess`.

4. **`MessImage` (`mess_images`)**
   - Showcase gallery images and banners. `isPrimary` flag denotes banner.

5. **`MenuItem` (`menu_items`)**
   - **Fields:** `id`, `mess_id` (FK), `name`, `description`, `mealType`, `price`, `isAvailable`, `dayOfWeek`, `createdAt`, `updatedAt`
   - **Meal Types:** `BREAKFAST`, `LUNCH`, `DINNER`, `SPECIAL`

6. **`Review` (`reviews`)**
   - **Fields:** `id`, `user_id` (FK), `mess_id` (FK), `rating` (1..5), `comment`, `foodQualityScore` (1..5), `hygieneScore` (1..5), `status`, `createdAt`, `updatedAt`
   - **Status:** `PUBLISHED`, `FLAGGED`, `REMOVED`

7. **`Favorite` (`favorites`)**
   - **Fields:** `id`, `user_id` (FK), `mess_id` (FK), `createdAt`
   - Enforces unique constraint on `(user_id, mess_id)`.

---

## 🤝 Handoff Conventions for Anushka & Sarthak

### For Anushka (`Anushka0431` — Student/User Module):
- Reuse `com.messmap.modules.user.entity.User`, `Role`, `UserStatus`, and `UserRepository`.
- For student discovery queries, query approved messes via `messRepository.findByStatus(MessStatus.APPROVED)` or search by city / coordinates.
- For student reviews, use `ReviewRepository` and link to authenticated `User` and target `Mess`.
- For student saved messes, use `FavoriteRepository`.
- All student controller endpoints should return responses wrapped in `ApiResponse<T>`.

### For Sarthak (`SarthakM28` — Mess Owner Module):
- Reuse `com.messmap.modules.mess.entity.Mess`, `MessStatus`, `OperatingStatus`, `FoodType`, and `MessRepository`.
- When an owner submits a new listing, set `status = MessStatus.PENDING`.
- For owner menu operations, use `com.messmap.modules.menu.entity.MenuItem` and `MenuItemRepository`.
- Ensure an owner can only update messes matching their own `owner.getId()`.
- Use `OperatingStatus.OPEN` / `OperatingStatus.CLOSED` / `OperatingStatus.TEMPORARY_CLOSURE` for availability toggles.

### API Conventions:
- Standard success envelope: `ApiResponse<T>` with `success`, `message`, `data`, and `timestamp`.
- Standard error envelope: `ErrorResponse` handled by `GlobalExceptionHandler`. Throw `ResourceNotFoundException`, `BadRequestException`, or `DuplicateResourceException` directly from services.
- Password hashing: Inject `PasswordEncoder` (configured as `BCryptPasswordEncoder`) — never store plain text passwords.
