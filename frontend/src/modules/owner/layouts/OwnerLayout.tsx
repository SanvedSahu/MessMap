import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { getOwnerMessApi, updateOwnerMessProfileApi } from '../../../api/ownerApi';
import './OwnerLayout.css';

export const OwnerLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isOpenStatus, setIsOpenStatus] = useState<boolean>(true);
  const [messStatus, setMessStatus] = useState<string>('APPROVED');
  const [removalReason, setRemovalReason] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getOwnerMessApi(token)
        .then((res) => {
          if (res?.data) {
            if (res.data.operatingStatus) {
              setIsOpenStatus(res.data.operatingStatus === 'OPEN');
            }
            if (res.data.status) {
              setMessStatus(res.data.status);
            }
            if (res.data.removalReason) {
              setRemovalReason(res.data.removalReason);
            }
          }
        })
        .catch((err) => {
          console.warn('Backend operating status fetch note:', err.message);
        });
    }
  }, []);

  const toggleOpenStatus = async () => {
    const nextStatus = !isOpenStatus;

    if (nextStatus && (messStatus === 'SUSPENDED' || messStatus === 'REMOVED')) {
      const msg = messStatus === 'REMOVED'
        ? 'Cannot open mess: This listing was removed by an administrator and cannot be reactivated.'
        : 'Cannot open mess: This listing is currently suspended by an administrator. Please submit a suspension review request.';
      alert(msg);
      return;
    }

    setIsOpenStatus(nextStatus);
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      try {
        await updateOwnerMessProfileApi(token, {
          operatingStatus: nextStatus ? 'OPEN' : 'CLOSED',
        });
      } catch (err: any) {
        // Revert toggle on error
        setIsOpenStatus(!nextStatus);
        alert(err.message || 'Failed to update mess operating status.');
        console.warn('Backend operating status toggle note:', err.message);
      }
    }
  };

  return (
    <div className={`owner-layout-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Shared Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main App Canvas */}
      <div className="owner-main-wrapper">
        {/* Shared Top Navigation Bar */}
        <Header
          onToggleMobile={() => setIsMobileOpen(true)}
          isOpenStatus={isOpenStatus}
          onToggleOpenStatus={toggleOpenStatus}
          messStatus={messStatus}
        />

        {/* Dynamic Nested Content */}
        <main className="owner-content-area">
          <div className="owner-content-inner">
            <Outlet context={{ isOpenStatus, toggleOpenStatus, messStatus, removalReason }} />
          </div>
        </main>
      </div>
    </div>
  );
};
