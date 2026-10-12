import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OwnerLayout } from './layouts/OwnerLayout';
import { DashboardPage } from './pages/owner/DashboardPage';
import { MenuPage } from './pages/owner/MenuPage';
import { ProfilePage } from './pages/owner/ProfilePage';
import { EnquiriesPage } from './pages/owner/EnquiriesPage';
import { ReviewsPage } from './pages/owner/ReviewsPage';
import { SettingsPage } from './pages/owner/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to owner dashboard */}
        <Route path="/" element={<Navigate to="/owner/dashboard" replace />} />

        {/* Mess Owner Portal Section */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
