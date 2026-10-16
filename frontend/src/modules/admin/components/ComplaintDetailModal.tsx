import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge, getStatusBadgeVariant } from '../../../components/ui/Badge';
import { Complaint, ComplaintStatus } from '../types/admin.types';
import {
  User,
  Utensils,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ComplaintStatus, notes: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [adminNote, setAdminNote] = useState('');

  if (!complaint) return null;

  const currentNotes = adminNote || complaint.adminNotes || '';

  const handleResolve = () => {
    onUpdateStatus(complaint.id, 'Resolved', currentNotes);
    onClose();
  };

  const handleInvestigate = () => {
    onUpdateStatus(complaint.id, 'Under Investigation', currentNotes);
    onClose();
  };

  const handleDismiss = () => {
    onUpdateStatus(complaint.id, 'Dismissed', currentNotes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={complaint.subject}
      subtitle={`Ticket ${complaint.ticketNumber} • Logged on ${complaint.date}`}
      maxWidth="680px"
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant={getStatusBadgeVariant(complaint.status)} dot>
              {complaint.status}
            </Badge>
            <span className={`badge badge-${getStatusBadgeVariant(complaint.severity)}`}>
              {complaint.severity} Severity
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <button onClick={onClose} className="btn btn-outline btn-sm">
              Close
            </button>
            {complaint.status !== 'Resolved' && (
              <>
                {complaint.status !== 'Under Investigation' && (
                  <button
                    onClick={handleInvestigate}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#d97706', borderColor: '#fde68a' }}
                  >
                    <Clock size={14} /> Under Investigation
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#64748b' }}
                >
                  <XCircle size={14} /> Dismiss
                </button>
                <button onClick={handleResolve} className="btn btn-success btn-sm">
                  <CheckCircle2 size={14} /> Resolve Grievance
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Mess and Complainant details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Utensils size={13} /> Reported Mess
            </span>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {complaint.messName}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
              Mess ID: {complaint.messId}
            </span>
          </div>

          <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={13} /> Complainant Student
            </span>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {complaint.userName}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {complaint.userEmail}
            </span>
          </div>
        </div>

        {/* Complaint Category and Summary */}
        <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa', backgroundColor: '#fff7ed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c' }}>
              Category: {complaint.category}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9a3412' }}>
              Priority: {complaint.severity}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#7c2d12', lineHeight: 1.5 }}>
            {complaint.description}
          </p>
        </div>

        {/* Resolution note if already resolved */}
        {complaint.resolvedDate && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.825rem' }}>
            <strong>Resolved on {complaint.resolvedDate}:</strong> Issue rectified by campus administration.
          </div>
        )}

        {/* Admin Resolution & Internal Notes Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Administrative Investigation Notes
          </label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Record evidence from mess proprietor, health inspection summary, or refund details..."
            value={currentNotes}
            onChange={(e) => setAdminNote(e.target.value)}
          />
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            These notes will be archived in the student's official grievance case record.
          </span>
        </div>
      </div>
    </Modal>
  );
};
