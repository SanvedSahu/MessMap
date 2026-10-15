import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CreditCard,
  Heart,
  User
} from 'lucide-react';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { MessDataProvider } from './context/MessDataContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

// Route Guard
import { ProtectedRoute } from './routes/ProtectedRoute';

// Landing & Auth Pages
import { LandingPage } from './modules/landing';
import { LoginPage, AdminLoginPage, RegisterPage } from './modules/auth';

// Admin Module
import { AdminPortalApp } from './modules/admin';

// Mess Owner Module
import {
  OwnerLayout,
  DashboardPage as OwnerDashboardPage,
  MenuPage as OwnerMenuPage,
  ProfilePage as OwnerProfilePage,
  EnquiriesPage as OwnerEnquiriesPage,
  ReviewsPage as OwnerReviewsPage,
  SettingsPage as OwnerSettingsPage,
  PendingApprovalPage,
} from './modules/owner';

// Student / User Module Components & Pages
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import {
  StudentDashboardPage,
  FindMessPage,
  MessDetailsPage,
  MenuPricingPage,
  SubscriptionsPage,
  StudentProfilePage,
  FavoritesPage,
  StudentReviewsPage,
  HelpContactPage,
} from './modules/student';

// Student Portal Layout Shell
const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { favorites } = useFavorites();

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="main-content">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="page-wrapper">{children}</main>
        <Footer />
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/student/dashboard"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/find-mess"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <Compass size={20} />
          <span>Find Mess</span>
        </NavLink>
        <NavLink
          to="/subscriptions"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <CreditCard size={20} />
          <span>Pass</span>
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <div style={{ position: 'relative' }}>
            <Heart size={20} />
            {favorites?.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                }}
              />
            )}
          </div>
          <span>Favorites</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <MessDataProvider>
            <FavoritesProvider>
              <SubscriptionProvider>
                <Routes>
                  {/* ============================================================ */}
                  {/* 1. PUBLIC COMMON LANDING PAGE                                 */}
                  {/* ============================================================ */}
                  <Route path="/" element={<LandingPage />} />

                  {/* ============================================================ */}
                  {/* 2. AUTHENTICATION & VERIFICATION ROUTES                      */}
                  {/* ============================================================ */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/owner/pending-approval" element={<PendingApprovalPage />} />

                  {/* ============================================================ */}
                  {/* 3. PUBLIC DISCOVERY (Accessible without forced login)        */}
                  {/* ============================================================ */}
                  <Route
                    path="/find-mess"
                    element={
                      <StudentLayout>
                        <FindMessPage />
                      </StudentLayout>
                    }
                  />
                  <Route
                    path="/mess/:id"
                    element={
                      <StudentLayout>
                        <MessDetailsPage />
                      </StudentLayout>
                    }
                  />
                  <Route
                    path="/menu-pricing"
                    element={
                      <StudentLayout>
                        <MenuPricingPage />
                      </StudentLayout>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <StudentLayout>
                        <HelpContactPage />
                      </StudentLayout>
                    }
                  />

                  {/* ============================================================ */}
                  {/* 4. STUDENT / USER PORTAL (Protected Routes)                  */}
                  {/* ============================================================ */}
                  <Route
                    path="/student"
                    element={<Navigate to="/student/dashboard" replace />}
                  />
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <StudentLayout>
                          <StudentDashboardPage />
                        </StudentLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/student/dashboard" replace />}
                  />
                  <Route
                    path="/subscriptions"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <StudentLayout>
                          <SubscriptionsPage />
                        </StudentLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <StudentLayout>
                          <FavoritesPage />
                        </StudentLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reviews"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <StudentLayout>
                          <StudentReviewsPage />
                        </StudentLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <StudentLayout>
                          <StudentProfilePage />
                        </StudentLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================================ */}
                  {/* 5. MESS OWNER PORTAL (Protected Routes)                      */}
                  {/* ============================================================ */}
                  <Route
                    path="/owner"
                    element={
                      <ProtectedRoute allowedRole="owner">
                        <OwnerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<OwnerDashboardPage />} />
                    <Route path="menu" element={<OwnerMenuPage />} />
                    <Route path="profile" element={<OwnerProfilePage />} />
                    <Route path="enquiries" element={<OwnerEnquiriesPage />} />
                    <Route path="reviews" element={<OwnerReviewsPage />} />
                    <Route path="settings" element={<OwnerSettingsPage />} />
                  </Route>

                  {/* ============================================================ */}
                  {/* 6. ADMIN PORTAL (Strictly Protected Routes)                  */}
                  {/* ============================================================ */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRole="admin">
                        <AdminPortalApp />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute allowedRole="admin">
                        <AdminPortalApp />
                      </ProtectedRoute>
                    }
                  />

                  {/* ============================================================ */}
                  {/* 7. FALLBACK ROUTE                                            */}
                  {/* ============================================================ */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SubscriptionProvider>
            </FavoritesProvider>
          </MessDataProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;
