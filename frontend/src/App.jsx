import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CreditCard,
  Heart,
  User
} from 'lucide-react';

// Context Providers
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

// Components
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindMessPage } from './pages/FindMessPage';
import { MessDetailsPage } from './pages/MessDetailsPage';
import { MenuPricingPage } from './pages/MenuPricingPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { HelpContactPage } from './pages/HelpContactPage';

// Main Layout Wrapper
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { favorites } = useFavorites();

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthRoute) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main-content">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="page-wrapper">
          {children}
        </main>

        <Footer />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/find-mess" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <Compass size={20} />
          <span>Find Mess</span>
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>My Pass</span>
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <Heart size={20} />
            {favorites.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)'
                }}
              />
            )}
          </div>
          <span>Favorites</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <FavoritesProvider>
            <SubscriptionProvider>
              <AppLayout>
                <Routes>
                  {/* 1. Auth Page */}
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />

                  {/* 2. User Dashboard */}
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />

                  {/* 3. Find Nearby Messes */}
                  <Route path="/find-mess" element={<FindMessPage />} />
                  <Route path="/explore" element={<Navigate to="/find-mess" replace />} />

                  {/* 4. Mess Details */}
                  <Route path="/mess/:id" element={<MessDetailsPage />} />

                  {/* 5. Menu & Pricing */}
                  <Route path="/menu-pricing" element={<MenuPricingPage />} />

                  {/* 6. Subscription Management */}
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />

                  {/* 7. User Profile */}
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* 8. Favorites */}
                  <Route path="/favorites" element={<FavoritesPage />} />

                  {/* 9. Reviews & Ratings */}
                  <Route path="/reviews" element={<ReviewsPage />} />

                  {/* 10. Help and Contact */}
                  <Route path="/help" element={<HelpContactPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </SubscriptionProvider>
          </FavoritesProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
