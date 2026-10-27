import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Power
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getNameInitials } from '../../../utils/userInitials';
import type { OwnerMessProfileResponse } from '../../../api/ownerApi';
import './Header.css';

interface HeaderProps {
  onToggleMobile: () => void;
  isOpenStatus: boolean;
  onToggleOpenStatus: () => void;
  messStatus?: string;
  mess?: OwnerMessProfileResponse | null;
  allMesses?: OwnerMessProfileResponse[];
  onSelectMess?: (messId: number | string) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'success' | 'alert' | 'info';
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Student Enquiry',
    description: 'Rahul Verma enquired about Monthly Mess Plan (Lunch + Dinner).',
    time: '10m ago',
    unread: true,
    type: 'info',
  },
  {
    id: '2',
    title: 'New 5-Star Review Received',
    description: 'Sneha Patil rated your "Special Dal Tadka & Paneer" 5 stars.',
    time: '1h ago',
    unread: true,
    type: 'success',
  },
  {
    id: '3',
    title: 'Profile Verified by Admin',
    description: 'Your mess registration documents have been approved by Admin.',
    time: 'Yesterday',
    unread: false,
    type: 'success',
  },
];

const getRouteDetails = (pathname: string): { title: string; subtitle: string } => {
  switch (pathname) {
    case '/owner':
    case '/owner/dashboard':
      return { title: 'Dashboard', subtitle: 'Overview of your mess activities, diners, and daily performance' };
    case '/owner/menu':
      return { title: 'Manage Menu', subtitle: 'Update daily breakfast, lunch, snacks, and dinner offerings' };
    case '/owner/profile':
      return { title: 'Mess Profile', subtitle: 'Review and edit mess details, facilities, and contact information' };
    case '/owner/enquiries':
      return { title: 'Customer Enquiries', subtitle: 'Respond to student requests and monthly mess inquiries' };
    case '/owner/reviews':
      return { title: 'Student Reviews', subtitle: 'Ratings and feedback from verified students' };
    case '/owner/settings':
      return { title: 'Settings', subtitle: 'Account preferences, business hours, and operational defaults' };
    default:
      return { title: 'Mess Owner Portal', subtitle: 'Manage your mess on MessMap' };
  }
};

export const Header: React.FC<HeaderProps> = ({
  onToggleMobile,
  isOpenStatus,
  onToggleOpenStatus,
  messStatus,
  mess,
  allMesses,
  onSelectMess,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { title, subtitle } = getRouteDetails(location.pathname);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <header className="owner-header">
      {/* Left: Mobile hamburger & Dynamic Page Title */}
      <div className="header-left">
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobile}
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-group">
          <h1 className="header-page-title">{title}</h1>
          <p className="header-page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Right: Actions, Live Status, Notifications, Owner Profile */}
      <div className="header-right">
        {/* Operating Status Toggle */}
        <div className="status-toggle-wrapper">
          {messStatus === 'REMOVED' ? (
            <div
              className="status-pill-btn is-closed"
              style={{
                cursor: 'not-allowed',
                backgroundColor: '#fee2e2',
                borderColor: '#fca5a5',
                color: '#991b1b',
              }}
              title="This mess has been removed by an administrator and cannot be reactivated."
            >
              <Power size={14} className="status-icon" color="#dc2626" />
              <span className="status-label">Status: Removed by Admin</span>
            </div>
          ) : messStatus === 'SUSPENDED' ? (
            <div
              className="status-pill-btn is-closed"
              style={{
                cursor: 'not-allowed',
                backgroundColor: '#fef3c7',
                borderColor: '#fcd34d',
                color: '#92400e',
              }}
              title="This mess is suspended by an administrator. Please submit a suspension review request."
            >
              <Power size={14} className="status-icon" color="#d97706" />
              <span className="status-label">Status: Suspended by Admin</span>
            </div>
          ) : (
            <button
              type="button"
              className={`status-pill-btn ${isOpenStatus ? 'is-open' : 'is-closed'}`}
              onClick={onToggleOpenStatus}
              title={isOpenStatus ? 'Click to mark Closed for today' : 'Click to mark Open for today'}
            >
              <Power size={14} className="status-icon" />
              <span className="status-label">
                {isOpenStatus ? 'Operating: Open' : 'Operating: Closed'}
              </span>
            </button>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="dropdown-container" ref={notificationRef}>
          <button
            type="button"
            className={`icon-action-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-label="View notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown-menu">
              <div className="notification-menu-header">
                <div>
                  <h4 className="dropdown-title">Notifications</h4>
                  <span className="dropdown-subtitle">{unreadCount} unread updates</span>
                </div>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`notification-item ${item.unread ? 'unread' : ''}`}>
                    <div className={`notification-icon-badge ${item.type}`}>
                      {item.type === 'success' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <span className="item-title">{item.title}</span>
                        <span className="item-time">
                          <Clock size={11} /> {item.time}
                        </span>
                      </div>
                      <p className="item-desc">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notification-footer">
                <button
                  className="view-all-link"
                  onClick={() => {
                    navigate('/owner/enquiries');
                    setShowNotifications(false);
                  }}
                >
                  View All Enquiries & Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="header-divider" />

        {/* Owner Profile Dropdown */}
        <div className="dropdown-container" ref={profileRef}>
          <button
            type="button"
            className="owner-profile-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            aria-label="Open profile options"
          >
            <div className="avatar-wrapper" title={user.name || 'Mess Owner'}>
              <span className="owner-avatar-initials">{getNameInitials(user.name, 'MO')}</span>
              <span className="avatar-online-dot" />
            </div>

            <div className="owner-info-text">
              <span className="owner-name">{user.name || 'Mess Owner'}</span>
              <span className="owner-role">{mess?.name || user.messName || 'My Mess'}</span>
            </div>

            <ChevronDown size={16} className={`chevron-icon ${showProfileMenu ? 'open' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div className="profile-menu-header">
                <p className="logged-in-as">Signed in as Mess Owner</p>
                <p className="owner-email">{user.email || 'partner@messmap.com'}</p>
                <span className="badge badge-green" style={{ marginTop: '6px' }}>
                  <CheckCircle2 size={12} /> Partner Portal
                </span>
              </div>

              {allMesses && allMesses.length > 1 && (
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-app)' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Active Mess Facility:
                  </label>
                  <select
                    className="form-select"
                    value={mess?.id || user.messId || ''}
                    onChange={(e) => onSelectMess && onSelectMess(e.target.value)}
                    style={{ fontSize: '0.82rem', width: '100%', padding: '6px 8px', fontWeight: 700 }}
                  >
                    {allMesses.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="profile-menu-links">
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/owner/profile');
                    setShowProfileMenu(false);
                  }}
                >
                  <User size={16} />
                  <span>Mess Profile</span>
                </button>
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/owner/settings');
                    setShowProfileMenu(false);
                  }}
                >
                  <SettingsIcon size={16} />
                  <span>Settings & Preferences</span>
                </button>
              </div>

              <div className="profile-menu-footer">
                <button
                  className="profile-menu-item danger"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
