import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UtensilsCrossed, Check, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentNotificationsApi,
  getUnreadNotificationsCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  StudentNotificationItem,
} from '../../api/studentApi';

export const StudentNotificationBell: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isStudent = isAuthenticated && (!user?.role || user.role.toUpperCase() === 'STUDENT');

  const fetchUnreadCount = useCallback(async () => {
    if (!isStudent) return;
    try {
      const count = await getUnreadNotificationsCountApi();
      setUnreadCount(count);
    } catch {
      // Silently ignore network errors during background polling
    }
  }, [isStudent]);

  const fetchNotifications = useCallback(async () => {
    if (!isStudent) return;
    try {
      setLoading(true);
      const data = await getStudentNotificationsApi();
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      // Silently ignore
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  // Initial fetch and polling every 30s
  useEffect(() => {
    if (!isStudent) return;
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isStudent, fetchUnreadCount]);

  // When dropdown opens, fetch latest notifications
  useEffect(() => {
    if (isOpen && isStudent) {
      fetchNotifications();
    }
  }, [isOpen, isStudent, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await markNotificationAsReadApi(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    try {
      setIsMarkingAll(true);
      await markAllNotificationsAsReadApi();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif: StudentNotificationItem) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.messId) {
      navigate(`/mess/${notif.messId}`);
    }
  };

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  if (!isStudent) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className="student-notifications-widget"
    >
      <button
        type="button"
        onClick={handleToggle}
        className="student-notification-bell-btn"
        aria-label="Student notifications"
        aria-expanded={isOpen}
        title="Mess opening alerts and notifications"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: isOpen ? 'var(--primary-light)' : 'var(--bg-app)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? 'var(--primary-dark)' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="student-notifications-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '350px',
            maxWidth: '92vw',
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-color)',
            zIndex: 1100,
            overflow: 'hidden',
            animation: 'fadeInSlide 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-app)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  transition: 'background 0.15s ease',
                }}
              >
                <CheckCheck size={14} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
            }}
          >
            {loading && notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--bg-app)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <UtensilsCrossed size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  No open mess alerts yet
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    maxWidth: '240px',
                  }}
                >
                  You will receive real-time alerts whenever registered messes open for meal service.
                </div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    background: item.read ? '#ffffff' : 'rgba(16, 185, 129, 0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? 'var(--bg-app)'
                      : 'rgba(16, 185, 129, 0.09)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = item.read
                      ? '#ffffff'
                      : 'rgba(16, 185, 129, 0.05)';
                  }}
                >
                  {/* Left Icon */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.read
                        ? 'var(--bg-app)'
                        : 'linear-gradient(135deg, #10b981, #059669)',
                      color: item.read ? 'var(--text-muted)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <UtensilsCrossed size={18} />
                  </div>

                  {/* Middle Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: item.read ? 600 : 700,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={11} />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.message}
                    </p>

                    {item.messName && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--primary)',
                        }}
                      >
                        View {item.messName} &rarr;
                      </span>
                    )}
                  </div>

                  {/* Right Mark as Read Button */}
                  {!item.read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      title="Mark as read"
                      aria-label="Mark notification as read"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '2px',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
