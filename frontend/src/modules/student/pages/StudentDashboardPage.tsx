import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  ArrowRight,
  Flame,
  Clock,
  Star,
  CheckCircle2,
  ChefHat,
  Coffee,
} from 'lucide-react';
import { mockMesses } from '../../../data/mockMesses';
import { useMessData } from '../../../context/MessDataContext';
import { MessCard } from '../components/MessCard';
import { useAuth } from '../../../context/AuthContext';
import { useFavorites } from '../../../context/FavoritesContext';
import { MessItem } from '../../../types/student.types';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { approvedMesses } = useMessData();

  // Live approved messes with fallback
  const liveMesses: MessItem[] = (approvedMesses && approvedMesses.length > 0
    ? (approvedMesses as unknown as MessItem[])
    : (mockMesses as unknown as MessItem[]));

  // Filter messes
  const featuredMesses = liveMesses.filter((m) => m.rating >= 4.6);
  const nearbyMesses = [...liveMesses]
    .sort((a, b) => (a.distanceKm || 1) - (b.distanceKm || 1))
    .slice(0, 3);

  return (
    <div>
      {/* 1. HERO WELCOME BANNER (Mint Emerald Theme) */}
      <div className="dashboard-hero-banner">
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ecfdf5',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.85rem',
            }}
          >
            <Sparkles size={14} /> Student Discovery Dashboard • Pune Campus
          </div>

          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '0.65rem',
            }}
          >
            Welcome back, {user?.name?.split(' ')[0] || 'Rahul'}! 🍛
          </h1>
          <p
            style={{
              fontSize: '1.02rem',
              color: '#ecfdf5',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              opacity: 0.95,
            }}
          >
            Lunch is currently being served across campus messes. Explore hot phulkas, compare
            daily thali prices, check hygiene ratings, and find your favorite food spots near campus.
          </p>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Link
              to="/find-mess"
              className="btn btn-primary"
              style={{
                background: '#ffffff',
                color: 'var(--primary-dark)',
                fontWeight: 800,
                border: 'none',
              }}
            >
              <Compass size={18} /> Find Nearby Messes
            </Link>
            <Link
              to="/menu-pricing"
              className="btn btn-outline"
              style={{
                background: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#ffffff',
              }}
            >
              <UtensilsCrossed size={18} /> Today's Menus & Pricing
            </Link>
            <Link
              to="/reviews"
              className="btn btn-outline"
              style={{
                background: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#ffffff',
              }}
            >
              <Star size={18} /> Student Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CAMPUS DINING SCHEDULE & QUICK STATS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Campus Dining Window Spotlight Card */}
        <div
          className="card"
          style={{
            gridColumn: 'span 2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid var(--primary)',
            background: 'var(--bg-card)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🍲</span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Campus Meal Windows & Daily Kitchen Status
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Standard operating timings for student hostels & messes in Pune
                  </div>
                </div>
              </div>
              <span
                className="badge badge-success"
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  border: '1px solid var(--success-border)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="pulse-dot" /> Lunch In Service (12:00 – 3:00 PM)
              </span>
            </div>

            {/* Meal Time Windows Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '1.25rem',
              }}
            >
              {/* Breakfast */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Coffee size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Breakfast
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  7:30 – 9:45 AM
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Poha, Upma, Idli & Tea
                </div>
              </div>

              {/* Lunch - Active */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  border: '1.5px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChefHat size={14} color="var(--primary-dark)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                      Lunch
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-dark)', background: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                    OPEN NOW
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  12:00 – 3:00 PM
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 600, marginTop: '2px' }}>
                  Hot Phulkas & Dal Tadka
                </div>
              </div>

              {/* Snacks */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Snacks
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  4:30 – 6:30 PM
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Samosa, Misal & Chai
                </div>
              </div>

              {/* Dinner */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Flame size={14} color="#f97316" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Dinner
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  7:30 – 10:15 PM
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Paneer Bhurji / Feast Thali
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Link to="/find-mess" className="btn btn-primary btn-sm">
                <Compass size={15} /> Discover Open Messes
              </Link>
              <Link to="/menu-pricing" className="btn btn-outline btn-sm">
                <UtensilsCrossed size={15} /> View Full Meal Schedules
              </Link>
              <Link to="/reviews" className="btn btn-ghost btn-sm">
                <Star size={15} /> Student Ratings
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Student Stat Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Saved Messes */}
          <div
            className="card"
            style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ❤️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                SAVED MESSES
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {favorites?.length || 0} Messes
              </div>
            </div>
            <Link to="/favorites" className="btn btn-outline btn-sm">
              View
            </Link>
          </div>

          {/* Today's Meal Window */}
          <div
            className="card"
            style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🍛
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                NEXT MEAL WINDOW
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Lunch: 12:15 – 3:00 PM
              </div>
            </div>
            <span className="badge badge-success">OPEN</span>
          </div>

          {/* Student Savings */}
          <div
            className="card"
            style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-light)',
                color: 'var(--warning-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              💰
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                STUDENT SAVINGS
              </div>
              <div
                style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning-dark)' }}
              >
                ~₹4,200 / mo
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>vs Takeouts</span>
          </div>
        </div>
      </div>

      {/* 3. FEATURED MESSES SECTION */}
      <section style={{ marginBottom: '3rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                color: 'var(--primary-dark)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              <Flame size={14} /> Student Favorites
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Top-Rated Campus Messes
            </h2>
          </div>
          <Link
            to="/find-mess"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--primary-dark)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            View All ({liveMesses.length}) <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-auto">
          {featuredMesses.slice(0, 3).map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
            />
          ))}
        </div>
      </section>

      {/* 4. NEARBY MESSES */}
      <section style={{ marginBottom: '3rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                color: 'var(--primary-dark)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              <MapPin size={14} /> Walking Distance
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Closest Messes to Your Hostel
            </h2>
          </div>
          <Link
            to="/find-mess?view=map"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--primary-dark)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            Open Interactive Map <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-auto">
          {nearbyMesses.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
            />
          ))}
        </div>
      </section>

      {/* 5. TODAY'S MENU TEASER BANNER */}
      <div
        style={{
          background: 'var(--primary-light)',
          border: '1.5px solid var(--success-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <span className="badge badge-success" style={{ fontWeight: 800 }}>
            DAILY SPECIALS
          </span>
          <h3
            style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              marginTop: '8px',
              marginBottom: '4px',
              color: 'var(--text-main)',
            }}
          >
            Want to see what each mess is serving for Dinner tonight?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Compare full weekly meal calendars, sabji schedules, and Sunday feast menus.
          </p>
        </div>
        <Link to="/menu-pricing" className="btn btn-primary">
          <UtensilsCrossed size={16} /> Explore Weekly Menus & Pricing
        </Link>
      </div>
    </div>
  );
};

export { StudentDashboardPage as DashboardPage };
