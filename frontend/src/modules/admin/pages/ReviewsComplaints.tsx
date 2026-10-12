import React, { useState, useMemo } from 'react';
import { Complaint, Review, ComplaintStatus, ReviewStatus } from '../types/admin.types';
import { Badge, getStatusBadgeVariant } from '../../../components/Badge';
import { EmptyState } from '../../../components/EmptyState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import {
  MessageSquare,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  ShieldAlert,
} from 'lucide-react';

interface ReviewsComplaintsProps {
  complaints: Complaint[];
  reviews: Review[];
  onOpenComplaint: (complaint: Complaint) => void;
  onUpdateComplaintStatus: (id: string, newStatus: ComplaintStatus, notes?: string) => void;
  onModerateReview: (id: string, newStatus: ReviewStatus) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const ReviewsComplaints: React.FC<ReviewsComplaintsProps> = ({
  complaints,
  reviews,
  onOpenComplaint,
  onUpdateComplaintStatus,
  onModerateReview,
  searchTerm,
  onSearchChange,
}) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'reviews'>('complaints');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<string>('All');

  // Review moderation confirm dialog
  const [flaggingReviewId, setFlaggingReviewId] = useState<string | null>(null);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        searchTerm === '' ||
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.messName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchSeverity = severityFilter === 'All' || c.severity === severityFilter;

      return matchSearch && matchStatus && matchSeverity;
    });
  }, [complaints, searchTerm, statusFilter, severityFilter]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.messName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchRating = ratingFilter === 'All' || r.rating === parseInt(ratingFilter, 10);

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Switcher Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Feedback & Grievance Redressal Hub
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Investigate hygiene issues, resolve pricing disputes, and moderate public dining reviews
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
          <button
            onClick={() => {
              setActiveTab('complaints');
              setStatusFilter('All');
            }}
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.45rem 1rem', gap: '0.4rem' }}
          >
            <AlertTriangle size={15} /> Student Grievances ({complaints.filter((c) => c.status !== 'Resolved').length})
          </button>
          <button
            onClick={() => {
              setActiveTab('reviews');
              setStatusFilter('All');
            }}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.45rem 1rem', gap: '0.4rem' }}
          >
            <MessageSquare size={15} /> All Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder={activeTab === 'complaints' ? 'Search tickets, mess, student...' : 'Search reviews, mess name...'}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {activeTab === 'complaints' ? (
                <>
                  <option value="Open">Open</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Dismissed">Dismissed</option>
                </>
              ) : (
                <>
                  <option value="Published">Published</option>
                  <option value="Flagged">Flagged</option>
                  <option value="Removed">Removed</option>
                </>
              )}
            </select>
          </div>

          {activeTab === 'complaints' && (
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          )}

          {activeTab === 'reviews' && (
            <select
              className="form-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="All">All Star Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          )}
        </div>

        {(statusFilter !== 'All' || severityFilter !== 'All' || ratingFilter !== 'All' || searchTerm !== '') && (
          <button
            onClick={() => {
              setStatusFilter('All');
              setSeverityFilter('All');
              setRatingFilter('All');
              onSearchChange('');
            }}
            className="btn btn-ghost btn-sm"
            style={{ color: '#ef4444' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main View: Complaints List or Reviews Grid */}
      {activeTab === 'complaints' ? (
        filteredComplaints.length === 0 ? (
          <EmptyState
            title="No Grievances Found"
            description="No student complaint tickets match your current filters. Campus dining standards are currently in good order!"
            actionText="Clear Filters"
            onAction={() => {
              setStatusFilter('All');
              setSeverityFilter('All');
              onSearchChange('');
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${
                    c.severity === 'Critical'
                      ? '#ef4444'
                      : c.severity === 'High'
                      ? '#f97316'
                      : c.severity === 'Medium'
                      ? '#f59e0b'
                      : '#10b981'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.04em' }}>
                        {c.ticketNumber}
                      </span>
                      <Badge variant={getStatusBadgeVariant(c.status)} dot>
                        {c.status}
                      </Badge>
                      <span className={`badge badge-${getStatusBadgeVariant(c.severity)}`}>
                        {c.severity} Priority
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Logged on {c.date}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {c.subject}
                    </h3>

                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Mess: <strong style={{ color: 'var(--text-main)' }}>{c.messName}</strong> • Reported by: <strong>{c.userName}</strong> ({c.userEmail})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onOpenComplaint(c)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={14} /> Investigate Docket
                    </button>

                    {c.status !== 'Resolved' && (
                      <button
                        onClick={() => onUpdateComplaintStatus(c.id, 'Resolved', 'Marked resolved directly by administrator.')}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle2 size={14} /> Resolve
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', margin: '1rem 0 0.5rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  {c.description}
                </div>

                {c.adminNotes && (
                  <div style={{ fontSize: '0.8rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                    <strong>Admin Note:</strong> {c.adminNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Reviews tab */
        filteredReviews.length === 0 ? (
          <EmptyState
            title="No Reviews Found"
            description="No student dining reviews match your current filters."
            actionText="Clear Filters"
            onAction={() => {
              setStatusFilter('All');
              setRatingFilter('All');
              onSearchChange('');
            }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredReviews.map((r) => (
              <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={r.userAvatar}
                        alt={r.userName}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {r.userName}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {r.date}
                        </div>
                      </div>
                    </div>

                    <Badge variant={getStatusBadgeVariant(r.status)} dot>
                      {r.status}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {r.messName}
                    </div>

                    <div style={{ display: 'flex', color: '#f59e0b', fontSize: '0.85rem' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < r.rating ? '#f59e0b' : '#e2e8f0' }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '0.5rem' }}>
                    "{r.comment}"
                  </p>

                  {r.flagReason && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#991b1b' }}>
                      <strong>Audit Flag:</strong> {r.flagReason}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Food: {r.foodQualityScore}/5 • Hygiene: {r.hygieneScore}/5
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {r.status === 'Published' ? (
                      <button
                        onClick={() => setFlaggingReviewId(r.id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Flag or remove review"
                      >
                        <ShieldAlert size={14} /> Moderate
                      </button>
                    ) : (
                      <button
                        onClick={() => onModerateReview(r.id, 'Published')}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#10b981' }}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Confirm Review Moderation Dialog */}
      <ConfirmDialog
        isOpen={flaggingReviewId !== null}
        onClose={() => setFlaggingReviewId(null)}
        onConfirm={() => {
          if (flaggingReviewId) {
            onModerateReview(flaggingReviewId, 'Removed');
            setFlaggingReviewId(null);
          }
        }}
        title="Moderate Inappropriate Review"
        message="Are you sure you want to hide this review from the public student discovery view? It will remain archived in the moderation audit log."
        confirmText="Remove from Public Map"
        variant="danger"
      />
    </div>
  );
};
