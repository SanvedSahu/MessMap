import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Trash2,
  Columns,
  X
} from 'lucide-react';
import { mockMesses } from '../../../data/mockMesses';
import { MessCard } from '../components/MessCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useFavorites } from '../../../context/FavoritesContext';
import { useNotification } from '../../../context/NotificationContext';
import { MessItem } from '../../../types/student.types';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { showToast } = useNotification();
  const [showCompare, setShowCompare] = useState(false);

  const favoriteMesses = (mockMesses as unknown as MessItem[]).filter((m) => favorites.includes(m.id));

  const handleClearAll = () => {
    favorites.forEach((id) => removeFavorite(id));
    showToast('Cleared all saved favorite messes', 'info');
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--danger-light)', color: 'var(--danger)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Heart size={14} fill="var(--danger)" color="var(--danger)" /> Saved Bookmarks
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            My Favorite Messes ({favoriteMesses.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Quickly check today's menus, compare monthly rates, and subscribe to your shortlisted messes.
          </p>
        </div>

        {favoriteMesses.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="btn btn-outline btn-sm"
              style={{ fontWeight: 700 }}
            >
              <Columns size={15} /> {showCompare ? 'Hide Comparison' : 'Compare Saved Messes'}
            </button>
            <button
              onClick={handleClearAll}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={15} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* COMPARISON DRAWER / TABLE IF TOGGLED */}
      {showCompare && favoriteMesses.length >= 2 && (
        <div className="card" style={{ marginBottom: '2.5rem', border: '2px solid var(--success-border)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Side-by-Side Comparison</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Comparing shortlisted messes</p>
            </div>
            <button onClick={() => setShowCompare(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Parameter</th>
                  {favoriteMesses.map((m) => (
                    <th key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Monthly Price</td>
                  {favoriteMesses.map((m) => (
                    <td key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800 }}>
                      ₹{m.monthlyPrice}/mo
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Daily Thali Price</td>
                  {favoriteMesses.map((m) => (
                    <td key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      ₹{m.dailyPrice}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Distance from Campus</td>
                  {favoriteMesses.map((m) => (
                    <td key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {m.distanceKm} km
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Dietary Offering</td>
                  {favoriteMesses.map((m) => (
                    <td key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {m.foodType}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Student Rating</td>
                  {favoriteMesses.map((m) => (
                    <td key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--warning)' }}>
                      ★ {m.rating} ({m.reviewCount})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Quick Action</td>
                  {favoriteMesses.map((m) => (
                    <td key={m.id} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Link to={`/mess/${m.id}`} className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SAVED MESSES LIST OR EMPTY STATE */}
      {favoriteMesses.length === 0 ? (
        <EmptyState
          title="No Saved Messes Yet"
          description="Save messes you like by clicking the heart button on any mess card to easily compare menus and prices later."
          actionText="Explore Nearby Messes"
          onAction={() => navigate('/find-mess')}
        />
      ) : (
        <div className="grid-cols-auto">
          {favoriteMesses.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
            />
          ))}
        </div>
      )}
    </div>
  );
};
