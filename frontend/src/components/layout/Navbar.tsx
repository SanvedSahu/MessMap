import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, MapPin, Heart, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useSubscription } from '../../context/SubscriptionContext';

export interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  const { favorites } = useFavorites();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      {/* Left: Mobile Toggle & Location Pill */}
      <div className="header-left">
        <button
          onClick={onToggleSidebar}
          className="header-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-location-pill" title="Current student campus search zone">
          <MapPin size={16} className="loc-icon" />
          <span>Pune Campus (FC Road & Shivajinagar)</span>
        </div>
      </div>

      {/* Right: Meal Window, Favorites, Subscription Pill & Profile */}
      <div className="header-right">
        {/* Live meal window tracker */}
        <div className="header-meal-live-badge" title="Live meal serving status">
          <span className="pulse-dot" />
          <span>Lunch Serving (12:15 – 3:00 PM)</span>
        </div>

        {/* Favorites quick link */}
        <Link
          to="/favorites"
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
          title="Saved Messes"
        >
          <Heart
            size={18}
            color={(favorites?.length || 0) > 0 ? 'var(--danger)' : 'var(--text-muted)'}
            fill={(favorites?.length || 0) > 0 ? 'var(--danger)' : 'none'}
          />
          {(favorites?.length || 0) > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--primary)',
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {favorites.length}
            </span>
          )}
        </Link>

        {/* Active subscription pass button */}
        {subscription?.status === 'Active' && (
          <Link
            to="/subscriptions"
            className="btn btn-outline-primary btn-sm"
            style={{ fontWeight: 700 }}
            title="View digital meal pass"
          >
            <CreditCard size={15} />
            <span style={{ display: 'none' }} className="d-sm-inline">
              Pass Active
            </span>
          </Link>
        )}

        {/* User Profile / Login Link */}
        {isAuthenticated ? (
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {user?.avatar || 'RP'}
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                paddingRight: '6px',
              }}
            >
              {user?.name?.split(' ')[0] || 'Student'}
            </span>
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
