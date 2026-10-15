import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showScore?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  size = 16,
  interactive = false,
  onRatingChange,
  showScore = true,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'inline-flex', gap: '2px' }}>
        {stars.map((star) => {
          const filled = star <= Math.round(rating);
          return (
            <button
              type="button"
              key={star}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              style={{
                background: 'none',
                border: 'none',
                padding: interactive ? '2px' : 0,
                cursor: interactive ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'transform 0.15s ease',
              }}
              aria-label={`${star} star`}
            >
              <Star
                size={size}
                fill={filled ? '#f59e0b' : 'none'}
                color={filled ? '#f59e0b' : '#cbd5e1'}
                strokeWidth={filled ? 0 : 2}
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span
          style={{
            fontSize: `${size * 0.9}px`,
            fontWeight: 700,
            color: '#b45309',
            marginLeft: '3px',
          }}
        >
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
