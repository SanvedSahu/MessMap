import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockActiveSubscription, mockPastInvoices } from '../data/mockSubscriptions';
import { MessItem, PlanItem } from '../types/student.types';

export interface SubscriptionRecord {
  id: string;
  messId: string;
  messName: string;
  messAddress: string;
  planName: string;
  planPrice: number;
  billingCycle: string;
  status: 'Active' | 'Paused' | 'Expired' | 'Expiring';
  startDate: string;
  endDate: string;
  totalDays: number;
  daysUsed: number;
  mealsIncluded: string[];
  totalMeals: number;
  mealsConsumed: number;
  pausedDates?: string[];
  tokenCode: string;
  qrValue: string;
  pauseReason?: string | null;
  pausedDaysCount?: number;
  resumesOn?: string | null;
}

export interface InvoiceRecord {
  id: string;
  messName: string;
  plan: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

export interface SubscriptionContextType {
  subscription: SubscriptionRecord | null;
  invoices: InvoiceRecord[];
  pauseSubscription: (days?: number, reason?: string) => void;
  resumeSubscription: () => void;
  subscribeToMess: (mess: MessItem, plan?: PlanItem) => void;
  renewCurrentSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(() => {
    const saved = localStorage.getItem('messmap_sub');
    return saved ? JSON.parse(saved) : (mockActiveSubscription as SubscriptionRecord);
  });

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    const saved = localStorage.getItem('messmap_invoices');
    return saved ? JSON.parse(saved) : (mockPastInvoices as InvoiceRecord[]);
  });

  useEffect(() => {
    localStorage.setItem('messmap_sub', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('messmap_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const pauseSubscription = (days?: number, reason?: string) => {
    if (!subscription) return;
    setSubscription((prev) =>
      prev
        ? {
            ...prev,
            status: 'Paused',
            pauseReason: reason || 'Student requested pause',
            pausedDaysCount: days || 3,
            resumesOn: '2026-10-22',
          }
        : null
    );
  };

  const resumeSubscription = () => {
    if (!subscription) return;
    setSubscription((prev) =>
      prev
        ? {
            ...prev,
            status: 'Active',
            pauseReason: null,
            resumesOn: null,
          }
        : null
    );
  };

  const subscribeToMess = (mess: MessItem, plan?: PlanItem) => {
    const today = new Date().toISOString().split('T')[0];
    const newSub: SubscriptionRecord = {
      id: 'sub-' + Date.now().toString(),
      messId: mess.id,
      messName: mess.name,
      messAddress: mess.address,
      planName: plan?.name || 'Standard Monthly Plan',
      planPrice: plan?.price || mess.monthlyPrice,
      billingCycle: plan?.billingCycle || 'Monthly',
      status: 'Active',
      startDate: today,
      endDate: '2026-11-15',
      totalDays: 30,
      daysUsed: 1,
      mealsIncluded: ['Lunch', 'Dinner'],
      totalMeals: 60,
      mealsConsumed: 1,
      pausedDates: [],
      tokenCode: 'MM-PUN-' + Math.floor(1000 + Math.random() * 9000).toString(),
      qrValue: `MESSMAP:SUB:${mess.name.toUpperCase().replace(/\s+/g, '_')}:${Date.now()}:ACTIVE`,
    };

    setSubscription(newSub);

    // Add invoice
    const newInvoice: InvoiceRecord = {
      id: 'INV-' + Date.now().toString().slice(-6),
      messName: mess.name,
      plan: plan?.name || 'Standard Plan',
      amount: plan?.price || mess.monthlyPrice,
      date: today,
      status: 'Completed',
      paymentMethod: 'UPI',
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const renewCurrentSubscription = () => {
    if (!subscription) return;
    setSubscription((prev) =>
      prev
        ? {
            ...prev,
            status: 'Active',
            endDate: '2026-11-30',
            totalDays: 60,
            totalMeals: (prev.totalMeals || 0) + 60,
          }
        : null
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        invoices,
        pauseSubscription,
        resumeSubscription,
        subscribeToMess,
        renewCurrentSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
