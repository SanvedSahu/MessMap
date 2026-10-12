import React from 'react';

/**
 * Reusable Badge Component
 * Variants: 'success' (Mint/Veg), 'warning' (Gold/Rating), 'info' (Sky), 'danger' (Crimson), 'secondary'
 */
export const Badge = ({ children, variant = 'success', className = '', style = {} }) => {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`} style={style}>
      {children}
    </span>
  );
};
