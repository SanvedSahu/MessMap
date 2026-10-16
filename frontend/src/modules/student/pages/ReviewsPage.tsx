import React, { useState } from 'react';
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
} from 'lucide-react';
import { mockReviews } from '../../../data/mockReviews';
import { mockMesses } from '../../../data/mockMesses';
import { StarRating } from '../../../components/ui/StarRating';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { ReviewItem } from '../../../types/student.types';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Load reviews with localStorage persistence fallback
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('messmap_student_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return mockReviews as unknown as ReviewItem[];
  });

  const [filterMess, setFilterMess] = useState('all');
  const [filterRating, setFilterRating] = useState(0);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Review Form & Edit State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formMessId, setFormMessId] = useState(mockMesses[0].id);
  const [formRating, setFormRating] = useState(5);
  const [formTaste, setFormTaste] = useState(5);
  const [formHygiene, setFormHygiene] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formTags, setFormTags] = useState(['Hot Phulkas', 'Clean Kitchen']);

  const saveReviews = (newList: ReviewItem[]) => {
    setReviewsList(newList);
    try {
      localStorage.setItem('messmap_student_reviews', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const isUserReview = (rev: ReviewItem) => {
    const currentName = (user?.name || 'Rahul Patil').toLowerCase().trim();
    return rev.userName.toLowerCase().trim() === currentName || rev.id === 'rev-user-1';
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

  const handleLike = (id: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartEdit = (rev: ReviewItem) => {
    setEditingReviewId(rev.id);
    setFormMessId(rev.messId);
    setFormRating(rev.rating);
    setFormTaste(rev.foodQuality || 5);
    setFormHygiene(rev.hygiene || 5);
    setFormComment(rev.comment);
    setFormTags(rev.tags || ['Hot Phulkas', 'Clean Kitchen']);
    setIsFormOpen(true);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingReviewId(null);
    setFormComment('');
    setFormTags(['Hot Phulkas', 'Clean Kitchen']);
    setIsFormOpen(false);
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviewsList.filter((r) => r.id !== id);
    saveReviews(updated);
    setDeleteConfirmId(null);
    if (editingReviewId === id) {
      handleCancelForm();
    }
    showToast('Your review was deleted successfully 🗑️', 'info');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      showToast('Please enter your review comments', 'error');
      return;
    }

    const selectedMess = mockMesses.find((m) => m.id === formMessId) || mockMesses[0];

    // EDIT MODE
    if (editingReviewId) {
      const updated = reviewsList.map((r) => {
        if (r.id === editingReviewId) {
          return {
            ...r,
            messId: formMessId,
            messName: selectedMess.name,
            rating: formRating,
            foodQuality: formTaste,
            hygiene: formHygiene,
            comment: formComment,
            tags: formTags,
            date: new Date().toISOString().split('T')[0] + ' (Edited)',
          };
        }
        return r;
      });
      saveReviews(updated);
      setEditingReviewId(null);
      setFormComment('');
      setIsFormOpen(false);
      showToast('Your review has been updated! ✏️', 'success');
      return;
    }

    // CREATE MODE
    const newRev: ReviewItem = {
      id: 'rev-' + Date.now(),
      messId: formMessId,
      messName: selectedMess.name,
      userName: user?.name || 'Rahul Patil',
      college: user?.college || 'COEP Technological University',
      rating: formRating,
      date: new Date().toISOString().split('T')[0],
      foodQuality: formTaste,
      hygiene: formHygiene,
      valueForMoney: 5,
      comment: formComment,
      likes: 0,
      tags: formTags,
    };

    saveReviews([newRev, ...reviewsList]);
    setFormComment('');
    setIsFormOpen(false);
    showToast('Your student review has been posted! Thank you ⭐', 'success');
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (filterMess !== 'all' && r.messId !== filterMess) return false;
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
                  {mockMesses.map((m) => (
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
              <button type="submit" className="btn btn-primary">
                {editingReviewId ? (
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
          <option value="all">All Mess Facilities ({mockMesses.length})</option>
          {mockMesses.map((m) => (
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

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredReviews.length}</strong> reviews
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredReviews.map((rev) => {
          const hasLiked = !!likedReviews[rev.id];
          const isMine = isUserReview(rev);
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
                      {rev.userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', flexWrap: 'wrap' }}>
                        {rev.userName}
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
                        {rev.college} • Reviewed on {rev.date}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.9rem' }}>
                    ★ {rev.rating}
                  </span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '2px' }}>
                    {rev.messName}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
                "{rev.comment}"
              </p>

              {/* Tags & Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {rev.tags?.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        background: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Edit and Delete Buttons for author */}
                  {isMine && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {deleteConfirmId === rev.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.76rem', color: '#b91c1c', fontWeight: 700 }}>
                            Delete review?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
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
                            onClick={() => setDeleteConfirmId(rev.id)}
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
                    Helpful ({rev.likes + (hasLiked ? 1 : 0)})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { ReviewsPage as StudentReviewsPage };
