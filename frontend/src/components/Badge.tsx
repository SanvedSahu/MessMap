import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className={`status-dot ${variant === 'success' ? 'active' : variant === 'warning' ? 'pending' : 'rejected'}`} />}
      {children}
    </span>
  );
};

export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'active':
    case 'resolved':
    case 'open':
    case 'published':
      return 'success';
    case 'pending':
    case 'under review':
    case 'under investigation':
    case 'pending verification':
      return 'warning';
    case 'rejected':
    case 'suspended':
    case 'flagged':
    case 'critical':
      return 'danger';
    case 'high':
    case 'medium':
      return 'warning';
    case 'low':
    case 'closed':
    case 'dismissed':
      return 'neutral';
    default:
      return 'info';
  }
};
