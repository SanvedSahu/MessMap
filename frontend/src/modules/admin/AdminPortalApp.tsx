import React, { useState, useEffect, useMemo } from 'react';
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
  ActivityItem,
  DashboardStats,
  AdminProfile,
  ComplaintStatus,
  ReviewStatus,
} from './types/admin.types';
import { ToastMessage } from '../../components/ui/Toast';
import { useMessData } from '../../context/MessDataContext';
import { useAuth } from '../../context/AuthContext';

export const AdminPortalApp: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    messes,
    pendingMesses,
    activities,
    approveMess,
    rejectMess,
    suspendMess,
    registerMess,
  } = useMessData();

  // Navigation tab state with hash sync
  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    const hash = window.location.hash.replace('#', '') as AdminTab;
    const validTabs: AdminTab[] = ['dashboard', 'messes', 'users', 'reviews', 'reports', 'settings'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Datasets
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

  // Snappy tab navigation without smooth-scroll lag or hash duplicate re-renders
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

  const dynamicStats: DashboardStats = useMemo(() => {
    const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Dismissed');
    return {
      ...initialStats,
      totalMesses: messes.length,
      pendingApprovals: pendingMesses.length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      openComplaints: openComplaints.length,
    };
  }, [messes, pendingMesses, users, reviews, complaints]);

  // --- ACTIONS & MUTATIONS ---

  const handleApproveMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    approveMess(id);
    showToast(`"${target.name}" approved! It is now live in Student Search.`, 'success');
  };

  const handleRejectMess = (id: string, reason?: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    rejectMess(id, reason);
    showToast(`"${target.name}" registration application rejected.`, 'error');
  };

  const handleSuspendMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    suspendMess(id);
    showToast(`"${target.name}" listing placed under review.`, 'info');
  };

  const handleAddNewMess = (newMess: Mess) => {
    registerMess(newMess);
    showToast(`New mess submission "${newMess.name}" queued for verification.`, 'info');
  };

  const handleToggleUserStatus = (userId: string, reason?: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const nextStatus = target.status === 'Active' ? 'Suspended' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );

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

    showToast(`Ticket ${target.ticketNumber} marked as ${newStatus}.`, 'success');
  };

  const handleModerateReview = (id: string, newStatus: ReviewStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Review has been marked as ${newStatus}.`, newStatus === 'Removed' ? 'error' : 'success');
  };

  const handleExportReport = (format: 'csv' | 'pdf') => {
    const filename = `MessMap_Campus_Report_${new Date().toISOString().split('T')[0]}.${format}`;
    const dummyContent =
      format === 'csv'
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
      openComplaintsCount={dynamicStats.openComplaints}
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
        onReject={(id) => handleRejectMess(id, 'Application did not meet health and safety compliance criteria.')}
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
