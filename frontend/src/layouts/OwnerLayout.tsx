import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/owner/Sidebar';
import { Header } from '../components/owner/Header';
import './OwnerLayout.css';

export const OwnerLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isOpenStatus, setIsOpenStatus] = useState<boolean>(true);

  const toggleOpenStatus = () => {
    setIsOpenStatus((prev) => !prev);
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
