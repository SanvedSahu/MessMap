import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({
  title = 'No Items Found',
  description = 'Try adjusting your search criteria or filters.',
  actionText,
  onAction,
  icon: Icon = SearchX
}) => {
  return (
    <div className="empty-state-box">
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};
