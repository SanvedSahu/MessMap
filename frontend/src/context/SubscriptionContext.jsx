import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockActiveSubscription, mockPastInvoices } from '../data/mockSubscriptions';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(() => {
    const saved = localStorage.getItem('messmap_sub');
    return saved ? JSON.parse(saved) : mockActiveSubscription;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('messmap_invoices');
    return saved ? JSON.parse(saved) : mockPastInvoices;
  });

  useEffect(() => {
    localStorage.setItem('messmap_sub', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('messmap_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const pauseSubscription = (days, reason) => {
    if (!subscription) return;
    setSubscription((prev) => ({
      ...prev,
      status: 'Paused',
      pauseReason: reason || 'Student requested pause',
      pausedDaysCount: days || 3,
      resumesOn: '2026-10-22'
    }));
  };

  const resumeSubscription = () => {
    if (!subscription) return;
    setSubscription((prev) => ({
      ...prev,
      status: 'Active',
      pauseReason: null,
      resumesOn: null
    }));
  };

  const subscribeToMess = (mess, plan) => {
    const today = new Date().toISOString().split('T')[0];
    const newSub = {
      id: 'sub-' + Date.now(),
      messId: mess.id,
      messName: mess.name,
      messAddress: mess.address,
      planName: plan.name,
      planPrice: plan.price,
      billingCycle: plan.billingCycle || 'Monthly',
      status: 'Active',
      startDate: today,
      endDate: '2026-11-15',
      totalDays: 30,
      daysUsed: 1,
      mealsIncluded: ['Lunch', 'Dinner'],
      totalMeals: 60,
      mealsConsumed: 1,
      pausedDates: [],
      tokenCode: 'MM-PUN-' + Math.floor(1000 + Math.random() * 9000),
      qrValue: `MESSMAP:SUB:${mess.name.toUpperCase().replace(/\s+/g, '_')}:${Date.now()}:ACTIVE`
    };

    setSubscription(newSub);

    // Add invoice
    const newInvoice = {
      id: 'INV-' + Date.now().toString().slice(-6),
      messName: mess.name,
      plan: plan.name,
      amount: plan.price,
      date: today,
      status: 'Completed',
      paymentMethod: 'UPI'
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const renewCurrentSubscription = () => {
    if (!subscription) return;
    setSubscription((prev) => ({
      ...prev,
      status: 'Active',
      endDate: '2026-11-30',
      totalDays: 60,
      totalMeals: prev.totalMeals + 60
    }));
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        invoices,
        pauseSubscription,
        resumeSubscription,
        subscribeToMess,
        renewCurrentSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
