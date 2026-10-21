import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'secondary';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
  style,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {dot && (
        <span
          className={`status-dot ${
            variant === 'success' ? 'active' : variant === 'warning' ? 'pending' : 'rejected'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export interface FoodBadgeProps {
  type?: string;
}

export const FoodBadge: React.FC<FoodBadgeProps> = ({ type }) => {
  const isVeg = type === 'Pure Veg' || type === 'veg';
  const isNonVeg = type === 'Non-Veg' || type === 'nonveg';

  if (isVeg) {
    return <Badge variant="success">🌱 Pure Veg</Badge>;
  }

  if (isNonVeg) {
    return <Badge variant="danger">🍗 Non-Veg</Badge>;
  }

  return <Badge variant="warning">🍲 Veg & Non-Veg</Badge>;
};

export interface StatusBadgeProps {
  isOpen?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isOpen }) => {
  if (isOpen) {
    return (
      <Badge variant="success">
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'inline-block',
            marginRight: '4px',
          }}
        />
        Open Now
      </Badge>
    );
  }

  return <Badge variant="secondary">Closed</Badge>;
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
    case 'removed':
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
