import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Users,
  MessageSquareWarning,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export type AdminTab = 'dashboard' | 'messes' | 'users' | 'reviews' | 'reports' | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingMessesCount: number;
  openComplaintsCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  pendingMessesCount,
  openComplaintsCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      badge: undefined,
    },
    {
      id: 'messes' as AdminTab,
      label: 'Mess Directory',
      icon: <Utensils size={20} />,
      badge: pendingMessesCount > 0 ? pendingMessesCount : undefined,
      badgeColor: 'warning',
    },
    {
      id: 'users' as AdminTab,
      label: 'User Directory',
      icon: <Users size={20} />,
      badge: undefined,
    },
    {
      id: 'reviews' as AdminTab,
      label: 'Reviews & Grievances',
      icon: <MessageSquareWarning size={20} />,
      badge: openComplaintsCount > 0 ? openComplaintsCount : undefined,
      badgeColor: 'danger',
    },
    {
      id: 'reports' as AdminTab,
      label: 'Analytics & Reports',
      icon: <BarChart3 size={20} />,
      badge: undefined,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Profile & Settings',
      icon: <Settings size={20} />,
      badge: undefined,
    },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    if (mobileOpen) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 35,
          }}
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{
          position: mobileOpen ? 'fixed' : undefined,
          left: mobileOpen ? 0 : undefined,
          top: 0,
          zIndex: mobileOpen ? 45 : 30,
          boxShadow: mobileOpen ? 'var(--shadow-xl)' : undefined,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            height: 'var(--header-height)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px var(--primary-glow)',
                flexShrink: 0,
              }}
            >
              <MapPin size={22} />
            </div>

            {!collapsed && (
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    Mess<span style={{ color: 'var(--primary)' }}>Map</span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Admin
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Campus Food Network
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
              title="Collapse Sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <button
              onClick={onToggleCollapse}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
              title="Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              padding: collapsed ? '0 0.5rem 0.4rem' : '0 0.75rem 0.4rem',
              textAlign: collapsed ? 'center' : 'left',
              letterSpacing: '0.05em',
            }}
          >
            {collapsed ? '•••' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.885rem',
                  transition: 'var(--transition)',
                  position: 'relative',
                }}
                title={collapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: isActive ? 'var(--primary)' : 'inherit', display: 'flex' }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`badge badge-${item.badgeColor || 'neutral'}`}
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', minWidth: '18px', textAlign: 'center' }}
                  >
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge !== undefined && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '14px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: item.badgeColor === 'danger' ? '#ef4444' : '#f59e0b',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & System health */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            background: '#fafbfc',
          }}
        >
          {!collapsed ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  marginBottom: '0.75rem',
                }}
              >
                <span className="status-dot active" />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Campus Portal Live
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Sprint Admin • v1.0.0
                  </div>
                </div>
                <ShieldCheck size={16} color="#10b981" />
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
              >
                <LogOut size={14} />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="status-dot active" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
