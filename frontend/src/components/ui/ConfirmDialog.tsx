import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success';
  requiresReason?: boolean;
  reasonPlaceholder?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  requiresReason = false,
  reasonPlaceholder = 'Please enter justification or feedback for the user...',
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      setError('A reason is mandatory for this action.');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 size={24} color="#10b981" />;
      case 'warning':
        return <AlertTriangle size={24} color="#f59e0b" />;
      case 'danger':
      default:
        return <ShieldAlert size={24} color="#ef4444" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'success':
        return 'btn-success';
      case 'warning':
        return 'btn-primary';
      case 'danger':
      default:
        return 'btn-danger';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="480px"
      footer={
        <>
          <button onClick={handleClose} className="btn btn-outline">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={`btn ${getButtonClass()}`}>
            {confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              variant === 'success'
                ? 'var(--success-bg)'
                : variant === 'warning'
                ? 'var(--warning-bg)'
                : 'var(--danger-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {getIcon()}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {message}
          </p>

          {requiresReason && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Reason / Action Log Note <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="form-input"
                rows={3}
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
              />
              {error && (
                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
