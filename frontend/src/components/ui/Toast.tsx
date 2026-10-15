import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        zIndex: 150,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          color: '#065f46',
          icon: <CheckCircle size={18} color="#10b981" />,
        };
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          color: '#991b1b',
          icon: <AlertCircle size={18} color="#ef4444" />,
        };
      case 'info':
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          color: '#1e40af',
          icon: <Info size={18} color="#3b82f6" />,
        };
    }
  };

  const current = getStyles();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        boxShadow: 'var(--shadow-lg)',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: '280px',
        maxWidth: '420px',
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      {current.icon}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          color: current.color,
          padding: '0.2rem',
          opacity: 0.7,
        }}
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
};
