import React from 'react';
import { X, CheckCircle, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { Badge } from '../../../components/ui/Badge';
import { UserSubscription } from '../../../types/student.types';
import { SubscriptionRecord } from '../../../context/SubscriptionContext';

export interface QRModalProps {
  subscription: UserSubscription | SubscriptionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ subscription, isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  if (!isOpen || !subscription) return null;

  const handleDownload = () => {
    showToast('Digital Meal Pass downloaded to your device! 📲', 'success');
  };

  return (
    <div className="mm-modal-backdrop" onClick={onClose}>
      <div
        className="mm-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', textAlign: 'center' }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--bg-card-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Close modal"
        >
          <X size={16} color="var(--text-muted)" />
        </button>

        <div style={{ marginBottom: '1rem' }}>
          <Badge variant="success">
            <CheckCircle size={14} /> Active Meal Pass
          </Badge>
        </div>

        <h3
          style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            marginBottom: '4px',
            color: 'var(--text-main)',
          }}
        >
          {subscription.messName}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {subscription.planName}
        </p>

        {/* QR Box */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'inline-block',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '180px',
              height: '180px',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              {/* Corner position markers */}
              <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="3" />
              <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
              <rect x="13" y="13" width="10" height="10" fill="#10b981" rx="1" />

              <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="3" />
              <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
              <rect x="77" y="13" width="10" height="10" fill="#10b981" rx="1" />

              <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="3" />
              <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
              <rect x="13" y="77" width="10" height="10" fill="#10b981" rx="1" />

              {/* Data dots */}
              <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="36" y="18" width="6" height="6" fill="#10b981" />
              <rect x="48" y="22" width="8" height="6" fill="#0f172a" />

              <rect x="8" y="36" width="6" height="6" fill="#0f172a" />
              <rect x="18" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="8" y="54" width="6" height="6" fill="#0f172a" />

              <rect x="35" y="35" width="30" height="30" fill="#0f172a" rx="4" />
              <rect x="42" y="42" width="16" height="16" fill="#ecfdf5" rx="3" />
              <circle cx="50" cy="50" r="5" fill="#10b981" />

              <rect x="68" y="36" width="6" height="6" fill="#0f172a" />
              <rect x="78" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="86" y="52" width="8" height="6" fill="#0f172a" />

              <rect x="36" y="72" width="8" height="6" fill="#0f172a" />
              <rect x="48" y="68" width="6" height="6" fill="#10b981" />
              <rect x="62" y="76" width="8" height="6" fill="#0f172a" />
              <rect x="44" y="82" width="8" height="6" fill="#0f172a" />
              <rect x="56" y="86" width="6" height="6" fill="#0f172a" />
              <rect x="74" y="82" width="16" height="8" fill="#0f172a" />
            </svg>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Token Pass Code
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
              }}
            >
              {subscription.tokenCode || 'MM-PUN-8812'}
            </div>
          </div>
        </div>

        {/* Student & Validity Details */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'left',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
            <span style={{ fontWeight: 700 }}>{user?.name || 'Rahul Patil'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Valid Until:</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
              {subscription.endDate}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Meals Covered:</span>
            <span style={{ fontWeight: 700 }}>
              {subscription.mealsIncluded?.join(' & ') || 'Lunch & Dinner'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Show this QR code or recite the Token Code at the mess counter before taking your thali.
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
          >
            <Download size={15} /> Save Pass
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
