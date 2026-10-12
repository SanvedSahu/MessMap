import React from 'react';

export const ToastContainer = ({ toasts = [], onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-${toast.type || 'success'}`}
          onClick={() => onRemove && onRemove(toast.id)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '1.1rem' }}>
            {toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
