import React from 'react';
import { Badge } from '../Badge';

export { Badge };

export const FoodBadge = ({ type }) => {
  const isVeg = type === 'Pure Veg' || type === 'veg';
  const isNonVeg = type === 'Non-Veg' || type === 'nonveg';

  if (isVeg) {
    return (
      <Badge variant="success">
        🌱 Pure Veg
      </Badge>
    );
  }

  if (isNonVeg) {
    return (
      <Badge variant="danger">
        🍗 Non-Veg
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      🍲 Veg & Non-Veg
    </Badge>
  );
};

export const StatusBadge = ({ isOpen }) => {
  if (isOpen) {
    return (
      <Badge variant="success">
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', marginRight: '4px' }}></span>
        Open Now
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      Closed
    </Badge>
  );
};
