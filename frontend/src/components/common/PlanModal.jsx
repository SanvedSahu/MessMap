import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, QrCode, Sparkles } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const PlanModal = ({ mess, isOpen, onClose }) => {
  const { subscribeToMess } = useSubscription();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = useState(mess?.plans?.[1]?.id || mess?.plans?.[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !mess) return null;

  const currentPlan = mess.plans?.find((p) => p.id === selectedPlanId) || mess.plans?.[0];

  const handleConfirmSubscription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      subscribeToMess(mess, currentPlan);
      setIsProcessing(false);
      showToast(`🎉 Subscribed to ${mess.name}! Your Meal Pass is now active.`, 'success');
      onClose();
      navigate('/subscriptions');
    }, 700);
  };

  return (
    <div className="mm-modal-backdrop" onClick={onClose}>
      <div className="mm-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase' }}>
              Student Meal Pass
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Subscribe to {mess.name}</h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-card-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Plan Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Select Meal Subscription Plan:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mess.plans?.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    border: isSelected ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                    background: isSelected ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {plan.name}
                      {plan.popular && (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{plan.price}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Validity: <strong>{plan.validity}</strong> • {plan.billingCycle}
                  </div>

                  {plan.features && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {plan.features.map((feat, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', background: isSelected ? '#ffffff' : 'var(--bg-card-subtle)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Choose Payment / Verification Mode:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { id: 'upi', label: 'UPI (GPay/PhonePe)', icon: QrCode },
              { id: 'card', label: 'Debit / ATM Card', icon: CreditCard },
              { id: 'cash', label: 'Pay Cash at Mess', icon: ShieldCheck }
            ].map((method) => {
              const active = paymentMethod === method.id;
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  style={{
                    border: active ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: active ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={20} color={active ? 'var(--primary-dark)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? 'var(--primary-dark)' : 'var(--text-secondary)' }}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Protection Banner */}
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>MessMap Student Protection:</strong> Free meal pause included up to 6 days. Instant digital meal pass activated on confirmation.
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmSubscription}
            className="btn btn-primary"
            style={{ minWidth: '170px' }}
          >
            {isProcessing ? 'Activating Pass...' : `Confirm & Pay ₹${currentPlan?.price || 0}`}
          </button>
        </div>
      </div>
    </div>
  );
};
