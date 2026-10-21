import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge, getStatusBadgeVariant } from '../../../components/ui/Badge';
import { User } from '../types/admin.types';
import {
  Mail,
  Phone,
  Utensils,
  Ban,
  CheckCircle,
} from 'lucide-react';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (userId: string) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account Details"
      subtitle={`Account Identifier: ${user.id}`}
      maxWidth="540px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Badge variant={getStatusBadgeVariant(user.status)} dot>
            {user.status}
          </Badge>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} className="btn btn-outline">
              Close
            </button>
            <button
              onClick={() => {
                onToggleStatus(user.id);
                onClose();
              }}
              className={`btn ${user.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
            >
              {user.status === 'Active' ? (
                <>
                  <Ban size={15} /> Suspend Account
                </>
              ) : (
                <>
                  <CheckCircle size={15} /> Reactivate Account
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: 'var(--shadow-sm)' }}
          />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {user.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className="badge badge-info" style={{ fontSize: '0.725rem' }}>
                {user.role}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user.college}
              </span>
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={13} /> Email Address
            </span>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {user.email}
            </div>
          </div>

          <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={13} /> Phone Number
            </span>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {user.phone}
            </div>
          </div>
        </div>

        {/* Associated Mess if Owner */}
        {user.associatedMess && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Utensils size={20} color="var(--primary-dark)" />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 600 }}>Associated Dining Facility</span>
              <div style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                {user.associatedMess}
              </div>
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reviews</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.reviewsCount}</div>
          </div>
          <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Grievances</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: user.complaintsCount > 0 ? '#ef4444' : 'var(--text-main)' }}>
              {user.complaintsCount}
            </div>
          </div>
          <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Joined</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
              {user.registeredDate.split('-')[1]}/{user.registeredDate.split('-')[0]}
            </div>
          </div>
          <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active</span>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
              {user.lastActive}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
