import React, { useState } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminProfile } from '../types/admin.types';
import { ToastContainer, ToastMessage } from '../../../components/ui/Toast';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminProfile: AdminProfile;
  pendingApprovalsCount: number;
  openComplaintsCount: number;
  children: React.ReactNode;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  adminProfile,
  pendingApprovalsCount,
  openComplaintsCount,
  children,
  toasts,
  onDismissToast,
  searchTerm,
  onSearchChange,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingMessesCount={pendingApprovalsCount}
        openComplaintsCount={openComplaintsCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminHeader
          currentTab={currentTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          adminProfile={adminProfile}
          pendingApprovalsCount={pendingApprovalsCount}
          openComplaintsCount={openComplaintsCount}
          onSelectTab={onSelectTab}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />

        <main className="admin-content">
          {children}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
};
