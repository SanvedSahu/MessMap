import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  CornerDownRight,
  Send,
  Sparkles,
  Store,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getOwnerMessApi } from '../../../api/ownerApi';
import { getMessReviewsApi } from '../../../api/studentApi';
import './ReviewsPage.css';

interface Review {
  id: string;
  studentName: string;
  avatarText: string;
  rating: number;
  date: string;
  mealTag: string;
  comment: string;
  ownerReply?: string;
}

const mockReviews: Review[] = [
  {
    id: 'r1',
    studentName: 'Aarav Deshmukh',
    avatarText: 'AD',
    rating: 5,
    date: 'Yesterday',
    mealTag: 'Monthly Diners Pass',
    comment:
      'Best mess near Katraj! The chapati quality is like home — soft and served hot. Dal Tadka is super flavourful. The owner Rajesh-ji always ensures students get extra servings if needed.',
    ownerReply: 'Thank you Aarav! We take pride in serving wholesome homestyle meals every single day.',
  },
  {
    id: 'r2',
    studentName: 'Sneha Joshi',
    avatarText: 'SJ',
    rating: 5,
    date: '3 days ago',
    mealTag: 'Lunch Thali',
    comment:
      'Clean dining hall with fast service during peak lunch hours (1 PM). Unlimited rice and sambar/dal refill makes it great value for money for college students.',
  },
  {
    id: 'r3',
    studentName: 'Kunal Verma',
    avatarText: 'KV',
    rating: 4,
    date: '5 days ago',
    mealTag: 'Monthly Diners Pass',
    comment:
      'Food is delicious and hygienic. Only suggestion is to add curd or chaas in the regular afternoon thali during summer months.',
    ownerReply: 'Great feedback Kunal! We will be introducing complimentary spiced buttermilk starting this upcoming Monday.',
  },
  {
    id: 'r4',
    studentName: 'Pooja Nair',
    avatarText: 'PN',
    rating: 4,
    date: '1 week ago',
    mealTag: 'Dinner Thali',
    comment:
      'Very consistent taste over the last 3 months. Reasonable monthly subscription rates for college students compared to other messes in the lane.',
  },
];

export const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com' || user.messId === 'MESS-101';

  const [hasMess, setHasMess] = useState<boolean>(() => !!user.messId || isDemoOwner);
  const [reviews, setReviews] = useState<Review[]>(() => (isDemoOwner ? mockReviews : []));
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeStarFilter, setActiveStarFilter] = useState<number | 'all'>('all');

  // Load genuine reviews for this owner's specific mess
  useEffect(() => {
    const token = localStorage.getItem('messmap_auth_token');
    if (token) {
      getOwnerMessApi(token)
        .then((messRes) => {
          if (messRes?.data?.id) {
            setHasMess(true);
            const messId = messRes.data.id;
            return getMessReviewsApi(messId).then((revRes) => {
              if (revRes?.data?.reviews) {
                const mapped: Review[] = revRes.data.reviews.map((r: any) => ({
                  id: String(r.id),
                  studentName: r.studentName || 'Student Diner',
                  avatarText: (r.studentName || 'ST').substring(0, 2).toUpperCase(),
                  rating: Number(r.rating) || 5,
                  date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
                  mealTag: 'Verified Student Diner',
                  comment: r.comment || '',
                  ownerReply: r.ownerReply || undefined,
                }));
                setReviews(mapped);
              }
            });
          }
        })
        .catch((err) => {
          if (
            err.message &&
            (err.message.includes('not found') || err.message.includes('No mess'))
          ) {
            if (!isDemoOwner) {
              setHasMess(false);
            }
          } else {
            console.warn('Backend reviews fetch note:', err.message);
          }
        });
    }
  }, [user.id, isDemoOwner]);

  const handleSendReply = (reviewId: string) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ownerReply: text.trim() } : r))
    );

    setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeStarFilter === 'all') return true;
    return r.rating === activeStarFilter;
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  const starBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, pct };
  });

  // Empty state if owner has not created a mess profile yet
  if (!hasMess) {
    return (
      <div className="reviews-page-container">
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '2rem auto',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Store size={36} color="#10b981" />
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '0.6rem',
              color: 'var(--text-primary)',
            }}
          >
            You haven't created your mess profile yet.
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            Create your mess listing so verified students can subscribe, dine, and submit authentic
            reviews for your business.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/owner/profile')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.8rem 1.8rem',
              fontWeight: 700,
            }}
          >
            <Plus size={18} /> Create Mess Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page-container">
      {/* Header */}
      <div className="reviews-header-bar">
        <div>
          <h2 className="page-heading">Student Ratings & Reviews</h2>
          <p className="page-subheading">
            Authentic feedback from students using your daily dining and monthly mess subscriptions.
          </p>
        </div>
      </div>

      {/* Ratings Overview Summary Card */}
      {totalReviews > 0 ? (
        <div className="card rating-summary-card">
          {/* Big Score */}
          <div className="score-spotlight">
            <span className="big-rating-number">{avgRating}</span>
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className="filled-star"
                  fill={star <= Math.round(Number(avgRating)) ? '#eab308' : '#e2e8f0'}
                  color={star <= Math.round(Number(avgRating)) ? '#eab308' : '#cbd5e1'}
                />
              ))}
            </div>
            <p className="total-reviews-count">Based on {totalReviews} verified review{totalReviews !== 1 ? 's' : ''}</p>
            {Number(avgRating) >= 4.0 && (
              <span className="badge badge-green" style={{ marginTop: '8px' }}>
                <Sparkles size={12} /> Top Rated on MessMap
              </span>
            )}
          </div>

          {/* Rating Bars */}
          <div className="breakdown-bars">
            {starBreakdown.map((b) => (
              <div key={b.star} className="bar-row">
                <span className="star-label">{b.star} Star{b.star !== 1 ? 's' : ''}</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="percent-val">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Star size={32} color="#eab308" />
          </div>
          <h3
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }}
          >
            No student reviews yet
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontSize: '0.92rem',
            }}
          >
            Once students subscribe and dine at your mess, their verified ratings, feedback, and reviews
            will appear here for you to review and respond.
          </p>
        </div>
      )}

      {/* Star Filter Tabs (only if reviews exist) */}
      {totalReviews > 0 && (
        <div className="star-filter-tabs">
          <button
            className={`tab-filter-btn ${activeStarFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveStarFilter('all')}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => r.rating === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                className={`tab-filter-btn ${activeStarFilter === s ? 'active' : ''}`}
                onClick={() => setActiveStarFilter(s)}
              >
                {s} Stars Only ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Reviews Stream */}
      {filteredReviews.length > 0 && (
        <div className="reviews-stream">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="card review-entry-card">
              <div className="review-entry-top">
                <div className="student-profile-peek">
                  <div className="avatar-chip">{rev.avatarText}</div>
                  <div>
                    <h4 className="student-author-name">{rev.studentName}</h4>
                    <span className="meal-badge-tag">{rev.mealTag}</span>
                  </div>
                </div>

                <div className="rating-timestamp-block">
                  <div className="entry-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={star <= rev.rating ? '#eab308' : '#e2e8f0'}
                        color={star <= rev.rating ? '#eab308' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                  <span className="entry-date">{rev.date}</span>
                </div>
              </div>

              <p className="student-comment-text">"{rev.comment}"</p>

              {/* Owner Reply Block */}
              {rev.ownerReply ? (
                <div className="owner-reply-box">
                  <div className="reply-header">
                    <CornerDownRight size={15} className="reply-arrow" />
                    <strong>Your Response (Mess Owner)</strong>
                  </div>
                  <p className="reply-body-text">{rev.ownerReply}</p>
                </div>
              ) : (
                <div className="reply-compose-box">
                  <input
                    type="text"
                    placeholder="Write a polite public response to this student review..."
                    value={replyTextMap[rev.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })
                    }
                    className="reply-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(rev.id);
                    }}
                  />
                  <button
                    className="btn btn-secondary reply-send-btn"
                    onClick={() => handleSendReply(rev.id)}
                  >
                    <Send size={14} /> Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
