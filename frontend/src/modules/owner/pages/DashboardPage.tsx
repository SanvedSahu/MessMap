import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  UtensilsCrossed,
  MessageSquare,
  Star,
  Power,
  PlusCircle,
  Edit3,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Phone,
  MessageCircle,
  X,
  Eye,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Store
} from 'lucide-react';
import {
  initialDashboardStats,
  initialActivities,
  initialDashboardEnquiries,
} from '../../../data/mockDashboardData';
import type {
  DashboardEnquiry,
  ActivityItem,
  DashboardStats,
} from '../../../data/mockDashboardData';
import { useAuth } from '../../../context/AuthContext';
import { useMessData } from '../../../context/MessDataContext';
import { AlertTriangle } from 'lucide-react';
import './DashboardPage.css';

interface OutletContextType {
  isOpenStatus: boolean;
  toggleOpenStatus: () => void;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messes } = useMessData();
  const { isOpenStatus, toggleOpenStatus } = useOutletContext<OutletContextType>();

  const currentMess = messes.find((m) => m.id === user.messId) || messes[0];
  const messStatus = currentMess?.status || 'Approved';

  // State initialized with realistic domain mock data
  const [stats, setStats] = useState<DashboardStats>(initialDashboardStats);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [enquiries, setEnquiries] = useState<DashboardEnquiry[]>(initialDashboardEnquiries);

  // Modal states
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<DashboardEnquiry | null>(null);

  // Form states for Add Menu Item Quick Modal
  const [dishName, setDishName] = useState('');
  const [mealCategory, setMealCategory] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Lunch');
  const [dishPrice, setDishPrice] = useState(90);
  const [dietType, setDietType] = useState<'Veg' | 'Non-Veg'>('Veg');

  const todayDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  // Handle local availability toggle
  const handleToggleAvailability = () => {
    toggleOpenStatus();
    const newStatus = !isOpenStatus;
    setStats((prev) => ({ ...prev, isAvailable: newStatus }));

    // Log this action to recent activities
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'status',
      title: `Mess Status Marked as ${newStatus ? 'Open' : 'Closed'}`,
      description: `Mess availability status was updated by owner for student discovery.`,
      timestamp: 'Just now',
      badgeText: newStatus ? 'Status: Open' : 'Status: Closed',
      badgeType: newStatus ? 'green' : 'purple',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Handle Quick Add Menu Item submission
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    // Increment stats
    setStats((prev) => ({
      ...prev,
      totalMenuItems: prev.totalMenuItems + 1,
      activeMenuItems: prev.activeMenuItems + 1,
    }));

    // Add to activity stream
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'menu',
      title: `Added "${dishName.trim()}" to ${mealCategory}`,
      description: `Dish listed under ${mealCategory} at ₹${dishPrice} (${dietType}).`,
      timestamp: 'Just now',
      badgeText: 'Menu Updated',
      badgeType: 'green',
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Reset & close
    setDishName('');
    setDishPrice(90);
    setIsAddMenuOpen(false);
  };

  // Handle marking an enquiry as Replied
  const handleMarkEnquiryReplied = (enquiryId: string) => {
    setEnquiries((prev) =>
      prev.map((item) =>
        item.id === enquiryId ? { ...item, status: 'Replied' } : item
      )
    );

    if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: 'Replied' } : null));
    }

    setStats((prev) => ({
      ...prev,
      pendingEnquiries: Math.max(0, prev.pendingEnquiries - 1),
    }));
  };

  return (
    <div className="dashboard-container">
      {/* Verification Status Alert Banner */}
      {messStatus === 'Pending' && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Clock size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem', marginBottom: '2px' }}>
              Mess Registration Status: Pending Admin Verification
            </div>
            <div style={{ color: '#b45309', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Your mess details have been submitted. An admin will review them before your mess appears to students.
              You can still configure your daily menu, operating hours, and profile settings below.
            </div>
          </div>
        </div>
      )}

      {messStatus === 'Rejected' && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem', marginBottom: '2px' }}>
              Mess Registration Rejected by Admin
            </div>
            <div style={{ color: '#b91c1c', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Reason: {currentMess?.rejectionReason || 'Application did not satisfy health & safety criteria.'}{' '}
              Please update your mess details in the Profile tab and resubmit for verification.
            </div>
          </div>
        </div>
      )}

      {/* 1. Welcome Heading & Hero Section */}
      <section className="welcome-hero-card">
        <div className="welcome-text-content">
          <div className="welcome-meta-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Mess Owner Control Center</span>
            <span className="pill-dot">•</span>
            <span className="owner-status-tag">
              <ShieldCheck size={13} /> {messStatus === 'Approved' ? 'Verified Partner' : 'Verification Pending'}
            </span>
          </div>

          <h2 className="welcome-title">Welcome back, {user.name || 'Rajesh Sharma'}! 👋</h2>
          <p className="welcome-subtitle">
            Overview and real-time operations for <strong>{currentMess?.name || 'Annapurna Deluxe Mess'}</strong> today ({todayDate}).
          </p>

          <div className="welcome-status-row">
            <div className={`status-pill ${isOpenStatus ? 'open' : 'closed'}`}>
              <span className="dot" />
              <span>
                {isOpenStatus ? 'Mess is OPEN for Student Discovery' : 'Mess is currently CLOSED'}
              </span>
            </div>
            <button
              type="button"
              className="btn-toggle-quick"
              onClick={handleToggleAvailability}
            >
              {isOpenStatus ? 'Switch to Closed' : 'Switch to Open'}
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="hero-quick-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddMenuOpen(true)}
            id="btn-quick-add-menu"
          >
            <PlusCircle size={16} /> Add Menu Item
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/owner/profile')}
            id="btn-quick-edit-profile"
          >
            <Edit3 size={16} /> Edit Mess Profile
          </button>
        </div>
      </section>

      {/* 2. Four Summary Cards */}
      <section className="metrics-grid" aria-label="Summary Cards">
        {/* Card 1: Total Menu Items */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Menu Items</span>
            <div className="metric-icon-badge green">
              <UtensilsCrossed size={20} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.totalMenuItems}</span>
            <span className="badge badge-green">
              {stats.activeMenuItems} Active Today
            </span>
          </div>
          <div className="metric-footer-row">
            <span className="metric-footnote">Across Breakfast, Lunch & Dinner</span>
            <button
              className="metric-link-btn"
              onClick={() => navigate('/owner/menu')}
              title="Manage all menu items"
            >
              Manage <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 2: Customer Enquiries */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Customer Enquiries</span>
            <div className="metric-icon-badge blue">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.totalEnquiries}</span>
            <span className="badge badge-warning">
              {stats.pendingEnquiries} Pending Reply
            </span>
          </div>
          <div className="metric-footer-row">
            <span className="metric-footnote">From prospective student diners</span>
            <button
              className="metric-link-btn"
              onClick={() => navigate('/owner/enquiries')}
              title="View all enquiries"
            >
              View <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 3: Average Rating */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Average Rating</span>
            <div className="metric-icon-badge yellow">
              <Star size={20} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">{stats.averageRating} ★</span>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> +0.2 this week
            </span>
          </div>
          <div className="metric-footer-row">
            <span className="metric-footnote">Based on {stats.totalReviews} verified student reviews</span>
            <button
              className="metric-link-btn"
              onClick={() => navigate('/owner/reviews')}
              title="Read all reviews"
            >
              Reviews <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 4: Mess Availability */}
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Mess Availability</span>
            <div className={`metric-icon-badge ${isOpenStatus ? 'green' : 'orange'}`}>
              <Power size={20} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-number">
              {isOpenStatus ? 'Open Today' : 'Closed'}
            </span>
            <span className={`badge ${isOpenStatus ? 'badge-green' : 'badge-danger'}`}>
              {isOpenStatus ? 'Serving' : 'Off-duty'}
            </span>
          </div>
          <div className="metric-footer-row">
            <span className="metric-footnote">
              {isOpenStatus ? 'Visible on student map discovery' : 'Hidden from active nearby search'}
            </span>
            <button
              className="metric-link-btn toggle"
              onClick={handleToggleAvailability}
              title="Toggle mess operating status"
            >
              {isOpenStatus ? 'Close' : 'Open'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Middle Section: Recent Activity & Quick Navigation Overview */}
      <div className="dashboard-content-split">
        {/* Left Column: Recent Activity Feed */}
        <section className="card activity-section-card">
          <div className="section-card-header">
            <div>
              <h3 className="section-title">Recent Activity</h3>
              <p className="section-desc">Audit log of your recent updates, responses, and menu changes</p>
            </div>
            <span className="badge badge-green">Live Feed</span>
          </div>

          <div className="activity-timeline">
            {activities.map((act) => (
              <div key={act.id} className="activity-timeline-item">
                <div className={`activity-icon-bubble ${act.badgeType}`}>
                  {act.type === 'menu' && <UtensilsCrossed size={16} />}
                  {act.type === 'enquiry' && <MessageSquare size={16} />}
                  {act.type === 'review' && <Star size={16} />}
                  {act.type === 'status' && <Power size={16} />}
                  {act.type === 'profile' && <Store size={16} />}
                </div>

                <div className="activity-body">
                  <div className="activity-top-line">
                    <span className="activity-item-title">{act.title}</span>
                    <span className="activity-item-time">
                      <Clock size={11} /> {act.timestamp}
                    </span>
                  </div>
                  <p className="activity-item-desc">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Quick Mess Profile & Plan Highlights */}
        <div className="dashboard-side-stack">
          {/* Quick Profile Summary Card */}
          <section className="card mess-overview-card">
            <div className="mess-overview-header">
              <div className="mess-name-group">
                <h4 className="mess-name-heading">Annapurna Deluxe Mess</h4>
                <p className="mess-loc-sub">Katraj-Kondhwa Road, Pune • Estd. 2018</p>
              </div>
              <span className="badge badge-green">
                <CheckCircle2 size={12} /> Verified
              </span>
            </div>

            <div className="mess-stats-mini-grid">
              <div className="mini-stat-box">
                <span className="stat-label">Active Diners</span>
                <span className="stat-num">{stats.activeDiners}</span>
              </div>
              <div className="mini-stat-box">
                <span className="stat-label">Monthly Rate</span>
                <span className="stat-num">₹3,200</span>
              </div>
              <div className="mini-stat-box">
                <span className="stat-label">Food Type</span>
                <span className="stat-num">Pure Veg</span>
              </div>
            </div>

            <div className="quick-nav-links-list">
              <button
                className="quick-nav-row"
                onClick={() => navigate('/owner/menu')}
              >
                <div className="nav-row-left">
                  <UtensilsCrossed size={16} className="nav-row-icon" />
                  <span>Update Daily Dishes & Pricing</span>
                </div>
                <ChevronRight size={16} className="nav-row-arrow" />
              </button>

              <button
                className="quick-nav-row"
                onClick={() => navigate('/owner/profile')}
              >
                <div className="nav-row-left">
                  <Store size={16} className="nav-row-icon" />
                  <span>Mess Details, Timings & Amenities</span>
                </div>
                <ChevronRight size={16} className="nav-row-arrow" />
              </button>

              <button
                className="quick-nav-row"
                onClick={() => navigate('/owner/reviews')}
              >
                <div className="nav-row-left">
                  <Star size={16} className="nav-row-icon" />
                  <span>Student Feedback & Ratings ({stats.averageRating}★)</span>
                </div>
                <ChevronRight size={16} className="nav-row-arrow" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 4. Recent Customer Enquiries Table */}
      <section className="card enquiries-table-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-title">Recent Customer Enquiries</h3>
            <p className="section-desc">
              Prospective student diners requesting monthly subscriptions and trial meals
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/owner/enquiries')}
          >
            View All Enquiries ({stats.totalEnquiries}) <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="table-responsive-wrapper">
          <table className="enquiries-data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College / Area</th>
                <th>Interested Plan</th>
                <th>Received</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id} className="enquiry-table-row">
                  {/* Student Name */}
                  <td className="td-student">
                    <div className="student-cell-wrap">
                      <div className="student-avatar-initials">
                        {enq.studentName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="student-details">
                        <span className="student-name-strong">{enq.studentName}</span>
                        <span className="student-phone-sub">{enq.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* College */}
                  <td className="td-college">{enq.college}</td>

                  {/* Plan */}
                  <td className="td-plan">
                    <span className="plan-badge-pill">{enq.planType}</span>
                  </td>

                  {/* Date Time */}
                  <td className="td-datetime">{enq.dateTime}</td>

                  {/* Status */}
                  <td className="td-status">
                    {enq.status === 'New' && (
                      <span className="badge badge-warning">New</span>
                    )}
                    {enq.status === 'In Discussion' && (
                      <span className="badge badge-info">In Discussion</span>
                    )}
                    {enq.status === 'Replied' && (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} /> Replied
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="td-actions">
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="table-action-btn view"
                        title="View Enquiry Message"
                        onClick={() => setSelectedEnquiry(enq)}
                      >
                        <Eye size={14} /> View
                      </button>

                      <a
                        href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                          enq.studentName
                        )},%20this%20is%20Annapurna%20Mess%20regarding%20your%20inquiry:`}
                        target="_blank"
                        rel="noreferrer"
                        className="table-action-btn whatsapp"
                        title="Reply via WhatsApp"
                        onClick={() => handleMarkEnquiryReplied(enq.id)}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>

                      <a
                        href={`tel:${enq.phone}`}
                        className="table-action-btn call"
                        title="Call Student"
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Add Menu Item Modal */}
      {isAddMenuOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMenuOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <UtensilsCrossed size={20} className="modal-title-icon" />
                <h3 className="modal-title">Quick Add Menu Item</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddMenuOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMenuItem} className="modal-form">
              <div className="form-group">
                <label className="form-label">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahi Paneer, Poha, Veg Biryani"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Meal Category *</label>
                  <select
                    value={mealCategory}
                    onChange={(e) => setMealCategory(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Type *</label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="Veg">Pure Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={dishPrice}
                  onChange={(e) => setDishPrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddMenuOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <PlusCircle size={15} /> Add to Today's Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="modal-backdrop" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <MessageSquare size={20} className="modal-title-icon blue" />
                <h3 className="modal-title">Enquiry Details</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="enquiry-modal-student-row">
                <div className="student-avatar-initials large">
                  {selectedEnquiry.studentName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="enquiry-student-title">{selectedEnquiry.studentName}</h4>
                  <p className="enquiry-student-sub">{selectedEnquiry.college}</p>
                </div>
                <span className="plan-badge-pill" style={{ marginLeft: 'auto' }}>
                  {selectedEnquiry.planType}
                </span>
              </div>

              <div className="enquiry-detail-meta-box">
                <div className="detail-meta-item">
                  <span className="meta-k">Phone:</span>
                  <a href={`tel:${selectedEnquiry.phone}`} className="meta-v link">
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div className="detail-meta-item">
                  <span className="meta-k">Received:</span>
                  <span className="meta-v">{selectedEnquiry.dateTime}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="meta-k">Current Status:</span>
                  <span className="meta-v">
                    <span
                      className={`badge ${
                        selectedEnquiry.status === 'Replied'
                          ? 'badge-green'
                          : 'badge-warning'
                      }`}
                    >
                      {selectedEnquiry.status}
                    </span>
                  </span>
                </div>
              </div>

              <div className="enquiry-message-view">
                <span className="message-label">Student's Message:</span>
                <p className="message-quote">"{selectedEnquiry.message}"</p>
              </div>

              <div className="modal-actions-enquiry">
                {selectedEnquiry.status !== 'Replied' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleMarkEnquiryReplied(selectedEnquiry.id)}
                  >
                    <CheckCircle2 size={15} /> Mark as Replied
                  </button>
                )}

                <a
                  href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                    selectedEnquiry.studentName
                  )},%20this%20is%20Annapurna%20Mess%20regarding%20your%20inquiry:`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  onClick={() => handleMarkEnquiryReplied(selectedEnquiry.id)}
                >
                  <MessageCircle size={15} /> Reply via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
