import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge, getStatusBadgeVariant } from '../../../components/ui/Badge';
import { Mess } from '../types/admin.types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Utensils,
  Award,
  Users,
} from 'lucide-react';

interface MessDetailModalProps {
  mess: Mess | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSuspend?: (id: string) => void;
  onUnsuspend?: (id: string) => void;
  onDelete?: (id: string, reason?: string) => void;
}

export const MessDetailModal: React.FC<MessDetailModalProps> = ({
  mess,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onDelete,
}) => {
  if (!mess) return null;

  const isSuspended = mess.status === 'Suspended' || mess.status === 'Under Review';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mess.name}
      subtitle={`Registration ID: ${mess.id} • Registered on ${mess.registeredDate}`}
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={getStatusBadgeVariant(mess.status)} dot>
              {mess.status}
            </Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Operating: {mess.operatingStatus}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={onClose} className="btn btn-outline">
              Close
            </button>
            {mess.status === 'Pending' && (
              <>
                <button
                  onClick={() => {
                    onReject(mess.id);
                    onClose();
                  }}
                  className="btn btn-danger"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => {
                    onApprove(mess.id);
                    onClose();
                  }}
                  className="btn btn-success"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </>
            )}
            {mess.status === 'Approved' && onSuspend && (
              <button
                onClick={() => {
                  onSuspend(mess.id);
                  onClose();
                }}
                className="btn btn-danger btn-sm"
              >
                <AlertOctagon size={16} /> Suspend Mess
              </button>
            )}
            {isSuspended && (
              <>
                {onUnsuspend && (
                  <button
                    onClick={() => {
                      onUnsuspend(mess.id);
                      onClose();
                    }}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle size={16} /> Unsuspend Mess
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      const reason = window.prompt(`Please provide a mandatory removal reason for "${mess.name}":`);
                      if (reason !== null) {
                        const trimmed = reason.trim();
                        if (!trimmed) {
                          alert('A removal reason is required and cannot be blank.');
                          return;
                        }
                        onDelete(mess.id, trimmed);
                        onClose();
                      }
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={16} /> Remove from Directory
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Rejection notice banner if applicable */}
        {mess.rejectionReason && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.85rem',
            }}
          >
            <strong>Rejection Log:</strong> {mess.rejectionReason}
          </div>
        )}

        {/* Overview Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Subscription</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{mess.monthlyPrice.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>₹{mess.dailyPrice}/day meal</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Rating</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ★ {mess.rating}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({mess.reviewCount} reviews)
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#059669' }}>Verified Students Only</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hygiene & Safety</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={18} /> {mess.hygieneScore} / 5
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Campus Health Standard</span>
          </div>
        </div>

        {/* Owner & Location Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
            <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={15} /> Mess Proprietor
            </h5>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>{mess.ownerName}</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={13} /> {mess.ownerPhone}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={13} /> {mess.ownerEmail}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
            <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} /> Campus Location
            </h5>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>{mess.area}</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {mess.address}
            </div>
            {mess.latitude != null && mess.longitude != null && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                📍 Coordinates: {Number(mess.latitude).toFixed(6)}, {Number(mess.longitude).toFixed(6)}
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 600 }}>
              Campus Seating Capacity: {mess.capacity || 60} students
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div style={{ border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
          <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={15} /> Meal Timings
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.825rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem' }}>Breakfast</span>
              <strong style={{ color: 'var(--text-main)' }}>{mess.timings?.breakfast || '7:30 AM - 10:00 AM'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem' }}>Lunch</span>
              <strong style={{ color: 'var(--text-main)' }}>{mess.timings?.lunch || '12:30 PM - 3:00 PM'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.75rem' }}>Dinner</span>
              <strong style={{ color: 'var(--text-main)' }}>{mess.timings?.dinner || '7:30 PM - 10:30 PM'}</strong>
            </div>
          </div>
        </div>

        {/* Menu & Specialties */}
        <div>
          <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Utensils size={15} /> Signature Menu Offerings ({mess.foodType})
          </h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(mess.menuHighlights || ['Special Dal Tadka', 'Unlimited Roti', 'Rice Bowl']).map((dish, i) => (
              <span
                key={i}
                style={{
                  padding: '0.3rem 0.65rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {dish}
              </span>
            ))}
          </div>
        </div>

        {/* Features & Amenities */}
        <div>
          <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={15} /> Key Amenities
          </h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(mess.features || ['RO Purified Water', 'Hygienic Clean Kitchen', 'Fresh Hot Meals']).map((feat, i) => (
              <span
                key={i}
                style={{
                  padding: '0.25rem 0.55rem',
                  backgroundColor: '#f1f5f9',
                  color: 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.775rem',
                }}
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, background: '#fafbfc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
          {mess.description || 'Verified campus mess listing with hygienic dining facilities.'}
        </div>
      </div>
    </Modal>
  );
};
