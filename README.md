# MessMap — Campus Mess Discovery & Meal Subscription Platform

MessMap is a location-based web application designed to help college students find, compare, and subscribe to quality mess services near their campus.

---

## 📌 Project Status: Frontend Integration Complete (`integration/ui-demo`)

The three independently developed teammate modules have been unified into a single responsive React + TypeScript application with shared authentication, role-based route guards, and a shared Emerald/Mint design system:

| Role / Module | Developer Branch | Status | Key Features |
| :--- | :--- | :--- | :--- |
| **Public Landing** | `integration/ui-demo` | ✅ Live | Modern Hero, campus quick search, role selection cards, featured messes |
| **Student Portal** | `feature/user` | ✅ Integrated | Mess discovery, interactive Leaflet map, weekly menus, meal token QR code, favorites |
| **Mess Owner Portal** | `feature/mess-owner` | ✅ Integrated | Daily menu editor, enquiries pipeline, customer reviews, pending approval banner |
| **Admin Portal** | `feature/admin` | ✅ Integrated | Executive dashboard, verification queue, full mess dossier modals, user directory, grievances |

---

## 🚀 How to Run this UI on Any PC

Follow these steps on any Windows, macOS, or Linux machine:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended) — [Download Node.js](https://nodejs.org/)
- **Git** — [Download Git](https://git-scm.com/)

### 2. Clone & Switch to the Integration Branch
```bash
# Clone the repository (if not already cloned)
git clone https://github.com/SanvedSahu/MessMap.git
cd MessMap

# Switch to the UI demo integration branch
git checkout integration/ui-demo
git pull origin integration/ui-demo
```

### 3. Install Dependencies & Start Dev Server
```bash
# Navigate to the frontend directory
cd frontend

# Install all project packages
npm install

# Launch the development server
npm run dev
```

### 4. Open in Browser
Open your web browser and go to:
👉 **`http://localhost:3000`** *(or `http://localhost:3001` if port 3000 is occupied)*

---

## 🔑 Demo Accounts & Mentor Presentation Walkthrough

Use these pre-configured accounts to showcase all three user roles:

### 1. Student Portal Demo
* **Login URL:** `http://localhost:3000/login?role=student`
* **Credentials:** Click **"Use Student Demo"** or enter:
  * **Email:** `rahul.patil@coep.ac.in`
  * **Password:** `student`
* **Features to Present:**
  * **Campus Discovery Dashboard:** Active meal pass summary, lunch serving window tracker, and top-rated messes.
  * **Interactive Map (`/find-mess`):** Split map and list view with Leaflet pins, dietary filters (Pure Veg, Veg & Non-Veg), and max distance sliders.
  * **Today's Menu & Pricing (`/menu-pricing`):** Detailed thali components and weekly specials.
  * **Digital Pass Token (`/subscriptions`):** Live QR code generation for mess check-in and vacation pause management.

### 2. Mess Owner Portal Demo
* **Login URL:** `http://localhost:3000/login?role=owner`
* **Credentials:** Click **"Use Mess Owner Demo"** or enter:
  * **Email:** `rajesh.sharma@annapurnamess.com`
  * **Password:** `owner`
* **Features to Present:**
  * **Owner Operations Hub (`/owner/dashboard`):** Today's active meal serving counter, open/closed toggle, and verification status alert.
  * **Daily Menu Manager (`/owner/menu`):** Add, edit, and toggle availability for lunch and dinner items.
  * **Student Enquiries (`/owner/enquiries`):** Tiffin subscription enquiries and WhatsApp contact links.

### 3. Admin Compliance & Verification Portal Demo
* **Login URL:** `http://localhost:3000/admin/login`
* **Credentials:** Click **"Use Admin Demo"** or enter:
  * **Email:** `admin@messmap.com`
  * **Password:** `admin`
* **Features to Present:**
  * **Executive Dashboard (`/admin`):** Campus-wide dining metrics, onboarding charts, and real-time activity audit trail.
  * **Verification Queue & Dossier Modal (`/admin#messes`):** Click the **"Dossier"** button to inspect owner contact, FSSAI hygiene scores, seating capacity, and approve or reject submissions with reason logging.
  * **User Moderation (`/admin#users`):** Suspend or reactivate student and partner accounts.
  * **Grievance Redressal (`/admin#reviews`):** Moderate flagged reviews and assign ticket statuses.

---

## 🛠️ Technology Stack
* **Frontend Framework:** React 19 with TypeScript
* **Build Tool:** Vite
* **Styling:** Unified Vanilla CSS Design System (Emerald & Mint Campus Theme)
* **Icons:** Lucide React
* **Maps:** Leaflet & OpenStreetMap via React-Leaflet
* **State Management:** React Context API (`AuthContext`, `MessDataContext`, `FavoritesContext`, `SubscriptionContext`, `NotificationContext`) with `localStorage` persistence

---

## 🗺️ Next Milestones (Backend & DB Integration)
1. Connect frontend context providers to Java Spring Boot REST APIs (`/api/v1/messes`, `/api/v1/auth`, `/api/v1/subscriptions`).
2. Wire MySQL schema with JPA entities for persistent mess registrations, reviews, and transaction records.
3. Integrate college SSO (Single Sign-On) authentication.

