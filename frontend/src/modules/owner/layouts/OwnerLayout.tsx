import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../../../context/AuthContext';
import {
  getOwnerMessApi,
  getOwnerMessesApi,
  getOwnerMessByIdApi,
  updateOwnerMessProfileApi,
  type OwnerMessProfileResponse,
} from '../../../api/ownerApi';
import './OwnerLayout.css';

export interface OwnerOutletContextType {
  isOpenStatus: boolean;
  toggleOpenStatus: () => void;
  messStatus?: string;
  removalReason?: string;
  ownerMess: OwnerMessProfileResponse | null;
  allOwnerMesses: OwnerMessProfileResponse[];
  selectMess: (messId: number | string) => void;
  refreshOwnerMess: () => Promise<OwnerMessProfileResponse | null>;
  loadingMess: boolean;
}

export const OwnerLayout: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isOpenStatus, setIsOpenStatus] = useState<boolean>(true);
  const [messStatus, setMessStatus] = useState<string>('APPROVED');
  const [removalReason, setRemovalReason] = useState<string | undefined>(undefined);
  const [ownerMess, setOwnerMess] = useState<OwnerMessProfileResponse | null>(null);
  const [allOwnerMesses, setAllOwnerMesses] = useState<OwnerMessProfileResponse[]>([]);
  const [loadingMess, setLoadingMess] = useState<boolean>(true);

  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com' || user.messId === 'MESS-101';

  const fetchOwnerMess = useCallback(
    async (targetMessId?: number | string): Promise<OwnerMessProfileResponse | null> => {
      const token = localStorage.getItem('messmap_auth_token') || user.token;
      if (!token) {
        setLoadingMess(false);
        return null;
      }

      setLoadingMess(true);
      try {
        // Fetch all messes owned by this owner
        try {
          const allRes = await getOwnerMessesApi(token);
          if (allRes?.data && Array.isArray(allRes.data)) {
            setAllOwnerMesses(allRes.data);
          }
        } catch {
          // ignore if multi-mess route not available
        }

        // Determine which mess to load: targetMessId > user.messId > primary mess
        let messData: OwnerMessProfileResponse | null = null;
        const requestedId = targetMessId || user.messId;

        if (requestedId && !String(requestedId).startsWith('MESS-')) {
          try {
            const byIdRes = await getOwnerMessByIdApi(token, requestedId);
            if (byIdRes?.data) {
              messData = byIdRes.data;
            }
          } catch {
            // fallback to primary mess
          }
        }

        if (!messData) {
          const primaryRes = await getOwnerMessApi(token);
          if (primaryRes?.data) {
            messData = primaryRes.data;
          }
        }

        if (messData) {
          setOwnerMess(messData);
          if (messData.operatingStatus) {
            setIsOpenStatus(messData.operatingStatus === 'OPEN');
          }
          if (messData.status) {
            setMessStatus(messData.status);
          }
          if (messData.removalReason) {
            setRemovalReason(messData.removalReason);
          }

          // Sync auth user session with live database record
          if (messData.name && messData.name !== user.messName) {
            updateProfile({ messId: String(messData.id), messName: messData.name });
          }
          return messData;
        } else {
          setOwnerMess(null);
          return null;
        }
      } catch (err: any) {
        console.warn('Backend owner mess fetch note:', err.message);
        setOwnerMess(null);
        return null;
      } finally {
        setLoadingMess(false);
      }
    },
    [user.token, user.messId, user.messName, updateProfile]
  );

  useEffect(() => {
    fetchOwnerMess();
  }, [fetchOwnerMess]);

  const selectMess = async (messId: number | string) => {
    const selected = allOwnerMesses.find((m) => String(m.id) === String(messId));
    if (selected) {
      updateProfile({ messId: String(selected.id), messName: selected.name });
    }
    await fetchOwnerMess(messId);
  };

  const toggleOpenStatus = async () => {
    const nextStatus = !isOpenStatus;

    if (nextStatus && (messStatus === 'SUSPENDED' || messStatus === 'REMOVED')) {
      const msg =
        messStatus === 'REMOVED'
          ? 'Cannot open mess: This listing was removed by an administrator and cannot be reactivated.'
          : 'Cannot open mess: This listing is currently suspended by an administrator. Please submit a suspension review request.';
      alert(msg);
      return;
    }

    setIsOpenStatus(nextStatus);
    const token = localStorage.getItem('messmap_auth_token') || user.token;
    if (token) {
      try {
        await updateOwnerMessProfileApi(
          token,
          {
            operatingStatus: nextStatus ? 'OPEN' : 'CLOSED',
          },
          ownerMess?.id
        );
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
        mess={ownerMess}
        isOpenStatus={isOpenStatus}
      />

      {/* Main App Canvas */}
      <div className="owner-main-wrapper">
        {/* Shared Top Navigation Bar */}
        <Header
          onToggleMobile={() => setIsMobileOpen(true)}
          isOpenStatus={isOpenStatus}
          onToggleOpenStatus={toggleOpenStatus}
          messStatus={messStatus}
          mess={ownerMess}
          allMesses={allOwnerMesses}
          onSelectMess={selectMess}
        />

        {/* Dynamic Nested Content */}
        <main className="owner-content-area">
          <div className="owner-content-inner">
            <Outlet
              context={{
                isOpenStatus,
                toggleOpenStatus,
                messStatus,
                removalReason,
                ownerMess,
                allOwnerMesses,
                selectMess,
                refreshOwnerMess: fetchOwnerMess,
                loadingMess,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
