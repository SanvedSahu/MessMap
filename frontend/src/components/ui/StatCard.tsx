import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  badgeText?: string;
  badgeVariant?: 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  iconBg = '#ecfdf5',
  iconColor = '#10b981',
  badgeText,
  badgeVariant = 'warning',
  onClick,
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <div
      className={`card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>

        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        {change !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.785rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.15rem',
                fontWeight: 700,
                color: isPositive ? '#059669' : '#dc2626',
              }}
            >
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{changeLabel}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{changeLabel}</span>
        )}

        {badgeText && (
          <span
            className={`badge badge-${badgeVariant}`}
            style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
