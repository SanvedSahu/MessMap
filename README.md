# MessMap — Campus Mess Discovery & Meal Subscription Platform

MessMap is a location-based full-stack web application designed to help college students discover, compare, and subscribe to verified mess services near their campus, while empowering mess owners with daily operations tools and giving university administrators oversight.

---

## 🏗️ Repository Architecture (Industry Standard)

The repository follows an enterprise monorepo layout separating Presentation (React + TypeScript), Application (Java Spring Boot), and Data/Orchestration layers:

```text
MessMap/
├── .github/                              # Continuous Integration & Delivery
│   └── workflows/
│       ├── frontend-ci.yml               # Linting, TypeScript checks, and frontend build
│       └── backend-ci.yml                # Maven compilation, test execution, and JAR packaging
├── .editorconfig                         # Universal whitespace & encoding rules
├── .gitignore                            # Comprehensive multi-stack ignore rules
├── .env.example                          # Root environment template for Docker & full stack
├── docker-compose.yml                    # Multi-container orchestration (MySQL + Backend + Frontend)
├── README.md                             # Project setup & developer manual
│
├── frontend/                             # Presentation Layer (React 18 + TypeScript + Vite)
│   ├── .env.example                      # Frontend environment template
│   ├── package.json                      # NPM dependencies & scripts
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   ├── vite.config.ts                    # Vite build tool configuration
│   ├── index.html                        # Application entry HTML
│   ├── public/                           # Static public assets (favicons, icons)
│   └── src/
│       ├── assets/                       # Global images, SVGs, logos
│       ├── components/                   # Shared UI primitives & layouts
│       │   ├── ui/                       # Button, Modal, Badge, Card, Toast, Table
│       │   └── layout/                   # Navbar, Footer, Sidebar
│       ├── context/                      # Global state providers (Auth, Notifications, Data)
│       ├── hooks/                        # Generic custom hooks (useGeolocation, useDebounce)
│       ├── layouts/                      # Page wrapper layouts (StudentLayout, OwnerLayout)
│       ├── modules/                      # Domain-driven feature slices
│       │   ├── admin/                    # Admin portal (dashboard, approvals, dossiers)
│       │   ├── auth/                     # Authentication (login, register, pending-approval)
│       │   ├── owner/                    # Mess Owner portal (dashboard, menus, enquiries)
│       │   └── student/                  # Student discovery (search, map, menus, reviews)
│       ├── routes/                       # AppRoutes.tsx, ProtectedRoute, role access control
│       ├── services/                     # HTTP client (Axios), API endpoints, mock adapters
│       ├── types/                        # Global TypeScript data models & interfaces
│       ├── utils/                        # Formatters, Haversine distance, validators
│       ├── App.tsx                       # Main application shell & router
│       ├── main.tsx                      # React DOM render entry point
│       └── index.css                     # Design system CSS variables and utilities
│
├── backend/                              # Application Layer (Java 17/21 + Spring Boot 3.x)
│   ├── mvnw / mvnw.cmd                   # Maven wrapper executables
│   ├── pom.xml                           # Maven dependencies & build configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/messmap/
│       │   │   ├── MessMapApplication.java
│       │   │   ├── common/               # Global exception handlers, ApiResponse<T>, BaseEntity
│       │   │   ├── config/               # SecurityConfig, CorsConfig, Swagger/OpenAPI
│       │   │   ├── security/             # JwtFilter, JwtTokenProvider, UserDetails
│       │   │   └── modules/              # Modular domain architecture
│       │   │       ├── admin/            # Admin approval workflows & compliance
│       │   │       ├── mess/             # Mess management & geolocation search
│       │   │       ├── menu/             # Daily & weekly menu items
│       │   │       ├── owner/            # Mess Owner operations & statistics
│       │   │       ├── review/           # Ratings, student feedback, and moderation
│       │   │       └── user/             # User accounts & role management
│       │   └── resources/
│       │       ├── application.yml       # Base configuration
│       │       ├── application-dev.yml   # Local dev profile (MySQL 8)
│       │       ├── application-prod.yml  # Production deployment profile
│       │       └── db/migration/         # Flyway version-controlled migrations
│       └── test/java/com/messmap/
│           ├── unit/                     # JUnit 5 & Mockito service unit tests
│           └── integration/              # SpringBootTest API integration tests
│
├── database/                             # Data Layer & Database Tooling
│   ├── docker-compose-db.yml             # Standalone MySQL 8 service for rapid dev
│   ├── init/                             # Database initialization scripts
│   └── ERD/                              # Entity Relationship diagrams & schema docs
│
├── docs/                                 # Centralized Documentation
│   ├── architecture/                     # System architecture & technical specs
│   ├── specifications/                   # BRD, FRD, and SRS documents
│   └── workflows/                        # Detailed role workflow guides (Markdown)
│
└── testing/                              # System-Level & End-to-End QA
    ├── postman/                          # Postman / Newman API collection & environments
    ├── e2e/                              # Playwright end-to-end browser tests
    └── reports/                          # QA test cases & validation logs
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5, Vite 6, React Router DOM 6, React-Leaflet, Lucide Icons, Vanilla CSS |
| **Backend** | Java 17/21, Spring Boot 3.x, Spring Data JPA, Hibernate, Spring Security, JJWT, Maven |
| **Database** | MySQL 8.x, Flyway Database Migrations |
| **DevOps & CI/CD** | GitHub Actions, Docker, Docker Compose |
| **Documentation** | Markdown, Mermaid Diagrams, OpenAPI 3.0 / Swagger UI |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or v20 LTS recommended) — [Download](https://nodejs.org/)
- **Java Development Kit (JDK 17 or 21)** — [Eclipse Temurin](https://adoptium.net/)
- **Git** — [Download](https://git-scm.com/)
- **Docker Desktop** (Optional, for running MySQL and containerized services) — [Download](https://www.docker.com/)

---

### 2. Frontend Setup & Run
```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Copy the environment template
cp .env.example .env

# 3. Install packages
npm install

# 4. Start the Vite development server
npm run dev
```
Open **`http://localhost:5173`** (or the port shown in your terminal) to view the application.

To build and check types:
```bash
npm run build
```

---

### 3. Backend Setup & Run
```bash
# 1. Navigate to the backend directory
cd backend

# 2. Compile and run using the Maven Wrapper
./mvnw clean spring-boot:run
```
The backend API starts on **`http://localhost:8080`**.
Swagger documentation will be available at: **`http://localhost:8080/swagger-ui.html`**.

To execute tests:
```bash
./mvnw test
```

---

### 4. Database Setup (MySQL & Docker)

To run a standalone MySQL database for local development:
```bash
# Start MySQL 8 with persistent storage
docker compose -f database/docker-compose-db.yml up -d
```
Flyway automatically runs all versioned migrations (`backend/src/main/resources/db/migration/`) upon backend startup.

---

## 🔑 Demo Accounts & Mentor Presentation Walkthrough

Use these pre-configured accounts to showcase all three user roles:

### 1. Student Portal Demo
* **Login URL:** `http://localhost:5173/login?role=student`
* **Credentials:** Click **"Use Student Demo"** or enter:
  * **Email:** `rahul.patil@coep.ac.in`
  * **Password:** `student`
* **Features to Present:**
  * **Campus Discovery Dashboard:** Active meal pass summary, lunch serving window tracker, and top-rated messes.
  * **Interactive Map (`/find-mess`):** Split map and list view with Leaflet pins, dietary filters (Pure Veg, Veg & Non-Veg), and max distance sliders.
  * **Today's Menu & Pricing (`/menu-pricing`):** Detailed thali components and weekly specials.
  * **Digital Pass Token (`/subscriptions`):** Live QR code generation for mess check-in and vacation pause management.

### 2. Mess Owner Portal Demo
* **Login URL:** `http://localhost:5173/login?role=owner`
* **Credentials:** Click **"Use Mess Owner Demo"** or enter:
  * **Email:** `rajesh.sharma@annapurnamess.com`
  * **Password:** `owner`
* **Features to Present:**
  * **Owner Operations Hub (`/owner/dashboard`):** Today's active meal serving counter, open/closed toggle, and verification status alert.
  * **Daily Menu Manager (`/owner/menu`):** Add, edit, and toggle availability for lunch and dinner items.
  * **Student Enquiries (`/owner/enquiries`):** Tiffin subscription enquiries and WhatsApp contact links.

### 3. Admin Compliance & Verification Portal Demo
* **Login URL:** `http://localhost:5173/admin/login`
* **Credentials:** Click **"Use Admin Demo"** or enter:
  * **Email:** `admin@messmap.com`
  * **Password:** `admin`
* **Features to Present:**
  * **Executive Dashboard (`/admin`):** Campus-wide dining metrics, onboarding charts, and real-time activity audit trail.
  * **Verification Queue & Dossier Modal (`/admin#messes`):** Inspect owner contact, FSSAI hygiene scores, seating capacity, and approve or reject submissions with reason logging.
  * **User Moderation (`/admin#users`):** Suspend or reactivate student and partner accounts.
  * **Grievance Redressal (`/admin#reviews`):** Moderate flagged reviews and assign ticket statuses.

---

## 🔄 Git Branching & Pull Request Workflow

We follow standard Trunk-Based Feature Branching:

1. **Integration Base:** All features are branched from and merged back into `dev`.
2. **Branch Naming Conventions:**
   - Features: `feature/<feature-name>` (e.g., `feature/user-auth`)
   - Bug fixes: `fix/<issue-name>` (e.g., `fix/map-marker-offset`)
   - Chores / Infra: `chore/<task-name>` (e.g., `chore/ci-workflow`)
3. **Pull Request Protocol:**
   - Run `npm run build` (frontend) and `./mvnw test` (backend) locally before opening a PR.
   - GitHub Actions CI must pass all type-checks, tests, and builds before merging.
   - At least one code review approval is required prior to squash-merging into `dev`.
