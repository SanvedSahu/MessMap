import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Compass,
  UtensilsCrossed,
  Heart,
  Star,
  User,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();

  const navLinks = [
    { to: '/', label: 'Campus Home', icon: Home },
    { to: '/student/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/find-mess', label: 'Find Nearby Messes', icon: Compass },
    { to: '/menu-pricing', label: 'Menu & Pricing', icon: UtensilsCrossed },
    {
      to: '/favorites',
      label: 'Saved Favorites',
      icon: Heart,
      badge: (favorites?.length || 0) > 0 ? String(favorites.length) : null,
    },
    { to: '/reviews', label: 'Reviews & Ratings', icon: Star },
    { to: '/profile', label: 'Student Profile', icon: User },
    { to: '/help', label: 'Help & Contact', icon: HelpCircle },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">🌱</div>
          <div>
            <div className="brand-text-title">
              Mess<span>Map</span>
              <span className="brand-tag">Student</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Campus Food & Mess Discovery
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              display: 'none',
              padding: '6px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
            }}
            className="sidebar-mobile-close"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links (flex: 1, scrolls independently) */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu Navigation</div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Student Profile & Anchored Sign Out */}
        <div className="sidebar-bottom">
          {isAuthenticated ? (
            <div>
              <Link to="/profile" onClick={onClose} style={{ display: 'block' }}>
                <div className="user-quick-profile">
                  <div className="user-avatar-sm">{user?.avatar || 'RP'}</div>
                  <div className="user-quick-info">
                    <div className="user-quick-name">{user?.name || 'Rahul Patil'}</div>
                    <div className="user-quick-role">
                      🎓 Student • {user?.dietaryPref || 'Veg'}
                    </div>
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-outline btn-sm student-signout-btn"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '0.5rem',
                  color: 'var(--danger)',
                  borderColor: 'var(--danger-border)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: '#ffffff',
                }}
                aria-label="Sign Out of Student Portal"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
