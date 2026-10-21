# MessMap — Mentor Presentation Notes & Live Demonstration Script

**Associated GitHub Issue**: [#20 — [Integration] 4-Day Working Model Demo Preparation, Seed Data Setup & Limitation Documentation](https://github.com/SanvedSahu/MessMap/issues/20)  
**Sprint**: 4-Day Working Model Integration & Hardening  
**Target Date**: October 21, 2026  
**Audience**: Project Evaluator / Industry Mentor  

---

## 1. Executive Presentation Overview

MessMap is a full-stack campus dining and mess discovery platform built with **Spring Boot 3 (Java 17)**, **React 18 (TypeScript + Vite)**, and **MySQL 8.0**.

The sprint goal was to build a working, reliable model solving the real-world student dilemma: finding hygienic, affordable, and nearby mess food around college campuses while giving mess owners operational tools and administrators governance oversight.

---

## 2. Verified Working Features Matrix

| Domain | Feature | Backend API Endpoints | Frontend UI Screen | Verified Status |
|---|---|---|---|:---:|
| **Security & Auth** | JWT Authentication & Session Expiry | `POST /api/v1/auth/login`, `POST /api/v1/auth/me` | `/login`, `/admin/login` | **100% VERIFIED** |
| **Security & Auth** | Role-Based Access Control (RBAC) | Standardized HTTP 401 & 403 error handlers | `ProtectedRoute.tsx` | **100% VERIFIED** |
| **Student Module** | Multi-Criteria Mess Search & Discovery | `GET /api/v1/messes` (search, foodType, city, price) | `/find-mess` | **100% VERIFIED** |
| **Student Module** | Detailed Mess Profile & Timetable | `GET /api/v1/messes/{id}` | `/mess/:id` | **100% VERIFIED** |
| **Student Module** | Bookmark / Favorite Messes | `POST/GET/DELETE /api/v1/student/favorites` | `/favorites` | **100% VERIFIED** |
| **Student Module** | Ratings & Reviews Submission | `POST/GET /api/v1/messes/{id}/reviews` | `/reviews`, `/mess/:id` | **100% VERIFIED** |
| **Owner Module** | Profile & Timings Configuration | `POST /api/v1/owner/mess`, `PUT .../operating-timings` | `/owner/profile` | **100% VERIFIED** |
| **Owner Module** | Weekly Timetable & Dish Management | `GET/POST/PUT/DELETE /api/v1/owner/mess/menu/items` | `/owner/menu` | **100% VERIFIED** |
| **Owner Module** | Verification Submission & Status Tracking | `POST/GET /api/v1/owner/mess/submit-verification` | `/owner/dashboard` | **100% VERIFIED** |
| **Admin Module** | Platform Governance & Metrics Dashboard | `GET /api/v1/admin/metrics`, `/api/v1/admin/stats` | `/admin` | **100% VERIFIED** |
| **Admin Module** | Mess Verification, Approval & Suspension | `POST /api/v1/admin/messes/{id}/[approve\|suspend]` | `/admin` (Messes tab) | **100% VERIFIED** |
| **Admin Module** | User Directory & Role Management | `GET/PUT /api/v1/admin/users` | `/admin` (Users tab) | **100% VERIFIED** |

---

## 3. Recommended Live Demonstration Script (Step-by-Step Flow)

### Act I: The Student Experience (Discovery & Trust)
1. **Open Landing Page (`http://localhost:3000`)**:
   - Highlight campus student focus and modern, responsive design. *(Note: Port 3000 is defined in `frontend/vite.config.ts`; if already in use, Vite falls back to 3001 or 5173).*
2. **Explore Messes (`/find-mess`)**:
   - Filter by **Food Type: Pure Veg** &rarr; Shows **Annapurna Pure Veg Mess** (Shivajinagar).
   - Filter by **Food Type: Non-Veg** &rarr; Shows **Maratha Darbar Special Mess** (COEP).
   - Filter by **Food Type: Jain Friendly** &rarr; Shows **Padmavati Jain & Gujarati Mess** (Katraj).
3. **Inspect Mess Details (`/mess/1`)**:
   - Point out verified badge, operating meal hours (Breakfast, Lunch, Dinner), facilities (RO Water, WiFi), and weekly dish timetable.
4. **Student Authentication & Favorites (`/login?role=student`)**:
   - Login with `rahul.patil@coep.ac.in` / `student`.
   - Add Annapurna Mess to Favorites &rarr; View on `/favorites`.

---

### Act II: The Mess Owner Operations (Onboarding & Daily Management)
1. **Owner Login (`/login?role=owner`)**:
   - Login with `rajesh.sharma@annapurnamess.com` / `owner`.
2. **Dashboard Overview (`/owner/dashboard`)**:
   - Point out live "Verified" status badge, quick stats, operating timings.
3. **Weekly Menu Management (`/owner/menu`)**:
   - Demonstrate adding a special daily item (e.g. *"Gulab Jamun Thali"* for Wednesday Lunch).
   - Show meal pricing update (Monthly pass price: ₹3,400).
4. **The "Pending Approval" Workflow (Crucial Demonstration Step)**:
   - Log out, then log in as the newly registered owner: `vikram.deshmukh@kothrudkatta.com` / `owner`.
   - Point out the yellow banner: **"Mess Registration Status: Pending Admin Verification"**.
   - Show that **Kothrud Katta Student Mess** is NOT visible in public Student Search.

---

### Act III: Administrative Governance & Real-Time Synchronization
1. **Admin Login (`/admin/login`)**:
   - Login with `admin@messmap.com` / `admin`.
2. **Review Metrics (`/admin`)**:
   - Highlight live metrics: Total Users, Active Messes, Pending Verifications.
3. **Approve Pending Mess (`/admin` &rarr; Messes &rarr; Pending)**:
   - Locate **Kothrud Katta Student Mess** in the verification queue.
   - Click **Approve**. Show confirmation toast!
4. **Instant Synchronization Proof**:
   - Switch to Student tab (`/find-mess`), refresh or search for "Kothrud".
   - **Kothrud Katta Student Mess is now live and discoverable!**
5. **Demonstrate Administrative Suspension**:
   - Back in Admin portal, click **Suspend** on the mess.
   - Switch back to Student search &rarr; The mess instantly disappears from public discovery!
   - Click **Unsuspend** &rarr; Restores immediately.

---

## 4. Known Limitations of the 4-Day Sprint Model

To maintain honesty and technical integrity with the evaluator, transparently present these sprint scope boundaries:

1. **Payment Gateway Integration**:
   - Real online card/UPI payments (Razorpay/Stripe) are not hooked up in this 4-day working model. Monthly prices and daily thali costs are displayed as informational operational pricing.
2. **Dynamic Geolocation vs Fixed Mock Coordinates**:
   - Mess coordinates currently represent realistic, accurate Pune geographic coordinates (Fergusson College, COEP, Katraj, Viman Nagar). Real GPS device triangulation is supported via HTML5 Geolocation API, but campus radius filtering defaults to Pune central.
3. **Document Attachment Storage**:
   - FSSAI food license certificates and shop act registrations are currently verified via status transitions and admin notes; direct cloud S3 object storage upload is mocked via URL references.
4. **Single Primary Mess per Owner Account**:
   - The current working model associates an owner user with their primary campus mess listing. Multi-branch chain mess management is architected for Phase 2.

---

## 5. Future Development Roadmap

Present these clearly as scheduled future enhancements:
1. **Digital Meal QR Pass**:
   - QR code generation for daily student check-in, automatically deducting from the student's prepaid monthly balance upon scanning by the owner.
2. **Online UPI & Card Subscription Payments**:
   - Integration with Razorpay / PhonePe APIs for one-click monthly student subscriptions.
3. **AI Meal Recommendation Engine**:
   - Suggesting nearby daily lunch/dinner specials based on dietary preferences, budget, and walking distance.
4. **Push Notifications & Menu Alerts**:
   - Real-time mobile alerts when your favorite mess updates their Sunday special menu.

---

## 6. Live Presentation Fallback Plan

In case of network or environmental issues during the live demonstration:
1. **If local MySQL service is interrupted**:
   - The Spring Boot backend can be booted in `--spring.profiles.active=test` (in-memory H2 MySQL compatibility mode with Flyway schema and mock data).
2. **If backend process fails to start**:
   - The frontend includes built-in offline demo accounts with client-side fallback adapters (`DEMO_CREDENTIALS` in `AuthContext.tsx`).
3. **Evidence Artifacts**:
   - All 301 backend automated tests are documented in [`docs/runbook/E2E_CORE_FLOW_VERIFICATION_REPORT.md`](file:///Users/sanvedsahu/Projects/MessMap/docs/runbook/E2E_CORE_FLOW_VERIFICATION_REPORT.md).
   - CI build history is permanently preserved on GitHub Actions (`Backend CI` & `Frontend CI`).
