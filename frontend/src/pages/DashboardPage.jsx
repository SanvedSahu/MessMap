import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Coffee,
  CheckCircle2,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { mockMesses } from '../data/mockMesses';
import { MessCard } from '../components/common/MessCard';
import { PlanModal } from '../components/common/PlanModal';
import { QRModal } from '../components/common/QRModal';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useFavorites } from '../context/FavoritesContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const [selectedMessForPlan, setSelectedMessForPlan] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Filter messes
  const featuredMesses = mockMesses.filter((m) => m.rating >= 4.6);
  const nearbyMesses = [...mockMesses].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);

  return (
    <div>
      {/* 1. HERO WELCOME BANNER (Mint Emerald Theme) */}
      <div className="dashboard-hero-banner">
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#ecfdf5', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <Sparkles size={14} /> Student Discovery Dashboard • Pune Campus
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Rahul'}! 🍛
          </h1>
          <p style={{ fontSize: '1.02rem', color: '#ecfdf5', lineHeight: 1.6, marginBottom: '1.5rem', opacity: 0.95 }}>
            Lunch is currently being served across campus messes. Explore hot phulkas, compare monthly student plans, or manage your active meal pass.
          </p>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Link to="/find-mess" className="btn btn-primary" style={{ background: '#ffffff', color: 'var(--primary-dark)', fontWeight: 800, border: 'none' }}>
              <Compass size={18} /> Find Nearby Messes
            </Link>
            {subscription && (
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="btn btn-outline"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
              >
                <QrCode size={18} /> Show QR Meal Token
              </button>
            )}
            <Link
              to="/menu-pricing"
              className="btn btn-outline"
              style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
            >
              <UtensilsCrossed size={18} /> Today's Menus
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS & ACTIVE SUBSCRIPTION BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Active Subscription Status Card */}
        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--primary)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Active Meal Subscription</h3>
              </div>
              <span
                className="badge badge-success"
                style={{
                  background: subscription?.status === 'Active' ? 'var(--primary-light)' : 'var(--danger-light)',
                  color: subscription?.status === 'Active' ? 'var(--primary-dark)' : 'var(--danger)',
                  border: `1px solid ${subscription?.status === 'Active' ? 'var(--success-border)' : '#fca5a5'}`
                }}
              >
                ● {subscription?.status || 'No Active Plan'}
              </span>
            </div>

            {subscription ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {subscription.messName}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {subscription.planName} • ₹{subscription.planPrice}/month
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid Until</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      {subscription.endDate}
                    </div>
                  </div>
                </div>

                {/* Days remaining progress */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Validity Progress ({subscription.daysUsed} / {subscription.totalDays} days)</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {Math.round((subscription.daysUsed / subscription.totalDays) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-card-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round((subscription.daysUsed / subscription.totalDays) * 100)}%`,
                        background: 'var(--primary)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* Quick actions for active pass */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button onClick={() => setIsQRModalOpen(true)} className="btn btn-primary btn-sm">
                    <QrCode size={15} /> Show QR Meal Token
                  </button>
                  <Link to="/subscriptions" className="btn btn-outline btn-sm">
                    <Calendar size={15} /> Pause / Manage Meals
                  </Link>
                  <Link to={`/mess/${subscription.messId}`} className="btn btn-ghost btn-sm">
                    Check Today's Menu
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You don't have an active meal subscription yet. Explore nearby messes to activate student pass.
                </p>
                <Link to="/find-mess" className="btn btn-primary btn-sm">
                  Find a Mess & Subscribe
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Student Stat Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Saved Messes */}
          <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ❤️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SAVED MESSES</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{favorites.length} Messes</div>
            </div>
            <Link to="/favorites" className="btn btn-outline btn-sm">
              View
            </Link>
          </div>

          {/* Today's Meal Window */}
          <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🍛
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NEXT MEAL WINDOW</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Lunch: 12:15 – 3:00 PM
              </div>
            </div>
            <span className="badge badge-success">
              OPEN
            </span>
          </div>

          {/* Student Savings */}
          <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--warning-light)', color: 'var(--warning-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              💰
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STUDENT SAVINGS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning-dark)' }}>~₹4,200 / mo</div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>vs Takeouts</span>
          </div>
        </div>
      </div>

      {/* 3. FEATURED MESSES SECTION */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase' }}>
              <Flame size={14} /> Student Favorites
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Top-Rated Campus Messes</h2>
          </div>
          <Link to="/find-mess" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '0.9rem' }}>
            View All ({mockMesses.length}) <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-auto">
          {featuredMesses.slice(0, 3).map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
              onSubscribeClick={(m) => setSelectedMessForPlan(m)}
            />
          ))}
        </div>
      </section>

      {/* 4. NEARBY MESSES */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase' }}>
              <MapPin size={14} /> Walking Distance
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Closest Messes to Your Hostel</h2>
          </div>
          <Link to="/find-mess?view=map" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '0.9rem' }}>
            Open Interactive Map <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-cols-auto">
          {nearbyMesses.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
              onSubscribeClick={(m) => setSelectedMessForPlan(m)}
            />
          ))}
        </div>
      </section>

      {/* 5. TODAY'S MENU TEASER BANNER (Mint Tinted) */}
      <div style={{ background: 'var(--primary-light)', border: '1.5px solid var(--success-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-success" style={{ fontWeight: 800 }}>
            DAILY SPECIALS
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '8px', marginBottom: '4px', color: 'var(--text-main)' }}>
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

      {/* Subscription Modal */}
      {selectedMessForPlan && (
        <PlanModal
          mess={selectedMessForPlan}
          isOpen={!!selectedMessForPlan}
          onClose={() => setSelectedMessForPlan(null)}
        />
      )}

      {/* QR Code Modal */}
      {subscription && (
        <QRModal
          subscription={subscription}
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}
    </div>
  );
};
