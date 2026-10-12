import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px' }) => {
  if (!isOpen) return null;

  return (
    <div className="mm-modal-backdrop" onClick={onClose}>
      <div
        className="mm-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
