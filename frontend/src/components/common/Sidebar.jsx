import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CreditCard,
  UtensilsCrossed,
  Heart,
  Star,
  User,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useSubscription } from '../../context/SubscriptionContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();
  const { subscription } = useSubscription();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/find-mess', label: 'Find Nearby Messes', icon: Compass },
    {
      to: '/subscriptions',
      label: 'My Subscriptions',
      icon: CreditCard,
      badge: subscription?.status === 'Active' ? 'Active' : null
    },
    { to: '/menu-pricing', label: 'Menu & Pricing', icon: UtensilsCrossed },
    {
      to: '/favorites',
      label: 'Saved Favorites',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : null
    },
    { to: '/reviews', label: 'Reviews & Ratings', icon: Star },
    { to: '/profile', label: 'Student Profile', icon: User },
    { to: '/help', label: 'Help & Contact', icon: HelpCircle }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              🌱
            </div>
            <div>
              <div className="brand-text-title">
                Mess<span>Map</span>
                <span className="brand-tag">Student</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Mess Discovery & Subscriptions
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                display: 'none',
                padding: '6px',
                borderRadius: '8px',
                color: 'var(--text-muted)'
              }}
              className="sidebar-mobile-close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
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
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge-pill">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Student Profile */}
        <div className="sidebar-bottom">
          {isAuthenticated ? (
            <div>
              <Link to="/profile" onClick={onClose} style={{ display: 'block' }}>
                <div className="user-quick-profile">
                  <div className="user-avatar-sm">
                    {user?.avatar || 'RP'}
                  </div>
                  <div className="user-quick-info">
                    <div className="user-quick-name">{user?.name || 'Rahul Patil'}</div>
                    <div className="user-quick-role">
                      🎓 Student • {user?.dietaryPref || 'Veg'}
                    </div>
                  </div>
                </div>
              </Link>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                  Signed In
                </span>
                <button
                  onClick={logout}
                  style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
