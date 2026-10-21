import React, { useState, useEffect, useMemo } from 'react';
import {
  getSuspensionReviewsApi,
  approveSuspensionReviewApi,
  rejectSuspensionReviewApi,
  SuspensionReviewItem,
} from '../../../api/adminApi';
import { Badge, getStatusBadgeVariant } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  Store,
  Calendar,
} from 'lucide-react';

interface SuspensionReviewsQueueProps {
  token?: string;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onMessStatusUpdated?: () => void;
}

export const SuspensionReviewsQueue: React.FC<SuspensionReviewsQueueProps> = ({
  token,
  onShowToast,
  onMessStatusUpdated,
}) => {
  const [reviews, setReviews] = useState<SuspensionReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Reject review modal state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await getSuspensionReviewsApi(undefined, token);
      if (res?.data) {
        setReviews(res.data);
      }
    } catch (err: any) {
      console.warn('Could not fetch suspension reviews from backend:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        r.messName.toLowerCase().includes(term) ||
        r.ownerName.toLowerCase().includes(term) ||
        (r.ownerEmail && r.ownerEmail.toLowerCase().includes(term)) ||
        (r.explanation && r.explanation.toLowerCase().includes(term));
      return matchStatus && matchSearch;
    });
  }, [reviews, statusFilter, searchTerm]);

  const pendingCount = useMemo(() => {
    return reviews.filter((r) => r.status === 'PENDING').length;
  }, [reviews]);

  const handleApprove = async (id: number, messName: string) => {
    if (!window.confirm(`Are you sure you want to approve the suspension review for "${messName}"? This will restore the mess listing to APPROVED status.`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await approveSuspensionReviewApi(id, token);
      if (res?.data) {
        onShowToast(`Suspension lifted for "${messName}". Mess restored to APPROVED status.`, 'success');
        await fetchReviews();
        if (onMessStatusUpdated) onMessStatusUpdated();
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to approve suspension review.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError('Rejection explanation is mandatory and cannot be blank.');
      return;
    }

    setIsProcessing(true);
    setRejectError(null);
    try {
      const res = await rejectSuspensionReviewApi(rejectingId, trimmed, token);
      if (res?.data) {
        onShowToast(`Suspension review rejected. Mess remains SUSPENDED.`, 'info');
        setRejectingId(null);
        setRejectReason('');
        await fetchReviews();
        if (onMessStatusUpdated) onMessStatusUpdated();
      }
    } catch (err: any) {
      setRejectError(err.message || 'Failed to reject suspension review.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Suspension Review Queue
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review and adjudicate owner requests to lift administrative suspensions ({pendingCount} pending decision)
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={isLoading}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by mess name, owner, or explanation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {tab === 'PENDING' ? `Pending (${pendingCount})` : tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table / Card List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredReviews.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={48} />}
            title={statusFilter === 'PENDING' ? 'No Pending Suspension Reviews' : 'No Review Requests Found'}
            description={
              statusFilter === 'PENDING'
                ? 'All suspension review requests have been adjudicated. No pending requests require review.'
                : 'No suspension review requests match the specified search or filter criteria.'
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    MESS & OWNER
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    OWNER EXPLANATION
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    REQUEST DATE
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    STATUS
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ADMIN REMARKS
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {rev.messName}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ID: #{rev.messId} • Owner: {rev.ownerName}
                        </span>
                        {rev.ownerEmail && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {rev.ownerEmail}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', maxWidth: '320px' }}>
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.6rem 0.8rem',
                          fontSize: '0.84rem',
                          color: '#334155',
                          lineHeight: 1.45,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {rev.explanation || <em style={{ color: 'var(--text-muted)' }}>No written explanation provided</em>}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'N/A'}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <Badge variant={getStatusBadgeVariant(rev.status)}>
                        {rev.status}
                      </Badge>
                    </td>

                    <td style={{ padding: '1rem', maxWidth: '240px', fontSize: '0.82rem' }}>
                      {rev.adminNotes ? (
                        <div style={{ color: '#475569' }}>
                          <span style={{ fontWeight: 600 }}>Notes: </span>
                          <span>{rev.adminNotes}</span>
                          {rev.reviewedByAdminName && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              By {rev.reviewedByAdminName}
                            </div>
                          )}
                        </div>
                      ) : rev.status === 'APPROVED' ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>Suspension lifted</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Awaiting decision</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {rev.status === 'PENDING' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleApprove(rev.id, rev.messName)}
                            disabled={isProcessing}
                            className="btn btn-success btn-sm"
                            title="Approve review and lift suspension"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(rev.id);
                              setRejectReason('');
                              setRejectError(null);
                            }}
                            disabled={isProcessing}
                            className="btn btn-danger btn-sm"
                            title="Reject review and keep suspended"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Suspension Review Modal */}
      {rejectingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Reject Suspension Review Request
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Explain why the suspension remains in effect. Visible to the mess owner.
                </p>
              </div>
            </div>

            {rejectError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.8rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#991b1b',
                  fontWeight: 600,
                }}
              >
                {rejectError}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '0.4rem',
                  color: 'var(--text-main)',
                }}
              >
                Rejection Explanation Note <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError(null);
                }}
                placeholder="Specify what issues remain unresolved (e.g. hygiene inspection certificates missing, kitchen audit pending)..."
                className="input"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                  setRejectError(null);
                }}
                disabled={isProcessing}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessing}
                className="btn btn-danger"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
