import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Shield,
  UserCheck,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { AdminProfile } from '../types/admin.types';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onOpenMobileSidebar: () => void;
  adminProfile: AdminProfile;
  pendingApprovalsCount: number;
  openComplaintsCount: number;
  onSelectTab: (tab: AdminTab) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  adminProfile,
  pendingApprovalsCount,
  openComplaintsCount,
  onSelectTab,
  searchTerm,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Executive Dashboard',
          subtitle: 'Real-time overview of college mess listings, students, and grievances',
        };
      case 'messes':
        return {
          title: 'Mess Verification & Directory',
          subtitle: 'Review submissions, verify health & hygiene records, manage listings',
        };
      case 'users':
        return {
          title: 'User Management',
          subtitle: 'Manage student accounts, mess owners, and administrative access privileges',
        };
      case 'reviews':
        return {
          title: 'Reviews & Grievance Redressal',
          subtitle: 'Moderate student reviews, investigate complaints, resolve quality tickets',
        };
      case 'reports':
        return {
          title: 'Platform Analytics & Reports',
          subtitle: 'Campus dining trends, price indexing, and compliance reports',
        };
      case 'settings':
        return {
          title: 'Admin Settings & Security',
          subtitle: 'System preferences, automated compliance rules, and account safety',
        };
    }
  };

  const pageInfo = getPageInfo();
  const totalNotifications = pendingApprovalsCount + openComplaintsCount;

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileSidebar}
          className="btn btn-ghost"
          style={{ padding: '0.4rem', display: 'flex', alignItems: 'center' }}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              {pageInfo.title}
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.5rem',
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              Portal
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'none' }}>
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Search */}
        <div style={{ position: 'relative', width: '240px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.825rem' }}
            placeholder={`Filter ${currentTab}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Notification Bell Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-outline"
            style={{ padding: '0.55rem', position: 'relative', borderRadius: 'var(--radius-md)' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {totalNotifications > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px #ffffff',
                }}
              >
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Action Alerts</div>
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                  {totalNotifications} pending
                </span>
              </div>

              <div style={{ padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {pendingApprovalsCount > 0 && (
                  <div
                    onClick={() => {
                      onSelectTab('messes');
                      setShowNotifications(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      background: 'var(--primary-light)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <AlertTriangle size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#065f46' }}>
                        {pendingApprovalsCount} Messes Awaiting Approval
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                        New submissions need safety and hygiene compliance review.
                      </div>
                    </div>
                  </div>
                )}

                {openComplaintsCount > 0 && (
                  <div
                    onClick={() => {
                      onSelectTab('reviews');
                      setShowNotifications(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      background: '#fef2f2',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#991b1b' }}>
                        {openComplaintsCount} Unresolved Student Grievances
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                        Deposit disputes and hygiene reports need immediate resolution.
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    gap: '0.75rem',
                    background: '#f8fafc',
                  }}
                >
                  <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Location Mapping Sync OK
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      All active messes geocoded on university boundaries.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 1rem',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'center',
                  background: '#f8fafc',
                }}
              >
                <button
                  onClick={() => {
                    onSelectTab('reports');
                    setShowNotifications(false);
                  }}
                  style={{ fontSize: '0.785rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  View System Audit Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
            }}
            aria-label="Admin profile menu"
          >
            <img
              src={adminProfile.avatar}
              alt={adminProfile.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--primary)',
              }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {adminProfile.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                {adminProfile.role}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '240px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'slideUp 0.15s ease-out',
                padding: '0.5rem',
              }}
            >
              <div style={{ padding: '0.65rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{adminProfile.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{adminProfile.email}</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Shield size={12} /> Campus Super Administrator
                </div>
              </div>

              <div style={{ padding: '0.35rem 0' }}>
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.825rem' }}
                >
                  <UserCheck size={16} /> Admin Profile & Security
                </button>
                <button
                  onClick={() => {
                    onSelectTab('reports');
                    setShowProfileMenu(false);
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.825rem' }}
                >
                  <Sparkles size={16} /> Campus Insights
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
