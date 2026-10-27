import React, { useState, useEffect } from 'react';
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
  Store,
  AlertCircle,
  AlertTriangle,
  Plus,
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
import {
  getMessVerificationStatusApi,
  submitMessVerificationApi,
  getOwnerSuspensionReviewsApi,
  requestSuspensionReviewApi,
  getOwnerMenuApi,
  type MessVerificationStatusData,
  type OwnerSuspensionReviewResponse,
} from '../../../api/ownerApi';
import { getMessReviewsApi } from '../../../api/studentApi';
import './DashboardPage.css';

interface DashboardOutletContextType {
  isOpenStatus?: boolean;
  toggleOpenStatus?: () => void;
  messStatus?: string;
  removalReason?: string;
  ownerMess?: any;
  loadingMess?: boolean;
  refreshOwnerMess?: () => Promise<any>;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messes } = useMessData();
  const outletCtx = useOutletContext<DashboardOutletContextType | null>();
  const isOpenStatus = outletCtx?.isOpenStatus ?? true;
  const toggleOpenStatus = outletCtx?.toggleOpenStatus ?? (() => {});
  const layoutMessStatus = outletCtx?.messStatus;
  const layoutRemovalReason = outletCtx?.removalReason;
  const ownerMess = outletCtx?.ownerMess ?? null;
  const loadingMess = outletCtx?.loadingMess ?? false;
  const refreshOwnerMess = outletCtx?.refreshOwnerMess;

  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com' || user.messId === 'MESS-101';
  // Check if owner has a mess (prioritize authenticated owner's loaded mess, then messId in context, then demo owner fallback)
  const currentMess = ownerMess || (user.messId ? messes.find((m) => m.id === user.messId) : (isDemoOwner ? messes[0] : null));

  // Live verification status states
  const [verificationStatus, setVerificationStatus] = useState<MessVerificationStatusData | null>(null);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState<string | null>(null);

  // Suspension review states
  const [suspensionReviews, setSuspensionReviews] = useState<OwnerSuspensionReviewResponse[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewExplanation, setReviewExplanation] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState<string | null>(null);

  const hasMess = !!ownerMess || !!currentMess || (user.messId != null && user.messId !== '') || (verificationStatus != null && verificationStatus.messId != null);
  const messStatus = ownerMess?.status || currentMess?.status || verificationStatus?.status || (isDemoOwner ? 'Approved' : 'Pending');

  // Derived display details from persisted mess data
  const displayMessName =
    ownerMess?.name ||
    (typeof (currentMess as any)?.name === 'string' ? (currentMess as any).name : undefined) ||
    user.messName ||
    (isDemoOwner ? 'Annapurna Deluxe Mess' : 'My Mess');

  const displayAddress =
    ownerMess?.address
      ? `${ownerMess.address}${ownerMess.city ? `, ${ownerMess.city}` : ''}`
      : (typeof (currentMess as any)?.location === 'string'
          ? (currentMess as any).location
          : isDemoOwner
          ? 'Katraj-Kondhwa Road, Pune • Estd. 2018'
          : 'Address not configured');

  const formatMonthlyPrice = (price?: number | string) => {
    if (price == null || price === '') {
      return isDemoOwner ? '₹3,200' : '₹0';
    }
    const num = Number(price);
    return isNaN(num) ? `₹${price}` : `₹${num.toLocaleString('en-IN')}`;
  };

  const displayMonthlyPrice = formatMonthlyPrice(ownerMess?.monthlyPrice ?? (currentMess as any)?.price);

  const formatFoodType = (ft?: string) => {
    if (!ft) return isDemoOwner ? 'Pure Veg' : 'Not specified';
    switch (ft.toUpperCase()) {
      case 'PURE_VEG':
        return 'Pure Veg';
      case 'VEG_AND_NON_VEG':
      case 'NON_VEG':
        return 'Veg & Non-Veg';
      case 'JAIN_FRIENDLY':
      case 'JAIN':
        return 'Jain Friendly';
      default:
        return ft;
    }
  };

  const displayFoodType = formatFoodType(ownerMess?.foodType ?? (currentMess as any)?.foodType);

  // Fetch live verification status and suspension reviews from backend
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getMessVerificationStatusApi(token)
        .then((res) => {
          if (res?.data) {
            setVerificationStatus(res.data);
          }
        })
        .catch((err) => {
          console.warn('Backend verification status note:', err.message);
        });

      getOwnerSuspensionReviewsApi(token)
        .then((res) => {
          if (res?.data) {
            setSuspensionReviews(res.data);
          }
        })
        .catch((err) => {
          console.warn('Backend suspension reviews note:', err.message);
        });
    }
  }, []);

  // Fetch live menu stats and review metrics for the authenticated owner's mess
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (!token) return;

    const activeMessId = ownerMess?.id || (user.messId && !isNaN(Number(user.messId)) ? Number(user.messId) : undefined);
    if (activeMessId) {
      getOwnerMenuApi(token, activeMessId)
        .then((res) => {
          if (res?.data) {
            const items = res.data.items || [];
            setStats((prev) => ({
              ...prev,
              totalMenuItems: items.length,
              activeMenuItems: items.filter((item) => item.isAvailable !== false).length,
            }));
          }
        })
        .catch((err) => {
          console.warn('Dashboard menu stats note:', err.message);
        });

      getMessReviewsApi(activeMessId)
        .then((res) => {
          if (res?.data) {
            setStats((prev) => ({
              ...prev,
              averageRating: Number(res.data.averageRating) || 0,
              totalReviews: res.data.totalReviews || 0,
            }));
          }
        })
        .catch((err) => {
          console.warn('Dashboard reviews stats note:', err.message);
        });
    }
  }, [ownerMess?.id, user.messId]);

  const handleSubmitSuspensionReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('messmap_auth_token');
    if (!token) return;
    setIsSubmittingReview(true);
    setReviewSubmitError(null);
    setReviewSubmitSuccess(null);
    try {
      const res = await requestSuspensionReviewApi(token, reviewExplanation.trim() || undefined);
      if (res?.data) {
        setSuspensionReviews((prev) => [res.data, ...prev]);
        setReviewSubmitSuccess('Suspension review request submitted successfully! An administrator will evaluate your mess listing.');
        setIsReviewModalOpen(false);
        setReviewExplanation('');
      }
    } catch (err: any) {
      setReviewSubmitError(err.message || 'Failed to submit suspension review request.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitVerification = async () => {
    const token = localStorage.getItem('messmap_auth_token');
    if (!token) return;
    setIsSubmittingVerification(true);
    setVerificationError(null);
    setVerificationSuccessMsg(null);
    try {
      const res = await submitMessVerificationApi(token);
      if (res?.data) {
        setVerificationStatus(res.data);
        setVerificationSuccessMsg('Mess submitted for admin verification! Status is now PENDING.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to submit mess for verification.');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // State initialized with realistic domain mock data only for demo account
  const [stats, setStats] = useState<DashboardStats>(() => {
    if (isDemoOwner) return initialDashboardStats;
    return {
      totalMenuItems: 0,
      activeMenuItems: 0,
      totalEnquiries: 0,
      pendingEnquiries: 0,
      averageRating: 0,
      totalReviews: 0,
      isAvailable: true,
      activeDiners: 0,
    };
  });
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    if (isDemoOwner) return initialActivities;
    return [];
  });
  const [enquiries, setEnquiries] = useState<DashboardEnquiry[]>(() => {
    if (isDemoOwner) return initialDashboardEnquiries;
    return [];
  });

  // Modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState<DashboardEnquiry | null>(null);

  const todayDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  // Handle local availability toggle
  const handleToggleAvailability = () => {
    if (effectiveStatus === 'REMOVED') {
      alert('Cannot open mess: This mess listing was removed by an administrator and cannot be reactivated.');
      return;
    }
    if (effectiveStatus === 'SUSPENDED') {
      alert('Cannot open mess: This mess is currently suspended by an administrator. Please submit a suspension review request.');
      return;
    }

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

  const effectiveStatus: 'APPROVED' | 'PENDING' | 'DRAFT' | 'REJECTED' | 'SUSPENDED' | 'REMOVED' =
    layoutMessStatus
      ? (layoutMessStatus.toUpperCase() as any)
      : ownerMess?.status
      ? (ownerMess.status.toUpperCase() as any)
      : verificationStatus
      ? verificationStatus.status
      : (messStatus.toUpperCase() as any);

  const pendingSuspensionReview = suspensionReviews.find((r) => r.status === 'PENDING');
  const latestSuspensionReview = suspensionReviews.length > 0 ? suspensionReviews[0] : null;

  if (loadingMess && !ownerMess && !isDemoOwner) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Loading mess dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasMess) {
    return (
      <div className="dashboard-container">
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '2rem auto',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Store size={36} color="#10b981" />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '0.6rem',
              color: 'var(--text-primary)',
            }}
          >
            You haven't created your mess profile yet.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            Create your mess listing to manage daily menus, track student subscriptions, set operating
            timings, and start receiving verified student reviews.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/owner/profile')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.8rem 1.8rem',
              fontWeight: 700,
            }}
          >
            <Plus size={18} /> Create Mess Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Live Verification Feedback Toasts */}
      {verificationSuccessMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#065f46',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{verificationSuccessMsg}</span>
        </div>
      )}

      {verificationError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#991b1b',
            fontWeight: 700,
          }}
        >
          <AlertTriangle size={18} color="#dc2626" />
          <span>{verificationError}</span>
        </div>
      )}

      {reviewSubmitSuccess && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#065f46',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{reviewSubmitSuccess}</span>
        </div>
      )}

      {reviewSubmitError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#991b1b',
            fontWeight: 700,
          }}
        >
          <AlertTriangle size={18} color="#dc2626" />
          <span>{reviewSubmitError}</span>
        </div>
      )}

      {/* DRAFT Status Banner */}
      {effectiveStatus === 'DRAFT' && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fcd34d',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '1rem', marginBottom: '4px' }}>
                Mess Listing Status: Draft (Not yet submitted for admin verification)
              </div>
              <div style={{ color: '#b45309', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Your mess profile is currently in Draft state. Please ensure operating timings and profile details are complete before submitting for admin review.
              </div>
              {verificationStatus?.missingFields && verificationStatus.missingFields.length > 0 && (
                <div style={{ marginTop: '8px', color: '#b45309', fontSize: '0.85rem' }}>
                  <strong>Required profile fields to complete: </strong>
                  {verificationStatus.missingFields.join(', ')}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '34px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitVerification}
              disabled={isSubmittingVerification || (verificationStatus != null && !verificationStatus.canSubmit)}
              id="btn-submit-verification"
            >
              {isSubmittingVerification ? 'Submitting...' : 'Submit for Admin Verification'}
            </button>
            {verificationStatus != null && !verificationStatus.canSubmit && (
              <span style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 600 }}>
                (Please configure operating timings in Mess Profile before submitting)
              </span>
            )}
          </div>
        </div>
      )}

      {/* PENDING Status Banner */}
      {effectiveStatus === 'PENDING' && (
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

      {/* REJECTED Status Banner */}
      {effectiveStatus === 'REJECTED' && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '1rem', marginBottom: '2px' }}>
                Mess Registration Rejected by Admin
              </div>
              <div style={{ color: '#b91c1c', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Reason: {verificationStatus?.rejectionReason || currentMess?.rejectionReason || 'Application did not satisfy health & safety criteria.'}{' '}
                Please update your mess details in the Profile tab and resubmit for verification.
              </div>
              {verificationStatus?.missingFields && verificationStatus.missingFields.length > 0 && (
                <div style={{ marginTop: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>
                  <strong>Required profile fields to complete: </strong>
                  {verificationStatus.missingFields.join(', ')}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '34px' }}>
            <button
              type="button"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isSubmittingVerification ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSubmitVerification}
              disabled={isSubmittingVerification || (verificationStatus != null && !verificationStatus.canSubmit)}
              id="btn-resubmit-verification"
            >
              {isSubmittingVerification ? 'Resubmitting...' : 'Resubmit for Verification'}
            </button>
          </div>
        </div>
      )}

      {/* REMOVED Status Banner */}
      {effectiveStatus === 'REMOVED' && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <AlertCircle size={26} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '1.05rem', marginBottom: '6px' }}>
                Listing Removed by Administrator
              </div>
              <div style={{ color: '#7f1d1d', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '10px' }}>
                The mess <strong>"{currentMess?.name || verificationStatus?.messName || 'Your Mess'}"</strong> has been removed from student discovery by an administrator.
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  color: '#991b1b',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                }}
              >
                <strong>Administrator Removal Reason: </strong>
                <span>{verificationStatus?.removalReason || layoutRemovalReason || (currentMess as any)?.removalReason || 'Violation of platform policies.'}</span>
              </div>
              <div style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ Notice: You cannot reactivate or reopen this mess listing. If you believe this removal was done in error, please contact campus administration at admin@messmap.com.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUSPENDED Status Banner */}
      {effectiveStatus === 'SUSPENDED' && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <AlertTriangle size={26} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: '1.05rem', marginBottom: '4px' }}>
                Mess Listing Suspended by Administrator
              </div>
              <div style={{ color: '#b45309', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '8px' }}>
                The mess <strong>"{currentMess?.name || verificationStatus?.messName || 'Your Mess'}"</strong> is currently suspended. It has been excluded from student discovery and search results. Owners cannot reactivate suspended messes directly.
              </div>

              {pendingSuspensionReview ? (
                <div
                  style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#92400e',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    ⏳ Suspension Review Request Pending Admin Review
                  </div>
                  <div>
                    <strong>Submitted: </strong>
                    {new Date(pendingSuspensionReview.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  {pendingSuspensionReview.explanation && (
                    <div style={{ marginTop: '4px' }}>
                      <strong>Your Explanation: </strong>
                      <span>{pendingSuspensionReview.explanation}</span>
                    </div>
                  )}
                  <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#78350f' }}>
                    An administrator will evaluate your request shortly. The mess remains unavailable until approved.
                  </div>
                </div>
              ) : latestSuspensionReview && latestSuspensionReview.status === 'REJECTED' ? (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: '#991b1b',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    ❌ Previous Suspension Review Request Rejected
                  </div>
                  <div>
                    <strong>Admin Reason / Remarks: </strong>
                    <span>{latestSuspensionReview.adminNotes || 'Review request did not meet criteria to lift suspension.'}</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setIsReviewModalOpen(true)}
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    >
                      Submit Another Review Request
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsReviewModalOpen(true)}
                    id="btn-request-suspension-review"
                  >
                    Request Suspension Review
                  </button>
                </div>
              )}
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
              <ShieldCheck size={13} />{' '}
              {effectiveStatus === 'APPROVED'
                ? 'Verified Partner'
                : effectiveStatus === 'PENDING'
                ? 'Verification Pending'
                : effectiveStatus === 'DRAFT'
                ? 'Draft Listing'
                : effectiveStatus === 'REJECTED'
                ? 'Action Required'
                : effectiveStatus === 'REMOVED'
                ? 'Listing Removed'
                : 'Suspended'}
            </span>
          </div>

          <h2 className="welcome-title">Welcome back, {user.name || 'Owner'}! 👋</h2>
          <p className="welcome-subtitle">
            Overview and real-time operations for <strong>{displayMessName}</strong> today ({todayDate}).
          </p>

          <div className="welcome-status-row">
            <div className={`status-pill ${isOpenStatus && effectiveStatus === 'APPROVED' ? 'open' : 'closed'}`}>
              <span className="dot" />
              <span>
                {effectiveStatus === 'REMOVED'
                  ? 'Mess listing has been REMOVED by Administrator'
                  : effectiveStatus === 'SUSPENDED'
                  ? 'Mess is SUSPENDED by Administrator'
                  : isOpenStatus
                  ? 'Mess is OPEN for Student Discovery'
                  : 'Mess is currently CLOSED'}
              </span>
            </div>
            {effectiveStatus === 'REMOVED' ? (
              <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 700, padding: '6px 12px', background: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
                Reactivation Blocked
              </span>
            ) : effectiveStatus === 'SUSPENDED' ? (
              <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700, padding: '6px 12px', background: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
                Reactivation Blocked
              </span>
            ) : (
              <button
                type="button"
                className="btn-toggle-quick"
                onClick={handleToggleAvailability}
              >
                {isOpenStatus ? 'Switch to Closed' : 'Switch to Open'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="hero-quick-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/owner/menu', { state: { openAddModal: true } })}
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
            <span className="metric-number">
              {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ★` : '0.0 ★'}
            </span>
            {stats.totalReviews > 0 ? (
              <span className="trend-badge positive">
                <TrendingUp size={12} /> +0.2 this week
              </span>
            ) : (
              <span className="trend-badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                No reviews yet
              </span>
            )}
          </div>
          <div className="metric-footer-row">
            <span className="metric-footnote">
              {stats.totalReviews > 0
                ? `Based on ${stats.totalReviews} verified student reviews`
                : 'No student reviews published yet'}
            </span>
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
              {effectiveStatus === 'REMOVED'
                ? 'Removed'
                : effectiveStatus === 'SUSPENDED'
                ? 'Suspended'
                : isOpenStatus
                ? 'Open Today'
                : 'Closed'}
            </span>
            <span className={`badge ${isOpenStatus && effectiveStatus === 'APPROVED' ? 'badge-green' : 'badge-danger'}`}>
              {effectiveStatus === 'REMOVED'
                ? 'Inactive'
                : effectiveStatus === 'SUSPENDED'
                ? 'Blocked'
                : isOpenStatus
                ? 'Serving'
                : 'Off-duty'}
            </span>
          </div>
          <div className="metric-footer-row">
            <span className="metric-footnote">
              {isOpenStatus && effectiveStatus === 'APPROVED'
                ? 'Visible on student map discovery'
                : 'Hidden from active nearby search'}
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
            {activities.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No recent activities recorded yet. Updates to your menu, operating status, or profile will appear here.
                </p>
              </div>
            ) : (
              activities.map((act) => (
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
              ))
            )}
          </div>
        </section>

        {/* Right Column: Quick Mess Profile & Plan Highlights */}
        <div className="dashboard-side-stack">
          {/* Quick Profile Summary Card */}
          <section className="card mess-overview-card">
            <div className="mess-overview-header">
              <div className="mess-name-group">
                <h4 className="mess-name-heading">{displayMessName}</h4>
                <p className="mess-loc-sub">{displayAddress}</p>
              </div>
              <span className={`badge ${effectiveStatus === 'APPROVED' ? 'badge-green' : effectiveStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                {effectiveStatus === 'APPROVED' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {effectiveStatus === 'APPROVED' ? 'Verified' : effectiveStatus === 'PENDING' ? 'Pending' : effectiveStatus}
              </span>
            </div>

            <div className="mess-stats-mini-grid">
              <div className="mini-stat-box">
                <span className="stat-label">Active Diners</span>
                <span className="stat-num">{stats.activeDiners}</span>
              </div>
              <div className="mini-stat-box">
                <span className="stat-label">Monthly Rate</span>
                <span className="stat-num">{displayMonthlyPrice}</span>
              </div>
              <div className="mini-stat-box">
                <span className="stat-label">Food Type</span>
                <span className="stat-num">{displayFoodType}</span>
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
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
                    No student enquiries received yet. Direct enquiries will appear here when students contact your mess.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
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
                          )},%20this%20is%20${encodeURIComponent(displayMessName)}%20regarding%20your%20inquiry:`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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
                  )},%20this%20is%20${encodeURIComponent(displayMessName)}%20regarding%20your%20inquiry:`}
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

      {/* Suspension Review Request Modal */}
      {isReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '540px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Request Suspension Review
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Submit an explanation for campus administrators to review and consider restoring listing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSuspensionReview}>
              <div style={{ padding: '1.5rem' }}>
                {reviewSubmitError && (
                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      color: '#991b1b',
                      fontSize: '0.85rem',
                      marginBottom: '12px',
                    }}
                  >
                    {reviewSubmitError}
                  </div>
                )}

                <label
                  htmlFor="reviewExplanation"
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--text-main)',
                  }}
                >
                  Explanation & Corrective Actions:
                </label>
                <textarea
                  id="reviewExplanation"
                  rows={4}
                  value={reviewExplanation}
                  onChange={(e) => setReviewExplanation(e.target.value)}
                  placeholder="Explain improvements made regarding hygiene, timing compliance, or licensing..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  This request will be routed directly to the administrator's review queue.
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: '#f8fafc',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsReviewModalOpen(false)}
                  disabled={isSubmittingReview}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingReview}
                  id="btn-submit-suspension-review"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
