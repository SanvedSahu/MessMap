import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mess, ActivityItem } from '../modules/admin/types/admin.types';
import { initialMesses as adminInitialMesses, initialActivities as adminInitialActivities } from '../modules/admin/data/mockData';
import { mockMesses as studentMockMesses } from '../data/mockMesses';

// Merge initial messes with rich student data (coordinates, images, menus)
const buildUnifiedInitialMesses = (): Mess[] => {
  // Start with admin initial messes
  const merged: Mess[] = adminInitialMesses.map((adminMess, idx) => {
    // Check if there's a corresponding student mess by name match or index
    const studentMatch = studentMockMesses[idx % studentMockMesses.length];
    return {
      ...adminMess,
      // Augment with student rich data if present
      heroImage: (studentMatch as any)?.heroImage || 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
      lat: (studentMatch as any)?.lat || 18.5204 + (idx * 0.005),
      lng: (studentMatch as any)?.lng || 73.8402 + (idx * 0.004),
      distanceKm: (studentMatch as any)?.distanceKm || 0.4 + (idx * 0.2),
      isOpenNow: adminMess.operatingStatus === 'Open',
    } as any;
  });

  return merged;
};

interface MessDataContextType {
  messes: Mess[];
  approvedMesses: Mess[];
  pendingMesses: Mess[];
  activities: ActivityItem[];
  approveMess: (id: string) => void;
  rejectMess: (id: string, reason?: string) => void;
  suspendMess: (id: string) => void;
  unsuspendMess: (id: string) => void;
  deleteMess: (id: string, reason?: string) => void;
  registerMess: (messData: Partial<Mess>) => string;
  updateMess: (id: string, messData: Partial<Mess>) => void;
}

const MessDataContext = createContext<MessDataContextType | undefined>(undefined);

export const MessDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messes, setMesses] = useState<Mess[]>(() => {
    try {
      const saved = localStorage.getItem('messmap_messes_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return buildUnifiedInitialMesses();
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('messmap_activities_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return adminInitialActivities;
  });

  useEffect(() => {
    try {
      localStorage.setItem('messmap_messes_data', JSON.stringify(messes));
    } catch {
      // ignore
    }
  }, [messes]);

  useEffect(() => {
    try {
      localStorage.setItem('messmap_activities_data', JSON.stringify(activities));
    } catch {
      // ignore
    }
  }, [activities]);

  const approvedMesses = messes.filter((m) => m.status === 'Approved' && m.operatingStatus !== 'Closed');
  const pendingMesses = messes.filter((m) => m.status === 'Pending');

  const approveMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    setMesses((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'Approved', operatingStatus: 'Open', rejectionReason: undefined } : m
      )
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
  };

  const rejectMess = (id: string, reason?: string) => {
    const target = messes.find((m) => m.id === id);
    if (!target) return;

    const defaultReason = reason || 'Documentation did not satisfy campus health & safety compliance.';

    setMesses((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'Rejected',
              operatingStatus: 'Closed',
              rejectionReason: defaultReason,
            }
          : m
      )
    );

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_rejected',
      title: 'Mess Registration Rejected',
      description: `${target.name} application rejected: ${defaultReason}`,
      timestamp: 'Just now',
      badgeVariant: 'danger',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const suspendMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    setMesses((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Suspended', operatingStatus: 'Closed' } : m))
    );

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_suspended',
      title: 'Mess Suspended',
      description: `${target?.name || 'Mess'} listing suspended and temporarily hidden from student portal.`,
      timestamp: 'Just now',
      badgeVariant: 'danger',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const unsuspendMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    setMesses((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Approved', operatingStatus: 'Open' } : m))
    );

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_unsuspended',
      title: 'Mess Unsuspended & Reactivated',
      description: `${target?.name || 'Mess'} has been unsuspended and reinstated in campus search.`,
      timestamp: 'Just now',
      badgeVariant: 'success',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const deleteMess = (id: string) => {
    const target = messes.find((m) => m.id === id);
    setMesses((prev) => prev.filter((m) => m.id !== id));

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_deleted',
      title: 'Mess Removed from Directory',
      description: `${target?.name || 'Mess'} was removed from the active mess registry.`,
      timestamp: 'Just now',
      badgeVariant: 'danger',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const registerMess = (messData: Partial<Mess>): string => {
    const newId = 'MESS-' + Math.floor(100 + Math.random() * 900);
    const newMess: Mess = {
      id: newId,
      name: messData.name || 'New College Mess',
      ownerName: messData.ownerName || 'Mess Partner',
      ownerPhone: messData.ownerPhone || '+91 98000 00000',
      ownerEmail: messData.ownerEmail || 'partner@messmap.com',
      address: messData.address || 'Campus Vicinity, Pune',
      area: messData.area || 'Pune Campus',
      foodType: messData.foodType || 'Pure Veg',
      monthlyPrice: Number(messData.monthlyPrice) || 3000,
      dailyPrice: Number(messData.dailyPrice) || 100,
      rating: 4.5,
      reviewCount: 0,
      status: 'Pending', // ALWAYS Pending initially for Admin Verification
      operatingStatus: 'Closed',
      timings: messData.timings || {
        breakfast: '7:30 AM - 10:00 AM',
        lunch: '12:30 PM - 3:00 PM',
        dinner: '7:30 PM - 10:30 PM',
      },
      menuHighlights: messData.menuHighlights || ['Special Dal Tadka', 'Unlimited Roti', 'Rice Bowl'],
      hygieneScore: 4.5,
      registeredDate: new Date().toISOString().split('T')[0],
      description: messData.description || 'Newly registered student mess awaiting campus health verification.',
      features: ['RO Purified Water', 'Hygienic Kitchen', 'Fresh Hot Meals'],
      capacity: messData.capacity || 60,
      ...((messData as any).lat ? {} : {
        lat: 18.5204 + (Math.random() - 0.5) * 0.02,
        lng: 73.8402 + (Math.random() - 0.5) * 0.02,
        distanceKm: 0.6,
        heroImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      })
    } as Mess;

    setMesses((prev) => [newMess, ...prev]);

    const newActivity: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mess_registered',
      title: 'New Mess Registered',
      description: `${newMess.name} submitted registration papers for admin review.`,
      timestamp: 'Just now',
      badgeVariant: 'warning',
    };
    setActivities((prev) => [newActivity, ...prev]);

    return newId;
  };

  const updateMess = (id: string, messData: Partial<Mess>) => {
    setMesses((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...messData } : m))
    );
  };

  return (
    <MessDataContext.Provider
      value={{
        messes,
        approvedMesses,
        pendingMesses,
        activities,
        approveMess,
        rejectMess,
        suspendMess,
        unsuspendMess,
        deleteMess,
        registerMess,
        updateMess,
      }}
    >
      {children}
    </MessDataContext.Provider>
  );
};

export const useMessData = () => {
  const context = useContext(MessDataContext);
  if (!context) {
    throw new Error('useMessData must be used within a MessDataProvider');
  }
  return context;
};
