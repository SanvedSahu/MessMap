import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck } from 'lucide-react';
import { FoodBadge, StatusBadge } from '../../../components/ui/Badge';
import { useFavorites } from '../../../context/FavoritesContext';
import { useNotification } from '../../../context/NotificationContext';
import { MessItem } from '../../../types/student.types';

export interface MessCardProps {
  mess: MessItem;
  onSubscribeClick?: (mess: MessItem) => void;
}

export const MessCard: React.FC<MessCardProps> = ({ mess, onSubscribeClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useNotification();
  const favorited = isFavorite(mess.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(mess.id);
    showToast(
      favorited
        ? `Removed "${mess.name}" from favorites`
        : `Added "${mess.name}" to favorites! ❤️`,
      'info'
    );
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSubscribeClick) {
      onSubscribeClick(mess);
    }
  };

  return (
    <div
      className="card card-interactive"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thumbnail Header */}
      <div style={{ position: 'relative', height: '185px', width: '100%', overflow: 'hidden' }}>
        <img
          src={mess.heroImage}
          alt={mess.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.65) 0%, transparent 60%)',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '6px',
          }}
        >
          <FoodBadge type={mess.foodType} />
          <StatusBadge isOpen={mess.isOpenNow} />
        </div>

        {/* Heart Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s ease',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            color={favorited ? '#ef4444' : '#64748b'}
            fill={favorited ? '#ef4444' : 'none'}
          />
        </button>

        {/* Bottom Distance & Daily Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MapPin size={14} color="#34d399" /> {mess.distanceKm} km away
          </span>
          <span
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            Daily: ₹{mess.dailyPrice}/thali
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '1.25rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        {/* Rating & Verified Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.9rem' }}>
            ★ {mess.rating}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              ({mess.reviewCount})
            </span>
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} /> Verified
          </span>
        </div>

        {/* Mess Title */}
        <Link to={`/mess/${mess.id}`}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {mess.name}
          </h3>
        </Link>

        {/* Address */}
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
          📍 {mess.landmark || mess.address}
        </p>

        {/* Timings & Today's Special in Mint Box */}
        {mess.todayMenu?.lunch && (
          <div
            style={{
              backgroundColor: 'var(--primary-light)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--primary-dark)',
              fontWeight: 600,
              marginTop: '2px',
            }}
          >
            🍛 Lunch: {mess.todayMenu.lunch.sabji1}, {mess.todayMenu.lunch.bread} &{' '}
            {mess.todayMenu.lunch.sweet || 'Dal Tadka'}
          </div>
        )}

        {/* Price & Action Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Starting from</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{mess.monthlyPrice.toLocaleString('en-IN')}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                /month
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleSubscribe}
              className="btn btn-outline btn-sm"
              title="Subscribe to plan"
            >
              Subscribe
            </button>
            <Link to={`/mess/${mess.id}`} className="btn btn-primary btn-sm">
              View Menu & Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
