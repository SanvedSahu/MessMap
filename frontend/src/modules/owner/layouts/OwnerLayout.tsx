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

  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getOwnerMessApi(token)
        .then((res) => {
          if (res?.data?.operatingStatus) {
            setIsOpenStatus(res.data.operatingStatus === 'OPEN');
          }
        })
        .catch((err) => {
          console.warn('Backend operating status fetch note:', err.message);
        });
    }
  }, []);

  const toggleOpenStatus = async () => {
    const nextStatus = !isOpenStatus;
    setIsOpenStatus(nextStatus);
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      try {
        await updateOwnerMessProfileApi(token, {
          operatingStatus: nextStatus ? 'OPEN' : 'CLOSED',
        });
      } catch (err: any) {
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
        />

        {/* Dynamic Nested Content */}
        <main className="owner-content-area">
          <div className="owner-content-inner">
            <Outlet context={{ isOpenStatus, toggleOpenStatus }} />
          </div>
        </main>
      </div>
    </div>
  );
};
