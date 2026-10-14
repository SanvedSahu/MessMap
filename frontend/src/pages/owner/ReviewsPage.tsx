import React, { useState } from 'react';
import {
  Star,
  CornerDownRight,
  Send,
  Sparkles
} from 'lucide-react';
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
    ownerReply: 'Thank you so much Aarav! We always strive to serve homestyle food with warmth. Glad you enjoy our dal tadka!',
  },
  {
    id: 'r2',
    studentName: 'Sneha Patil',
    avatarText: 'SP',
    rating: 5,
    date: '2 days ago',
    mealTag: 'Sunday Special Feast',
    comment:
      'The Gulab Jamun and Paneer Butter Masala this Sunday was outstanding! Clean dining tables and quick service even during peak lunch rush.',
  },
  {
    id: 'r3',
    studentName: 'Kunal Shinde',
    avatarText: 'KS',
    rating: 4,
    date: '5 days ago',
    mealTag: 'Walk-in Lunch',
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
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeStarFilter, setActiveStarFilter] = useState<number | 'all'>('all');

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
      <div className="card rating-summary-card">
        {/* Big Score */}
        <div className="score-spotlight">
          <span className="big-rating-number">4.7</span>
          <div className="stars-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} className="filled-star" fill="#eab308" color="#eab308" />
            ))}
          </div>
          <p className="total-reviews-count">Based on 94 verified reviews</p>
          <span className="badge badge-green" style={{ marginTop: '8px' }}>
            <Sparkles size={12} /> Top Rated in Katraj Area
          </span>
        </div>

        {/* Rating Bars */}
        <div className="breakdown-bars">
          <div className="bar-row">
            <span className="star-label">5 Stars</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '74%' }} />
            </div>
            <span className="percent-val">74%</span>
          </div>

          <div className="bar-row">
            <span className="star-label">4 Stars</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '18%' }} />
            </div>
            <span className="percent-val">18%</span>
          </div>

          <div className="bar-row">
            <span className="star-label">3 Stars</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '5%' }} />
            </div>
            <span className="percent-val">5%</span>
          </div>

          <div className="bar-row">
            <span className="star-label">2 Stars</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '2%' }} />
            </div>
            <span className="percent-val">2%</span>
          </div>

          <div className="bar-row">
            <span className="star-label">1 Star</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '1%' }} />
            </div>
            <span className="percent-val">1%</span>
          </div>
        </div>
      </div>

      {/* Star Filter Tabs */}
      <div className="star-filter-tabs">
        <button
          className={`tab-filter-btn ${activeStarFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveStarFilter('all')}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          className={`tab-filter-btn ${activeStarFilter === 5 ? 'active' : ''}`}
          onClick={() => setActiveStarFilter(5)}
        >
          5 Stars Only ({reviews.filter((r) => r.rating === 5).length})
        </button>
        <button
          className={`tab-filter-btn ${activeStarFilter === 4 ? 'active' : ''}`}
          onClick={() => setActiveStarFilter(4)}
        >
          4 Stars Only ({reviews.filter((r) => r.rating === 4).length})
        </button>
      </div>

      {/* Reviews Feed */}
      <div className="reviews-feed">
        {filteredReviews.map((item) => (
          <div key={item.id} className="card review-card">
            <div className="review-top-row">
              <div className="student-author-group">
                <div className="student-avatar-circle">{item.avatarText}</div>
                <div>
                  <h4 className="student-name">{item.studentName}</h4>
                  <div className="stars-mini-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= item.rating ? '#eab308' : '#e2e8f0'}
                        color={s <= item.rating ? '#eab308' : '#e2e8f0'}
                      />
                    ))}
                    <span className="review-date">• {item.date}</span>
                  </div>
                </div>
              </div>

              <span className="meal-tag-pill">{item.mealTag}</span>
            </div>

            <p className="review-comment-text">"{item.comment}"</p>

            {/* Existing Owner Reply */}
            {item.ownerReply ? (
              <div className="owner-reply-box">
                <div className="reply-header">
                  <CornerDownRight size={15} className="reply-icon" />
                  <span className="reply-author">Response from Annapurna Mess Owner:</span>
                </div>
                <p className="reply-body">{item.ownerReply}</p>
              </div>
            ) : (
              /* Reply Input Box */
              <div className="write-reply-section">
                <input
                  type="text"
                  placeholder="Write a public response to this student review..."
                  value={replyTextMap[item.id] || ''}
                  onChange={(e) =>
                    setReplyTextMap({ ...replyTextMap, [item.id]: e.target.value })
                  }
                  className="reply-input-field"
                />
                <button
                  className="btn btn-primary btn-reply"
                  onClick={() => handleSendReply(item.id)}
                >
                  <Send size={13} /> Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
