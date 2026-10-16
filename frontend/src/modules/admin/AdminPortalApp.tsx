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
    unsuspendMess,
    deleteMess,
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
    showToast(`"${target.name}" listing has been suspended.`, 'error');
  };

  const handleUnsuspendMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    unsuspendMess(id);
    showToast(`"${target.name}" unsuspended and reactivated!`, 'success');
  };

  const handleDeleteMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    deleteMess(id);
    showToast(`"${target.name}" removed from the mess directory.`, 'info');
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
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `MessMap_Campus_Report_${dateStr}.${format}`;

    if (format === 'csv') {
      const csvContent =
        'ID,Name,Area,MonthlyPrice,Rating,HygieneScore,Status\n' +
        messes
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

    // PDF Format: Generate an official formatted printable document and open Print-to-PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented opening the PDF window. Please allow popups.', 'error');
      return;
    }

    const tableRows = messes
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
            .metrics-box { display: flex; gap: 16px; margin-bottom: 24px; }
            .metric-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
            .metric-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #f1f5f9; padding: 10px 8px; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .print-btn { background: #059669; color: white; padding: 10px 20px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
            <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Report</button>
            <button style="padding: 10px 16px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;" onclick="window.close()">Close</button>
          </div>
          <div class="header-bar">
            <div>
              <h1 class="badge-title">🍲 MessMap Campus Food Services Audit</h1>
              <div class="subtitle">Official Verification & Health Compliance Directory • Pune Campus Zone</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <div><strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Auditor:</strong> Campus Health & Administration</div>
            </div>
          </div>
          <div class="metrics-box">
            <div class="metric-card">
              <div style="font-size: 12px; color: #64748b; font-weight: 600;">Total Mess Listings</div>
              <div class="metric-val">${messes.length} Facilities</div>
            </div>
            <div class="metric-card">
              <div style="font-size: 12px; color: #64748b; font-weight: 600;">Active / Approved</div>
              <div class="metric-val" style="color: #059669;">${messes.filter((m) => m.status === 'Approved').length}</div>
            </div>
            <div class="metric-card">
              <div style="font-size: 12px; color: #64748b; font-weight: 600;">Suspended / Review</div>
              <div class="metric-val" style="color: #dc2626;">${messes.filter((m) => m.status === 'Suspended' || m.status === 'Under Review').length}</div>
            </div>
            <div class="metric-card">
              <div style="font-size: 12px; color: #64748b; font-weight: 600;">Campus Hygiene Average</div>
              <div class="metric-val" style="color: #2563eb;">4.6 / 5.0</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mess Facility</th>
                <th>Proprietor & Phone</th>
                <th>Campus Zone</th>
                <th>Food Type</th>
                <th>Monthly Rate</th>
                <th>Rating</th>
                <th>Hygiene</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
            <div>MessMap University Student Dining Portal</div>
            <div>Authorized University Food & Safety Audit Record</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Audit Report generated! You can now print or save as PDF.', 'success');
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
