import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminTab } from './layouts/AdminSidebar';
import { AdminDashboard } from './pages/AdminDashboard';
import { MessManagement } from './pages/MessManagement';
import { UserManagement } from './pages/UserManagement';
import { ReviewsComplaints } from './pages/ReviewsComplaints';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { AdminSettings } from './pages/AdminSettings';

import { MessDetailModal } from './components/MessDetailModal';
import { UserDetailModal } from './components/UserDetailModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';

import {
  initialUsers,
  initialReviews,
  initialComplaints,
  initialStats,
  initialAdminProfile,
} from './data/mockData';
import {
  Mess,
  User,
  Review,
  Complaint,
  DashboardStats,
  AdminProfile,
  ComplaintStatus,
  ReviewStatus,
} from './types/admin.types';
import { ToastMessage } from '../../components/ui/Toast';
import { useMessData } from '../../context/MessDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminMetricsApi,
  getAdminMessesApi,
  approveMessApi,
  rejectMessApi,
  suspendMessApi,
  unsuspendMessApi,
  getAdminUsersApi,
  updateUserStatusApi,
  UnauthorizedError,
  ForbiddenError,
  AdminMess,
  AdminUser,
} from '../../api/adminApi';

/**
 * Maps backend AdminMess entity to frontend UI Mess structure.
 */
function mapAdminMessToUiMess(adminMess: AdminMess): Mess {
  let foodType: 'Pure Veg' | 'Veg & Non-Veg' | 'Jain Friendly' = 'Pure Veg';
  if (adminMess.foodType === 'VEG_NON_VEG') foodType = 'Veg & Non-Veg';
  else if (adminMess.foodType === 'JAIN') foodType = 'Jain Friendly';

  let status: 'Approved' | 'Pending' | 'Rejected' | 'Suspended' = 'Pending';
  if (adminMess.status === 'APPROVED') status = 'Approved';
  else if (adminMess.status === 'REJECTED') status = 'Rejected';
  else if (adminMess.status === 'SUSPENDED') status = 'Suspended';

  return {
    id: `MESS-${adminMess.id}`,
    name: adminMess.name,
    ownerName: adminMess.ownerName || 'Verified Mess Owner',
    ownerPhone: adminMess.ownerPhone || adminMess.phone || '+91 98220 12345',
    ownerEmail: adminMess.ownerEmail || adminMess.email || 'owner@messmap.com',
    address: adminMess.address || 'Campus Lane, University Zone',
    area: adminMess.area || adminMess.city || 'Campus Area',
    foodType,
    monthlyPrice: adminMess.monthlyPrice ? Number(adminMess.monthlyPrice) : 3200,
    dailyPrice: adminMess.dailyPrice ? Number(adminMess.dailyPrice) : 110,
    rating: 4.5,
    reviewCount: 0,
    status,
    operatingStatus: adminMess.operatingStatus === 'CLOSED' ? 'Closed' : 'Open',
    timings: {
      breakfast: adminMess.openingTime ? `${adminMess.openingTime} - 09:30 AM` : '07:30 - 09:30 AM',
      lunch: '12:00 - 02:30 PM',
      dinner: adminMess.closingTime ? `07:30 - ${adminMess.closingTime}` : '07:30 - 10:00 PM',
    },
    menuHighlights: ['Dal Fry', 'Fresh Rotis', 'Jeera Rice', 'Seasonal Sabzi'],
    hygieneScore: 4.8,
    registeredDate: adminMess.createdAt ? adminMess.createdAt.split('T')[0] : '2026-10-15',
    description: adminMess.description || 'Verified student mess facility near college campus.',
    features: ['RO Purified Water', 'WiFi', 'CCTV Security'],
    capacity: adminMess.capacity || 60,
    rejectionReason: adminMess.rejectionReason,
  };
}

/**
 * Maps backend AdminUser entity to frontend UI User structure.
 */
function mapAdminUserToUiUser(adminUser: AdminUser): User {
  let role: 'Student' | 'Mess Owner' | 'Admin' = 'Student';
  if (adminUser.role === 'ROLE_ADMIN') role = 'Admin';
  else if (adminUser.role === 'ROLE_MESS_OWNER') role = 'Mess Owner';

  let status: 'Active' | 'Suspended' | 'Pending Verification' = 'Active';
  if (adminUser.status === 'SUSPENDED') status = 'Suspended';
  else if (adminUser.status === 'PENDING_VERIFICATION') status = 'Pending Verification';

  return {
    id: `USR-${adminUser.id}`,
    name: adminUser.name,
    email: adminUser.email,
    phone: adminUser.phone || 'N/A',
    role,
    status,
    college: adminUser.college || 'Pune University Campus',
    registeredDate: adminUser.createdAt ? adminUser.createdAt.split('T')[0] : '2026-10-15',
    lastActive: 'Active today',
    reviewsCount: 0,
    complaintsCount: 0,
    avatar: adminUser.avatarUrl || (adminUser.role === 'ROLE_ADMIN' ? 'AD' : adminUser.role === 'ROLE_MESS_OWNER' ? 'OW' : 'ST'),
  };
}

export const AdminPortalApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    messes: localMesses,
    pendingMesses: localPendingMesses,
    activities,
    approveMess: localApproveMess,
    rejectMess: localRejectMess,
    suspendMess: localSuspendMess,
    unsuspendMess: localUnsuspendMess,
    deleteMess: localDeleteMess,
    registerMess: localRegisterMess,
  } = useMessData();

  // Navigation tab state with hash sync
  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    const hash = window.location.hash.replace('#', '') as AdminTab;
    const validTabs: AdminTab[] = ['dashboard', 'messes', 'users', 'reviews', 'reports', 'settings'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Live Backend Data States
  const [liveMesses, setLiveMesses] = useState<Mess[]>([]);
  const [liveUsers, setLiveUsers] = useState<User[]>([]);
  const [backendStats, setBackendStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Fallback Datasets
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(initialAdminProfile);

  // Modals state
  const [activeMessModal, setActiveMessModal] = useState<Mess | null>(null);
  const [activeUserModal, setActiveUserModal] = useState<User | null>(null);
  const [activeComplaintModal, setActiveComplaintModal] = useState<Complaint | null>(null);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Centralized API error dispatcher handling 401 session expiration vs 403 permission rejections.
   */
  const handleApiError = useCallback((err: any, fallbackMessage: string) => {
    if (err instanceof UnauthorizedError || err?.name === 'UnauthorizedError' || err?.message?.includes('401')) {
      showToast('Administrative session has expired. Redirecting to login...', 'error');
      logout();
      navigate('/admin/login', { replace: true });
      return;
    }
    if (err instanceof ForbiddenError || err?.name === 'ForbiddenError' || err?.message?.includes('403')) {
      showToast(err.message || 'Access denied: You lack administrative authority for this action.', 'error');
      return;
    }
    showToast(err.message || fallbackMessage, 'error');
  }, [logout, navigate, showToast]);

  /**
   * Fetch live data from Spring Boot backend endpoints.
   */
  const fetchLiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsRes, messesRes, usersRes] = await Promise.all([
        getAdminMetricsApi(user.token),
        getAdminMessesApi(undefined, user.token),
        getAdminUsersApi({ page: 0, size: 50 }, user.token),
      ]);

      if (metricsRes.success && messesRes.success && usersRes.success) {
        const mappedMesses = messesRes.data.map(mapAdminMessToUiMess);
        const mappedUsers = usersRes.data.content.map(mapAdminUserToUiUser);

        setLiveMesses(mappedMesses);
        setLiveUsers(mappedUsers);

        const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Dismissed');
        setBackendStats({
          ...initialStats,
          totalMesses: metricsRes.data.totalMesses,
          pendingApprovals: metricsRes.data.pendingVerification,
          totalUsers: metricsRes.data.totalUsers,
          totalReviews: reviews.length,
          openComplaints: openComplaints.length,
        });

        setIsLiveConnected(true);
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedError || err?.name === 'UnauthorizedError' || err?.message?.includes('401')) {
        handleApiError(err, 'Session invalid');
        return;
      }
      if (err instanceof ForbiddenError || err?.name === 'ForbiddenError' || err?.message?.includes('403')) {
        handleApiError(err, 'Forbidden access');
        return;
      }
      // If network fails (e.g. backend temporarily offline), fall back to initial mock datasets
      console.warn('Backend API connection failed, falling back to local dataset:', err);
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user.token, complaints, reviews.length, handleApiError]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Tab navigation with hash sync
  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    setSearchTerm('');
    if (window.location.hash.replace('#', '') !== tab) {
      window.history.replaceState(null, '', `#${tab}`);
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AdminTab;
      const validTabs: AdminTab[] = ['dashboard', 'messes', 'users', 'reviews', 'reports', 'settings'];
      if (validTabs.includes(hash)) {
        setCurrentTab((prev) => (prev === hash ? prev : hash));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Compute active datasets (live backend if connected, else local state)
  const currentMesses = isLiveConnected ? liveMesses : localMesses;
  const currentPendingMesses = useMemo(() => {
    return currentMesses.filter((m) => m.status === 'Pending');
  }, [currentMesses]);
  const currentUsers = isLiveConnected ? liveUsers : users;

  const dynamicStats: DashboardStats = useMemo(() => {
    if (isLiveConnected && backendStats) {
      return backendStats;
    }
    const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Dismissed');
    return {
      ...initialStats,
      totalMesses: currentMesses.length,
      pendingApprovals: currentPendingMesses.length,
      totalUsers: currentUsers.length,
      totalReviews: reviews.length,
      openComplaints: openComplaints.length,
    };
  }, [isLiveConnected, backendStats, currentMesses.length, currentPendingMesses.length, currentUsers.length, reviews.length, complaints]);

  // --- ACTIONS & MUTATIONS ---

  const handleApproveMess = async (id: string) => {
    const target = currentMesses.find((m) => m.id === id);
    const messName = target ? target.name : 'Mess';

    if (isLiveConnected) {
      try {
        const numericId = id.replace(/\D/g, '') || id;
        const res = await approveMessApi(numericId, user.token);
        if (res.success) {
          showToast(`"${res.data.name || messName}" approved! It is now live in Student Search.`, 'success');
          await fetchLiveData();
          return;
        }
      } catch (err: any) {
        handleApiError(err, `Failed to approve "${messName}".`);
        return;
      }
    }

    localApproveMess(id);
    showToast(`"${messName}" approved! (Local update)`, 'success');
  };

  const handleRejectMess = async (id: string, reason?: string) => {
    const target = currentMesses.find((m) => m.id === id);
    const messName = target ? target.name : 'Mess';
    const rejectionReason = reason?.trim() || 'Application did not meet campus health and safety compliance standards.';

    if (isLiveConnected) {
      try {
        const numericId = id.replace(/\D/g, '') || id;
        const res = await rejectMessApi(numericId, rejectionReason, user.token);
        if (res.success) {
          showToast(`"${res.data.name || messName}" registration application rejected.`, 'error');
          await fetchLiveData();
          return;
        }
      } catch (err: any) {
        handleApiError(err, `Failed to reject "${messName}".`);
        return;
      }
    }

    localRejectMess(id, reason);
    showToast(`"${messName}" registration application rejected. (Local update)`, 'error');
  };

  const handleSuspendMess = async (id: string) => {
    const target = currentMesses.find((m) => m.id === id);
    const messName = target ? target.name : 'Mess';

    if (isLiveConnected) {
      try {
        const numericId = id.replace(/\D/g, '') || id;
        const res = await suspendMessApi(numericId, 'Administrative compliance suspension', user.token);
        if (res.success) {
          showToast(`"${res.data.name || messName}" listing has been suspended.`, 'error');
          await fetchLiveData();
          return;
        }
      } catch (err: any) {
        handleApiError(err, `Failed to suspend "${messName}".`);
        return;
      }
    }

    localSuspendMess(id);
    showToast(`"${messName}" listing has been suspended. (Local update)`, 'error');
  };

  const handleUnsuspendMess = async (id: string) => {
    const target = currentMesses.find((m) => m.id === id);
    const messName = target ? target.name : 'Mess';

    if (isLiveConnected) {
      try {
        const numericId = id.replace(/\D/g, '') || id;
        const res = await unsuspendMessApi(numericId, user.token);
        if (res.success) {
          showToast(`"${res.data.name || messName}" unsuspended and reactivated!`, 'success');
          await fetchLiveData();
          return;
        }
      } catch (err: any) {
        handleApiError(err, `Failed to unsuspend "${messName}".`);
        return;
      }
    }

    localUnsuspendMess(id);
    showToast(`"${messName}" unsuspended and reactivated! (Local update)`, 'success');
  };

  const handleDeleteMess = (id: string) => {
    const target = currentMesses.find((m) => m.id === id);
    if (!target) return;
    localDeleteMess(id);
    showToast(`"${target.name}" removed from directory.`, 'info');
  };

  const handleAddNewMess = (newMess: Mess) => {
    localRegisterMess(newMess);
    showToast(`New mess submission "${newMess.name}" queued for verification.`, 'info');
  };

  const handleToggleUserStatus = async (userId: string, reason?: string) => {
    const target = currentUsers.find((u) => u.id === userId);
    if (!target) return;

    if (isLiveConnected) {
      try {
        const numericId = userId.replace(/\D/g, '') || userId;
        const nextBackendStatus = target.status === 'Active' ? 'SUSPENDED' : 'ACTIVE';
        const res = await updateUserStatusApi(numericId, nextBackendStatus, reason, user.token);
        if (res.success) {
          const statusText = res.data.status === 'ACTIVE' ? 'reactivated' : 'suspended';
          showToast(`User ${target.name} has been ${statusText}.`, res.data.status === 'ACTIVE' ? 'success' : 'error');
          await fetchLiveData();
          return;
        }
      } catch (err: any) {
        handleApiError(err, `Failed to update status for ${target.name}.`);
        return;
      }
    }

    // Local state fallback
    const nextStatus = target.status === 'Active' ? 'Suspended' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    showToast(
      `User ${target.name} has been ${nextStatus === 'Suspended' ? 'suspended' : 'reactivated'}. (Local update)`,
      nextStatus === 'Suspended' ? 'error' : 'success'
    );
  };

  const handleAddNewUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    showToast(`New account for ${newUser.name} registered.`, 'success');
  };

  const handleUpdateComplaintStatus = (id: string, newStatus: ComplaintStatus, notes?: string) => {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              adminNotes: notes || c.adminNotes,
              resolvedDate: newStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : c.resolvedDate,
            }
          : c
      )
    );

    showToast(`Ticket ${target.ticketNumber} marked as ${newStatus}.`, 'success');
  };

  const handleModerateReview = (id: string, newStatus: ReviewStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Review has been marked as ${newStatus}.`, newStatus === 'Removed' ? 'error' : 'success');
  };

  const handleExportReport = (format: 'csv' | 'pdf') => {
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `MessMap_Campus_Report_${dateStr}.${format}`;

    if (format === 'csv') {
      const csvContent =
        'ID,Name,Area,MonthlyPrice,Rating,HygieneScore,Status\n' +
        currentMesses
          .map(
            (m) =>
              `"${m.id}","${m.name}","${m.area}",${m.monthlyPrice},${m.rating},${m.hygieneScore},"${m.status}"`
          )
          .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Export complete! Downloaded ${filename}`, 'success');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented opening the PDF window. Please allow popups.', 'error');
      return;
    }

    const tableRows = currentMesses
      .map(
        (m, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <td style="padding: 10px 8px;">${idx + 1}</td>
          <td style="padding: 10px 8px; font-weight: bold; color: #0f172a;">${m.name}</td>
          <td style="padding: 10px 8px;">${m.ownerName} (${m.ownerPhone})</td>
          <td style="padding: 10px 8px;">${m.area}</td>
          <td style="padding: 10px 8px;">${m.foodType}</td>
          <td style="padding: 10px 8px; font-weight: bold;">₹${m.monthlyPrice}/mo</td>
          <td style="padding: 10px 8px;">★ ${m.rating}</td>
          <td style="padding: 10px 8px; color: #059669; font-weight: bold;">${m.hygieneScore} / 5.0</td>
          <td style="padding: 10px 8px;">
            <span style="background: ${
              m.status === 'Approved' ? '#dcfce7' : m.status === 'Suspended' ? '#fee2e2' : '#fef3c7'
            }; color: ${
              m.status === 'Approved' ? '#166534' : m.status === 'Suspended' ? '#991b1b' : '#92400e'
            }; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">
              ${m.status}
            </span>
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MessMap Campus Dining Audit Report - ${dateStr}</title>
          <style>
            @media print {
              body { margin: 1cm; font-size: 12pt; }
              .no-print { display: none !important; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; }
            .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
            .badge-title { font-size: 24px; font-weight: 800; color: #059669; margin: 0; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #f1f5f9; padding: 10px 8px; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 class="badge-title">MessMap Central Administration</h1>
              <div class="subtitle">Campus Dining Verification and Regulatory Audit • ${dateStr}</div>
            </div>
            <div style="text-align: right; font-size: 13px; color: #64748b;">
              Total Messes: <strong>${currentMesses.length}</strong> | Pending: <strong>${currentPendingMesses.length}</strong>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mess Name</th>
                <th>Owner & Contact</th>
                <th>Campus Locality</th>
                <th>Food Cuisine</th>
                <th>Monthly Rate</th>
                <th>Student Rating</th>
                <th>Hygiene Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Audit Report generated successfully.', 'success');
  };

  const handleUpdateProfile = (updated: Partial<AdminProfile>) => {
    setAdminProfile((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      adminProfile={adminProfile}
      pendingApprovalsCount={currentPendingMesses.length}
      openComplaintsCount={dynamicStats.openComplaints}
      toasts={toasts}
      onDismissToast={dismissToast}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* Live Connection and Loading Feedback Banner */}
      {isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            marginBottom: '1.25rem',
            backgroundColor: '#064e3b',
            color: '#a7f3d0',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid #a7f3d0',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Synchronizing campus metrics and directories with Spring Boot backend...</span>
        </div>
      )}

      {currentTab === 'dashboard' && (
        <AdminDashboard
          stats={dynamicStats}
          activities={activities}
          pendingMesses={currentPendingMesses}
          onNavigate={handleSelectTab}
          onOpenMessDetail={(mess) => setActiveMessModal(mess)}
          onQuickApproveMess={handleApproveMess}
        />
      )}

      {currentTab === 'messes' && (
        <MessManagement
          messes={currentMesses}
          onSelectMess={(mess) => setActiveMessModal(mess)}
          onApproveMess={handleApproveMess}
          onRejectMess={handleRejectMess}
          onSuspendMess={handleSuspendMess}
          onUnsuspendMess={handleUnsuspendMess}
          onDeleteMess={handleDeleteMess}
          onAddNewMess={handleAddNewMess}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {currentTab === 'users' && (
        <UserManagement
          users={currentUsers}
          onSelectUser={(user) => setActiveUserModal(user)}
          onToggleUserStatus={handleToggleUserStatus}
          onAddNewUser={handleAddNewUser}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {currentTab === 'reviews' && (
        <ReviewsComplaints
          complaints={complaints}
          reviews={reviews}
          onOpenComplaint={(comp) => setActiveComplaintModal(comp)}
          onUpdateComplaintStatus={handleUpdateComplaintStatus}
          onModerateReview={handleModerateReview}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {currentTab === 'reports' && (
        <ReportsAnalytics onExportReport={handleExportReport} />
      )}

      {currentTab === 'settings' && (
        <AdminSettings
          adminProfile={adminProfile}
          onUpdateProfile={handleUpdateProfile}
          onShowToast={showToast}
        />
      )}

      {/* Global Modals */}
      <MessDetailModal
        mess={activeMessModal}
        isOpen={activeMessModal !== null}
        onClose={() => setActiveMessModal(null)}
        onApprove={handleApproveMess}
        onReject={(id) => handleRejectMess(id, 'Application did not meet health and safety compliance criteria.')}
        onSuspend={handleSuspendMess}
        onUnsuspend={handleUnsuspendMess}
        onDelete={handleDeleteMess}
      />

      <UserDetailModal
        user={activeUserModal}
        isOpen={activeUserModal !== null}
        onClose={() => setActiveUserModal(null)}
        onToggleStatus={handleToggleUserStatus}
      />

      <ComplaintDetailModal
        complaint={activeComplaintModal}
        isOpen={activeComplaintModal !== null}
        onClose={() => setActiveComplaintModal(null)}
        onUpdateStatus={handleUpdateComplaintStatus}
      />
    </AdminLayout>
  );
};
