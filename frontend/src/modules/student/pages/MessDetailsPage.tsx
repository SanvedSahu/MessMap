import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Heart,
  Share2,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  Award,
} from 'lucide-react';
import { mockMesses } from '../../../data/mockMesses';
import { mockReviews } from '../../../data/mockReviews';
import { useMessData } from '../../../context/MessDataContext';
import { FoodBadge, StatusBadge } from '../../../components/ui/Badge';
import { MessMapView } from '../components/MessMapView';
import { useFavorites } from '../../../context/FavoritesContext';
import { useNotification } from '../../../context/NotificationContext';
import { MessItem, ReviewItem } from '../../../types/student.types';

export const MessDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useNotification();
  const { messes } = useMessData();

  const allMesses = (messes && messes.length > 0 ? (messes as unknown as MessItem[]) : (mockMesses as unknown as MessItem[]));
  const mess: MessItem = allMesses.find((m) => m.id === id) || (mockMesses[0] as unknown as MessItem);
  const favorited = isFavorite(mess.id);

  const [activePhoto, setActivePhoto] = useState<string>(mess.heroImage);
  const [activeTab, setActiveTab] = useState<'menu' | 'plans' | 'timings' | 'reviews'>('menu');

  const messReviews = (mockReviews as unknown as ReviewItem[]).filter((r) => r.messId === mess.id);

  const handleFavoriteClick = () => {
    toggleFavorite(mess.id);
    showToast(
      favorited
        ? `Removed "${mess.name}" from saved favorites`
        : `Added "${mess.name}" to favorites! ❤️`,
      'info'
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Mess link copied to clipboard! Share with your roommates 📋', 'success');
    }
  };

  return (
    <div>
      {/* Top Breadcrumb & Action bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={18} /> Back to Messes
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-outline btn-sm"
            title="Share this mess with friends"
          >
            <Share2 size={15} /> Share
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="btn btn-outline btn-sm"
            style={{
              color: favorited ? 'var(--danger)' : 'var(--text-main)',
              borderColor: favorited ? '#fca5a5' : 'var(--border-color)',
            }}
          >
            <Heart
              size={15}
              color={favorited ? 'var(--danger)' : 'var(--text-muted)'}
              fill={favorited ? 'var(--danger)' : 'none'}
            />
            {favorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols | Right 1 Col */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ minWidth: 0 }}>
          {/* PHOTO GALLERY */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                height: '380px',
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '10px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <img
                src={activePhoto}
                alt={mess.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <FoodBadge type={mess.foodType} />
                <StatusBadge isOpen={mess.isOpenNow} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(15,23,42,0.85)',
                  backdropFilter: 'blur(4px)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={16} color="var(--primary)" /> Physical Hygiene Verified
              </div>
            </div>

            {/* Thumbnail Strip */}
            {mess.gallery && mess.gallery.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                }}
              >
                {mess.gallery.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhoto(imgUrl)}
                    style={{
                      width: '74px',
                      height: '56px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border:
                        activePhoto === imgUrl
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-color)',
                      opacity: activePhoto === imgUrl ? 1 : 0.7,
                      flexShrink: 0,
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TITLE & OVERVIEW */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                marginBottom: '0.4rem',
                color: 'var(--text-main)',
              }}
            >
              {mess.name}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {mess.tagline}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.95rem' }}>
                  ★ {mess.rating}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ({mess.reviewCount} student reviews)
                </span>
              </div>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-muted)',
                }}
              >
                <MapPin size={16} color="var(--primary)" />
                <span>
                  {mess.distanceKm} km from campus ({mess.landmark})
                </span>
              </div>
            </div>
          </div>

          {/* HIGHLIGHTED FEATURES CHIPS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
            {mess.features?.map((feat, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--success-border)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--primary-dark)',
                }}
              >
                <CheckCircle2 size={14} color="var(--primary)" /> {feat}
              </span>
            ))}
          </div>

          {/* TABS HEADER */}
          <div className="mm-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`mm-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            >
              🍱 Daily Menu & Specials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`mm-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
            >
              💳 Subscription Plans ({mess.plans?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timings')}
              className={`mm-tab-btn ${activeTab === 'timings' ? 'active' : ''}`}
            >
              ⏰ Meal Timings & Hours
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`mm-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              ⭐ Reviews ({messReviews.length})
            </button>
          </div>

          {/* TAB 1: MENU */}
          {activeTab === 'menu' && (
            <div>
              {/* Today's Special Board */}
              <div
                style={{
                  background: 'var(--primary-light)',
                  border: '1.5px solid var(--success-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>🍲</span>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--primary-dark)',
                      }}
                    >
                      Today's Fresh Daily Menu (Live)
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Updated today by {mess.ownerName} at 10:00 AM
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {/* Lunch Card */}
                  <div
                    className="card"
                    style={{ padding: '1.2rem', borderColor: 'var(--success-border)' }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: 'var(--primary-dark)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      🍛 LUNCH (12:15 – 3:00 PM)
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <li>
                        <strong>Main Sabji:</strong> {mess.todayMenu?.lunch?.sabji1}
                      </li>
                      <li>
                        <strong>Secondary Sabji:</strong> {mess.todayMenu?.lunch?.sabji2}
                      </li>
                      <li>
                        <strong>Dal / Curry:</strong> {mess.todayMenu?.lunch?.dal}
                      </li>
                      <li>
                        <strong>Rice:</strong> {mess.todayMenu?.lunch?.rice}
                      </li>
                      <li>
                        <strong>Breads:</strong> {mess.todayMenu?.lunch?.bread}
                      </li>
                      <li>
                        <strong>Sides:</strong> {mess.todayMenu?.lunch?.sides?.join(', ')}
                      </li>
                      {mess.todayMenu?.lunch?.sweet && (
                        <li style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                          <strong>Sweet:</strong> {mess.todayMenu.lunch.sweet}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Dinner Card */}
                  <div
                    className="card"
                    style={{ padding: '1.2rem', borderColor: 'var(--success-border)' }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: 'var(--text-main)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      🌙 DINNER (7:30 – 10:15 PM)
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <li>
                        <strong>Main Sabji:</strong> {mess.todayMenu?.dinner?.sabji1}
                      </li>
                      <li>
                        <strong>Secondary Sabji:</strong> {mess.todayMenu?.dinner?.sabji2}
                      </li>
                      <li>
                        <strong>Dal:</strong> {mess.todayMenu?.dinner?.dal}
                      </li>
                      <li>
                        <strong>Rice:</strong> {mess.todayMenu?.dinner?.rice}
                      </li>
                      <li>
                        <strong>Breads:</strong> {mess.todayMenu?.dinner?.bread}
                      </li>
                      <li>
                        <strong>Sides:</strong> {mess.todayMenu?.dinner?.sides?.join(', ')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANS */}
          {activeTab === 'plans' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mess.plans?.map((plan) => (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderLeft: plan.popular
                      ? '4px solid var(--primary)'
                      : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                        }}
                      >
                        {plan.name}
                      </h4>
                      {plan.popular && <span className="badge badge-success">Most Popular</span>}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                      }}
                    >
                      Validity: <strong>{plan.validity}</strong> • {plan.billingCycle}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {plan.features?.map((feat, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.75rem',
                            background: 'var(--bg-card-subtle)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--primary-dark)',
                        marginBottom: '6px',
                      }}
                    >
                      ₹{plan.price}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary-dark)',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--success-border)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Dine-in / Counter Rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TIMINGS */}
          {activeTab === 'timings' && (
            <div className="card">
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  color: 'var(--text-main)',
                }}
              >
                Meal Schedule & Operating Hours
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Breakfast Window:</span>
                  <span style={{ fontWeight: 700 }}>
                    {mess.mealTimings?.breakfast || '07:30 AM – 10:00 AM'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--primary-light)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--success-border)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                    Lunch Window:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                    {mess.mealTimings?.lunch || '12:15 PM – 03:00 PM'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Dinner Window:</span>
                  <span style={{ fontWeight: 700 }}>
                    {mess.mealTimings?.dinner || '07:30 PM – 10:15 PM'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Student Reviews ({messReviews.length})
                </h3>
                <Link to="/reviews" className="btn btn-outline btn-sm">
                  Write a Review
                </Link>
              </div>

              {messReviews.length === 0 ? (
                <div className="empty-state-box" style={{ padding: '2.5rem 1rem' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    No reviews submitted yet for this mess.
                  </p>
                  <Link to="/reviews" className="btn btn-primary btn-sm">
                    Be the first to review
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messReviews.map((rev) => (
                    <div key={rev.id} className="card" style={{ padding: '1.25rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.userName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {rev.userCollege || 'Pune University'} • {rev.date}
                          </div>
                        </div>
                        <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.9rem' }}>
                          ★ {rev.rating}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          marginBottom: '8px',
                        }}
                      >
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: QUICK ACTION & CONTACT DETAILS */}
        <div
          style={{
            position: 'sticky',
            top: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Booking Card */}
          <div
            className="card"
            style={{ border: '1.5px solid var(--success-border)', boxShadow: 'var(--shadow-md)' }}
          >
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Starting from</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{mess.monthlyPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                /month
              </span>
            </div>

            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--primary-dark)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '1.25rem',
              }}
            >
              <Award size={16} /> Campus Verified Student Value
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '1.5rem',
              }}
            >
              <a
                href={`tel:${mess.phone}`}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <Phone size={18} /> Call Mess for Admission
              </a>
              <a
                href={`https://wa.me/91${mess.phone.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20dining%20at%20${encodeURIComponent(mess.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem',
                lineHeight: 1.5,
              }}
            >
              🍽️ <strong>Single Meal Thali:</strong> ₹{mess.dailyPrice} (Pay at counter)<br />
              📅 <strong>Monthly Student Rate:</strong> ₹{mess.monthlyPrice}/mo
            </div>
          </div>

          {/* Contact & Mess Owner Card */}
          <div className="card">
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                marginBottom: '1rem',
                color: 'var(--text-main)',
              }}
            >
              Mess Owner & Contact
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.88rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Proprietor / Incharge
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{mess.ownerName}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${mess.phone}`}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  <Phone size={14} color="var(--primary)" /> Call Mess
                </a>
                <a
                  href={`https://wa.me/${mess.whatsapp}?text=Hi,%20I%20am%20interested%20in%20MessMap%20monthly%20subscription`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  <MessageCircle size={14} color="#059669" /> WhatsApp
                </a>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {mess.address}
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Preview */}
          <div className="card" style={{ padding: '0.75rem' }}>
            <div style={{ height: '220px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <MessMapView messes={[mess]} selectedMessId={mess.id} height="220px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
