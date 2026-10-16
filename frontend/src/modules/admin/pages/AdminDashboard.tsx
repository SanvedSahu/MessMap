import React from 'react';
import { StatCard } from '../../../components/ui/StatCard';
import {
  Users,
  Utensils,
  Clock,
  MessageSquareWarning,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { GrowthBarChart, CuisineDonutBreakdown } from '../components/AnalyticsCharts';
import { DashboardStats, ActivityItem, Mess } from '../types/admin.types';
import { AdminTab } from '../layouts/AdminSidebar';

interface AdminDashboardProps {
  stats: DashboardStats;
  activities: ActivityItem[];
  pendingMesses: Mess[];
  onNavigate: (tab: AdminTab) => void;
  onOpenMessDetail: (mess: Mess) => void;
  onQuickApproveMess: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  activities,
  pendingMesses,
  onNavigate,
  onOpenMessDetail,
  onQuickApproveMess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Academic Term 2026-27 Active
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Campus Wide Deployment</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            MessMap Central Administration
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>
            Monitored food services, mess verifications, and student health compliance across 4 college campus zones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', zIndex: 2 }}>
          <button
            onClick={() => onNavigate('messes')}
            className="btn"
            style={{
              backgroundColor: '#ffffff',
              color: '#065f46',
              fontWeight: 700,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            Review Pending Submissions ({stats.pendingApprovals})
          </button>
        </div>

        {/* Decorative circle glow */}
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            bottom: '-60px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-stats">
        <StatCard
          title="Total Registered Students"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowthPercent}
          changeLabel="new signups this month"
          icon={<Users size={22} />}
          iconBg="#ecfdf5"
          iconColor="#10b981"
          onClick={() => onNavigate('users')}
        />

        <StatCard
          title="Onboarded Mess Listings"
          value={stats.totalMesses.toLocaleString()}
          change={stats.messGrowthPercent}
          changeLabel="active dining halls"
          icon={<Utensils size={22} />}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          onClick={() => onNavigate('messes')}
        />

        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          changeLabel="awaiting compliance check"
          icon={<Clock size={22} />}
          iconBg="#fffbeb"
          iconColor="#f59e0b"
          badgeText={stats.pendingApprovals > 0 ? 'Action Required' : 'All Clear'}
          badgeVariant="warning"
          onClick={() => onNavigate('messes')}
        />

        <StatCard
          title="Reviews & Complaints"
          value={`${stats.totalReviews} / ${stats.openComplaints}`}
          changeLabel={`${stats.openComplaints} open grievance tickets`}
          icon={<MessageSquareWarning size={22} />}
          iconBg="#fef2f2"
          iconColor="#ef4444"
          badgeText={stats.openComplaints > 0 ? `${stats.openComplaints} Open` : 'Resolved'}
          badgeVariant="danger"
          onClick={() => onNavigate('reviews')}
        />
      </div>

      {/* Main Grid: Charts & Pending Approvals */}
      <div className="grid-2col">
        {/* Left Column: Growth Trends Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                Platform Growth & Enrollment Velocity
              </div>
              <div className="card-subtitle">
                Monthly trends of student adoption and dining venue onboarding
              </div>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="btn btn-outline btn-sm"
            >
              Full Analytics <ArrowRight size={14} />
            </button>
          </div>

          <GrowthBarChart />
        </div>

        {/* Right Column: Cuisine Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Food Category Mix</div>
              <div className="card-subtitle">Distribution across dietary preferences</div>
            </div>
          </div>
          <CuisineDonutBreakdown />
        </div>
      </div>

      {/* Bottom Section: Pending Approvals Quick Table & Recent Activities */}
      <div className="grid-2col">
        {/* Pending Approvals Widget */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={18} color="#f59e0b" />
                Pending Mess Verification Queue ({pendingMesses.length})
              </div>
              <div className="card-subtitle">
                Premises awaiting license verification and hygiene sign-off
              </div>
            </div>
            <button
              onClick={() => onNavigate('messes')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              View Directory
            </button>
          </div>

          {pendingMesses.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mess Name</th>
                    <th>Dietary Type</th>
                    <th>Area</th>
                    <th>Price/Mo</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMesses.map((mess) => (
                    <tr key={mess.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{mess.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Owner: {mess.ownerName}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {mess.foodType}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} color="var(--primary)" />
                          {mess.area}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>₹{mess.monthlyPrice}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => onOpenMessDetail(mess)}
                            className="btn btn-outline btn-sm"
                            title="Inspect details"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onQuickApproveMess(mess.id)}
                            className="btn btn-success btn-sm"
                            title="Quick Approve"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600 }}>All mess applications have been reviewed!</p>
              <p style={{ fontSize: '0.8rem' }}>No pending applications waiting in the queue.</p>
            </div>
          )}
        </div>

        {/* Recent Activities Timeline */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live System Audit Trail</div>
              <div className="card-subtitle">Real-time platform events & moderation actions</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor:
                      act.badgeVariant === 'success'
                        ? '#ecfdf5'
                        : act.badgeVariant === 'warning'
                        ? '#fffbeb'
                        : act.badgeVariant === 'danger'
                        ? '#fef2f2'
                        : '#eff6ff',
                    color:
                      act.badgeVariant === 'success'
                        ? '#059669'
                        : act.badgeVariant === 'warning'
                        ? '#d97706'
                        : act.badgeVariant === 'danger'
                        ? '#dc2626'
                        : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {act.badgeVariant === 'danger' ? (
                    <ShieldAlert size={16} />
                  ) : act.badgeVariant === 'warning' ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {act.title}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-light)' }}>
                      {act.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
