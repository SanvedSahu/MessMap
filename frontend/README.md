# MessMap — User Module Frontend UI

This is the student/user-facing frontend for **MessMap**, built with React, Vite, React Router, Leaflet OpenStreetMap, and Bootstrap utilities with custom modern design system tokens.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📱 Implemented User Module Pages

| # | Page Name | Route | Key Features |
|---|-----------|-------|--------------|
| 1 | **User Login & Registration** | `/login`, `/register` | Login & signup forms, live validation, show/hide password, and 1-Click Demo Login (`Rahul Patil`). |
| 2 | **User Dashboard** | `/` or `/dashboard` | Welcome banner, live meal tracker, active meal subscription card, top-rated messes, and student statistics. |
| 3 | **Find Nearby Messes** | `/find-mess` | Search bar, dietary filters (Pure Veg / Non-Veg), budget & distance sliders, and interactive **Leaflet + OpenStreetMap** view with custom markers. |
| 4 | **Mess Details** | `/mess/:id` | Photo gallery, verified hygiene badge, today's live menu, weekly highlights, pricing tiers, owner contact (call/WhatsApp), and map pin. |
| 5 | **Menu and Pricing** | `/menu-pricing` | Weekly schedule tabs (Monday–Sunday), breakfast/lunch/dinner breakdowns, plan comparison, and interactive student subscription price calculator. |
| 6 | **Subscription Management** | `/subscriptions` | Active subscription details, validity timeline, digital QR meal token, pause/resume meals modal, renewal action, and past payment receipt table. |
| 7 | **User Profile** | `/profile` | View/edit name, email, phone, hostel/room, dietary preference, meal timing reminder toggles, and password change modal. |
| 8 | **Favorites** | `/favorites` | Bookmarked messes with instant card actions, empty state illustration, and side-by-side comparison matrix. |
| 9 | **Reviews and Ratings** | `/reviews` | Community reviews, breakdown scores (taste, hygiene, value), helpful upvotes, and interactive "Write a Review" form with star rating picker. |
| 10 | **Help and Contact** | `/help` | Searchable categorized FAQ accordion, grievance/support ticket form, emergency helplines, and WhatsApp chat support. |

---

## 📁 Architecture & File Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Badge.jsx            # FoodBadge & StatusBadge indicators
│   │   ├── Footer.jsx           # Campus footer & emergency helplines
│   │   ├── MessCard.jsx         # Card with photos, tags, menus & actions
│   │   ├── Navbar.jsx           # Top header with location & live meal indicator
│   │   ├── PlanModal.jsx        # Subscription checkout modal
│   │   ├── QRModal.jsx          # Digital Student QR pass modal
│   │   ├── Sidebar.jsx          # Desktop & mobile drawer navigation
│   │   └── StarRating.jsx       # Interactive and display star rating
│   └── map/
│       └── MessMapView.jsx      # Leaflet + OpenStreetMap interactive component
├── context/
│   ├── AuthContext.jsx          # User authentication & demo student profile
│   ├── FavoritesContext.jsx     # Saved favorites state with localStorage
│   ├── NotificationContext.jsx  # Floating toast notifications
│   └── SubscriptionContext.jsx  # Active pass, pause/resume, and invoice state
├── data/
│   ├── mockFaqs.js              # Categorized student FAQs
│   ├── mockMesses.js            # Realistic messes, menus, photos, coordinates
│   ├── mockReviews.js           # Student reviews & ratings
│   └── mockSubscriptions.js      # Active meal pass & billing invoices
├── pages/
│   ├── AuthPage.jsx
│   ├── DashboardPage.jsx
│   ├── FavoritesPage.jsx
│   ├── FindMessPage.jsx
│   ├── HelpContactPage.jsx
│   ├── MenuPricingPage.jsx
│   ├── MessDetailsPage.jsx
│   ├── ProfilePage.jsx
│   ├── ReviewsPage.jsx
│   └── SubscriptionsPage.jsx
├── App.jsx                      # Router & layout orchestration
├── index.css                    # Custom CSS design system & tokens
└── main.jsx
```

---

## 🔌 Ready for Backend Integration

- All state operations (`AuthContext`, `SubscriptionContext`, `FavoritesContext`) mirror REST API contracts.
- To connect with Spring Boot REST endpoints, swap mock state calls with `fetch`/`axios` calls to `/api/v1/user/...`.
- No Admin or Mess Owner files were modified.
