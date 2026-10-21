import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ShieldCheck,
  Filter,
  PlusCircle,
  Sparkles,
  Send,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  getMessesApi,
  getMessReviewsApi,
  submitReviewApi,
  updateReviewApi,
  deleteReviewApi,
  ReviewApiResponse,
  MessSummaryApiResponse,
} from '../../../api/studentApi';
import { StarRating } from '../../../components/ui/StarRating';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const token = user?.token || localStorage.getItem('messmap_auth_token') || '';

  const [messes, setMesses] = useState<MessSummaryApiResponse[]>([]);
  const [reviewsList, setReviewsList] = useState<ReviewApiResponse[]>([]);
  const [filterMess, setFilterMess] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Review Form & Edit State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formMessId, setFormMessId] = useState<string>('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formTaste, setFormTaste] = useState<number>(5);
  const [formHygiene, setFormHygiene] = useState<number>(5);
  const [formComment, setFormComment] = useState<string>('');
  const [formTags, setFormTags] = useState<string[]>(['Hot Phulkas', 'Clean Kitchen']);

  // Fetch approved messes for dropdowns
  useEffect(() => {
    getMessesApi()
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setMesses(res.data);
          if (res.data.length > 0 && !formMessId) {
            setFormMessId(String(res.data[0].id));
          }
        }
      })
      .catch((err: any) => {
        console.warn('Failed to load mess list for reviews:', err?.message);
      });
  }, []);

  // Fetch reviews from backend
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    if (filterMess !== 'all') {
      getMessReviewsApi(filterMess)
        .then((res) => {
          if (!isCurrent) return;
          setReviewsList(res.data?.reviews || []);
        })
        .catch((err: any) => {
          if (!isCurrent) return;
          setError(err?.message || 'Failed to load reviews from backend');
          setReviewsList([]);
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    } else {
      getMessesApi()
        .then(async (res) => {
          if (!isCurrent) return;
          const loadedMesses = res.data || [];
          if (loadedMesses.length === 0) {
            setReviewsList([]);
            setIsLoading(false);
            return;
          }

          const allReviewPromises = loadedMesses.map((m) =>
            getMessReviewsApi(m.id)
              .then((r) => r.data?.reviews || [])
              .catch(() => [] as ReviewApiResponse[])
          );

          const nested = await Promise.all(allReviewPromises);
          if (!isCurrent) return;
          const flattened = nested.flat();
          flattened.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setReviewsList(flattened);
        })
        .catch((err: any) => {
          if (!isCurrent) return;
          setError(err?.message || 'Failed to load messes and reviews');
          setReviewsList([]);
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    }

    return () => {
      isCurrent = false;
    };
  }, [filterMess, refreshTrigger]);

  const isUserReview = (rev: ReviewApiResponse) => {
    if (user?.id && String(rev.userId) === String(user.id)) return true;
    const currentName = (user?.name || '').toLowerCase().trim();
    return currentName && rev.userName?.toLowerCase().trim() === currentName;
  };

  const availableTags = [
    'Hot Phulkas',
    'Clean Kitchen',
    'Sunday Feast',
    'Zero Acidity',
    'Fast Service',
    'Unlimited Rice',
    'Friendly Staff',
    'High Protein',
  ];

  const handleToggleTag = (tag: string) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLike = (id: string | number) => {
    setLikedReviews((prev) => ({
      ...prev,
      [String(id)]: !prev[String(id)],
    }));
  };

  const handleStartEdit = (rev: ReviewApiResponse) => {
    setEditingReviewId(String(rev.id));
    setFormMessId(String(rev.messId));
    setFormRating(rev.rating);
    setFormTaste(rev.foodQualityScore || 5);
    setFormHygiene(rev.hygieneScore || 5);
    setFormComment(rev.comment || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingReviewId(null);
    setFormComment('');
    setFormTags(['Hot Phulkas', 'Clean Kitchen']);
    setIsFormOpen(false);
  };

  const handleDeleteReview = async (messId: string | number, reviewId: string | number) => {
    if (!token) {
      showToast('Please log in with your student account to manage your reviews', 'error');
      return;
    }
    try {
      await deleteReviewApi(token, messId, reviewId);
      setDeleteConfirmId(null);
      if (editingReviewId === String(reviewId)) {
        handleCancelForm();
      }
      showToast('Your review was deleted successfully 🗑️', 'info');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      showToast('Please enter your review comments', 'error');
      return;
    }

    if (!token) {
      showToast('Please log in with your student account to submit a review', 'error');
      return;
    }

    const targetMessId = formMessId || (messes[0] ? String(messes[0].id) : '1');

    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        await updateReviewApi(token, targetMessId, editingReviewId, {
          rating: formRating,
          comment: formComment.trim(),
          foodQualityScore: formTaste,
          hygieneScore: formHygiene,
        });
        showToast('Your review has been updated! ✏️', 'success');
      } else {
        await submitReviewApi(token, targetMessId, {
          rating: formRating,
          comment: formComment.trim(),
          foodQualityScore: formTaste,
          hygieneScore: formHygiene,
        });
        showToast('Your student review has been posted! Thank you ⭐', 'success');
      }
      handleCancelForm();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (filterRating > 0 && r.rating < filterRating) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Student Verified Feedback
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Mess Ratings & Student Reviews
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Authentic community reviews from college hostelers to help you find hygienic and tasty food.
          </p>
        </div>

        <button
          onClick={() => {
            if (isFormOpen && editingReviewId) {
              handleCancelForm();
            } else {
              setIsFormOpen(!isFormOpen);
            }
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={16} /> {isFormOpen ? (editingReviewId ? 'Cancel Edit' : 'Cancel Review') : 'Write a Review'}
        </button>
      </div>

      {/* WRITE / EDIT REVIEW FORM (TOGGLEABLE) */}
      {isFormOpen && (
        <div className="card" style={{ marginBottom: '2.5rem', border: '2px solid var(--primary)', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {editingReviewId ? 'Edit Your Dining Review' : 'Share Your Dining Experience'}
            </h3>
            {editingReviewId && (
              <span
                style={{
                  background: 'var(--warning-light)',
                  color: 'var(--warning-dark)',
                  border: '1px solid #fde68a',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Pencil size={12} /> Editing Mode
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {editingReviewId
              ? 'Update your ratings or experience comments below. Changes will be saved immediately to your review.'
              : 'Your honest feedback helps fellow students choose the right mess and encourages mess owners to maintain hygiene.'}
          </p>

          <form onSubmit={handleReviewSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Mess Selector */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Which mess are you reviewing?</label>
                <select
                  className="form-select"
                  value={formMessId}
                  onChange={(e) => setFormMessId(e.target.value)}
                >
                  {messes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Star Rating */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Overall Experience Rating:</label>
                <div style={{ paddingTop: '6px' }}>
                  <StarRating
                    rating={formRating}
                    size={26}
                    interactive={true}
                    onRatingChange={(r) => setFormRating(r)}
                  />
                </div>
              </div>
            </div>

            {/* Sub criteria */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Food Taste & Soft Phulkas:
                </label>
                <StarRating rating={formTaste} size={18} interactive={true} onRatingChange={setFormTaste} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Kitchen Cleanliness & Hygiene:
                </label>
                <StarRating rating={formHygiene} size={18} interactive={true} onRatingChange={setFormHygiene} />
              </div>
            </div>

            {/* Comment */}
            <div className="form-group">
              <label className="form-label">Detailed Review & Experience:</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Share about food quality, taste, rotis, Sunday specials, crowd, or owner hospitality..."
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                required
              />
            </div>

            {/* Quick Tags */}
            <div className="form-group">
              <label className="form-label">Tag Highlights:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableTags.map((tag) => {
                  const selected = formTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: selected ? 'var(--primary-light)' : '#ffffff',
                        color: selected ? 'var(--primary-dark)' : 'var(--text-muted)',
                        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-full)',
                        fontWeight: selected ? 700 : 500,
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.78rem'
                      }}
                    >
                      {selected ? '✓ ' : '+ '} {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={handleCancelForm} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : editingReviewId ? (
                  <>
                    <CheckCircle2 size={15} /> Update My Review
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit Student Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SORT BAR */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
          <Filter size={15} color="var(--primary)" /> Filter Reviews:
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={filterMess}
          onChange={(e) => setFilterMess(e.target.value)}
        >
          <option value="all">All Mess Facilities ({messes.length})</option>
          {messes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          value={filterRating}
          onChange={(e) => setFilterRating(Number(e.target.value))}
        >
          <option value={0}>All Ratings</option>
          <option value={5}>5 Stars Only</option>
          <option value={4}>4 Stars and Above</option>
        </select>

        <button
          type="button"
          onClick={() => setRefreshTrigger((prev) => prev + 1)}
          className="btn btn-outline btn-sm"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredReviews.length}</strong> reviews
        </div>
      </div>

      {/* REVIEWS LIST OR STATES */}
      {isLoading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Loading Student Reviews...</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-card-subtle)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            No Reviews Found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1rem' }}>
            No student dining reviews match your filter selection. Be the first to share your experience!
          </p>
          <button type="button" onClick={() => setIsFormOpen(true)} className="btn btn-primary btn-sm">
            Write a Review
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReviews.map((rev) => {
            const hasLiked = !!likedReviews[String(rev.id)];
            const isMine = isUserReview(rev);
            const authorInitial = (rev.userName || 'S').substring(0, 2).toUpperCase();
            const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent';

            return (
              <div
                key={rev.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderLeft: isMine ? '4px solid var(--primary)' : undefined,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '0.85rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isMine ? 'var(--primary)' : 'var(--primary-light)', color: isMine ? '#ffffff' : 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                        {authorInitial}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', flexWrap: 'wrap' }}>
                          {rev.userName || 'Student Diner'}
                          {isMine && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                background: 'var(--primary-light)',
                                color: 'var(--primary-dark)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 800,
                                border: '1px solid var(--success-border)',
                              }}
                            >
                              Your Review
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                            <ShieldCheck size={13} /> Verified Hosteler
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {rev.userCollege || 'Campus Hosteler'} • Reviewed on {dateStr}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.9rem' }}>
                      ★ {rev.rating}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '2px' }}>
                      {rev.messName || `Mess #${rev.messId}`}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  "{rev.comment}"
                </p>

                {/* Sub-ratings & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {rev.foodQualityScore && <span>Taste: <strong>{rev.foodQualityScore}/5</strong></span>}
                    {rev.hygieneScore && <span>Hygiene: <strong>{rev.hygieneScore}/5</strong></span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Edit and Delete Buttons for author */}
                    {isMine && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {deleteConfirmId === String(rev.id) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ fontSize: '0.76rem', color: '#b91c1c', fontWeight: 700 }}>
                              Delete review?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.messId, rev.id)}
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Yes, Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              style={{
                                background: '#ffffff',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(rev)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: 'var(--primary-dark)',
                                background: 'var(--primary-light)',
                                border: '1px solid var(--success-border)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                              }}
                              title="Edit this review"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(String(rev.id))}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#dc2626',
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                              }}
                              title="Delete this review"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleLike(rev.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: hasLiked ? 'var(--primary-dark)' : 'var(--text-muted)',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <ThumbsUp size={14} fill={hasLiked ? 'var(--primary)' : 'none'} color={hasLiked ? 'var(--primary)' : 'var(--text-muted)'} />
                      Helpful ({hasLiked ? 1 : 0})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { ReviewsPage as StudentReviewsPage };
