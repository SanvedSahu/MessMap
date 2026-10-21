import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  MessageSquareDot,
  Star,
  Settings,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Manage Menu', path: '/owner/menu', icon: UtensilsCrossed },
  { name: 'Mess Profile', path: '/owner/profile', icon: Store },
  { name: 'Customer Enquiries', path: '/owner/enquiries', icon: MessageSquareDot },
  { name: 'Reviews', path: '/owner/reviews', icon: Star },
  { name: 'Settings', path: '/owner/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`owner-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <NavLink to="/owner/dashboard" className="brand-container" onClick={handleLinkClick}>
            <div className="brand-logo-badge">
              <MapPin className="brand-pin-icon" size={20} />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <span className="brand-title">MessMap</span>
                <span className="brand-badge">Owner Hub</span>
              </div>
            )}
          </NavLink>

          {/* Mobile Close Button */}
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" aria-label="Mess Owner Navigation">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/owner/dashboard' && location.pathname === '/owner');

              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <span className="nav-icon-wrapper">
                      <Icon size={20} />
                    </span>
                    {!isCollapsed && <span className="nav-label">{item.name}</span>}
                    {!isCollapsed && item.badge && (
                      <span className={`nav-badge ${item.name === 'Reviews' ? 'rating' : ''}`}>
                        {item.name === 'Reviews' ? `★ ${item.badge}` : item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer with Mess Status Card */}
        <div className="sidebar-footer">
          {!isCollapsed ? (
            <div className="mess-status-card">
              <div className="mess-status-top">
                <div className="mess-status-indicator">
                  <span className="pulsing-dot"></span>
                  <span className="status-text">Open Today</span>
                </div>
                <span className="verified-pill">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              <h4 className="mess-title">Annapurna Deluxe Mess</h4>
              <p className="mess-address">Katraj Kondhwa Rd, Pune</p>
              <div className="mess-quick-phone">
                <PhoneCall size={12} /> +91 98231 44550
              </div>
            </div>
          ) : (
            <div className="collapsed-indicator" title="Annapurna Mess - Open">
              <span className="pulsing-dot"></span>
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar width"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};
