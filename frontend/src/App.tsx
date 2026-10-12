import React, { useState, useEffect } from 'react';
import { AdminLayout } from './modules/admin/layouts/AdminLayout';
import { AdminTab } from './modules/admin/layouts/AdminSidebar';
import { AdminDashboard } from './modules/admin/pages/AdminDashboard';
import { MessManagement } from './modules/admin/pages/MessManagement';
import { UserManagement } from './modules/admin/pages/UserManagement';
import { ReviewsComplaints } from './modules/admin/pages/ReviewsComplaints';
import { ReportsAnalytics } from './modules/admin/pages/ReportsAnalytics';
import { AdminSettings } from './modules/admin/pages/AdminSettings';

import { MessDetailModal } from './modules/admin/components/MessDetailModal';
import { UserDetailModal } from './modules/admin/components/UserDetailModal';
import { ComplaintDetailModal } from './modules/admin/components/ComplaintDetailModal';

import {
  initialMesses,
  initialUsers,
  initialReviews,
  initialComplaints,
  initialActivities,
  initialStats,
  initialAdminProfile,
} from './modules/admin/data/mockData';
import {
  Mess,
  User,
  Review,
  Complaint,
  ActivityItem,
  DashboardStats,
  AdminProfile,
  ComplaintStatus,
  ReviewStatus,
} from './modules/admin/types/admin.types';
import { ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  // Navigation tab state with hash sync
  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    const hash = window.location.hash.replace('#', '') as AdminTab;
    const validTabs: AdminTab[] = ['dashboard', 'messes', 'users', 'reviews', 'reports', 'settings'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Primary dataset states
  const [messes, setMesses] = useState<Mess[]>(initialMesses);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(initialAdminProfile);

  // Modals state
  const [activeMessModal, setActiveMessModal] = useState<Mess | null>(null);
  const [activeUserModal, setActiveUserModal] = useState<User | null>(null);
  const [activeComplaintModal, setActiveComplaintModal] = useState<Complaint | null>(null);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync hash on navigation
  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    setSearchTerm('');
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AdminTab;
      const validTabs: AdminTab[] = ['dashboard', 'messes', 'users', 'reviews', 'reports', 'settings'];
      if (validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Computed counts for stats & badges
  const pendingMesses = messes.filter((m) => m.status === 'Pending');
  const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Dismissed');

  const dynamicStats: DashboardStats = {
    ...initialStats,
    totalMesses: messes.length,
    pendingApprovals: pendingMesses.length,
    totalUsers: users.length,
    totalReviews: reviews.length,
    openComplaints: openComplaints.length,
  };

  // --- ACTIONS & MUTATIONS ---

  const handleApproveMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    setMesses((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Approved', operatingStatus: 'Open' } : m))
    );

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_approved',
      title: 'Mess Approved',
      description: `${target.name} verified and approved for live student discovery.`,
      timestamp: 'Just now',
      badgeVariant: 'success',
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`"${target.name}" has been approved successfully!`, 'success');
  };

  const handleRejectMess = (id: string, reason?: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    setMesses((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'Rejected',
              operatingStatus: 'Closed',
              rejectionReason: reason || 'Application did not meet sanitary or licensing criteria.',
            }
          : m
      )
    );

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_rejected',
      title: 'Mess Application Rejected',
      description: `${target.name} registration rejected: ${reason || 'Safety criteria not met'}`,
      timestamp: 'Just now',
      badgeVariant: 'danger',
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`"${target.name}" application rejected.`, 'error');
  };

  const handleSuspendMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    setMesses((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Under Review', operatingStatus: 'Closed' } : m))
    );

    showToast(`"${target.name}" listing placed under review.`, 'info');
  };

  const handleAddNewMess = (newMess: Mess) => {
    setMesses((prev) => [newMess, ...prev]);
    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_registered',
      title: 'New Mess Registered',
      description: `${newMess.name} submitted registration papers for review.`,
      timestamp: 'Just now',
      badgeVariant: 'warning',
    };
    setActivities((prev) => [newActivity, ...prev]);
    showToast(`New mess submission "${newMess.name}" queued for verification.`, 'info');
  };

  const handleToggleUserStatus = (userId: string, reason?: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const nextStatus = target.status === 'Active' ? 'Suspended' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'user_flagged',
      title: nextStatus === 'Suspended' ? 'User Suspended' : 'User Reactivated',
      description: `${target.name} status updated to ${nextStatus}.${reason ? ` Reason: ${reason}` : ''}`,
      timestamp: 'Just now',
      badgeVariant: nextStatus === 'Suspended' ? 'danger' : 'success',
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(
      `User ${target.name} has been ${nextStatus === 'Suspended' ? 'suspended' : 'reactivated'}.`,
      nextStatus === 'Suspended' ? 'error' : 'success'
    );
  };

  const handleAddNewUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    showToast(`New student account for ${newUser.name} registered.`, 'success');
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

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'complaint_resolved',
      title: `Grievance ${newStatus}`,
      description: `Ticket ${target.ticketNumber} for ${target.messName} marked as ${newStatus}.`,
      timestamp: 'Just now',
      badgeVariant: newStatus === 'Resolved' ? 'success' : 'info',
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`Ticket ${target.ticketNumber} marked as ${newStatus}.`, 'success');
  };

  const handleModerateReview = (id: string, newStatus: ReviewStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Review has been marked as ${newStatus}.`, newStatus === 'Removed' ? 'error' : 'success');
  };

  const handleExportReport = (format: 'csv' | 'pdf') => {
    // Realistic simulated export download
    const filename = `MessMap_Campus_Report_${new Date().toISOString().split('T')[0]}.${format}`;
    const dummyContent = format === 'csv'
      ? 'ID,Name,Area,MonthlyPrice,Rating,HygieneScore,Status\n' +
        messes.map((m) => `"${m.id}","${m.name}","${m.area}",${m.monthlyPrice},${m.rating},${m.hygieneScore},"${m.status}"`).join('\n')
      : 'MessMap Campus Food Services Comprehensive Audit Report\nGenerated: ' + new Date().toLocaleString();

    const blob = new Blob([dummyContent], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Export complete! Downloaded ${filename}`, 'success');
  };

  const handleUpdateProfile = (updated: Partial<AdminProfile>) => {
    setAdminProfile((prev) => ({ ...prev, ...updated }));
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      adminProfile={adminProfile}
      pendingApprovalsCount={pendingMesses.length}
      openComplaintsCount={openComplaints.length}
      toasts={toasts}
      onDismissToast={dismissToast}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {currentTab === 'dashboard' && (
        <AdminDashboard
          stats={dynamicStats}
          activities={activities}
          pendingMesses={pendingMesses}
          onNavigate={handleSelectTab}
          onOpenMessDetail={(mess) => setActiveMessModal(mess)}
          onQuickApproveMess={handleApproveMess}
        />
      )}

      {currentTab === 'messes' && (
        <MessManagement
          messes={messes}
          onSelectMess={(mess) => setActiveMessModal(mess)}
          onApproveMess={handleApproveMess}
          onRejectMess={handleRejectMess}
          onAddNewMess={handleAddNewMess}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {currentTab === 'users' && (
        <UserManagement
          users={users}
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
        onReject={(id) => handleRejectMess(id, 'Admin manual rejection during dossier review.')}
        onSuspend={handleSuspendMess}
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

export default App;
