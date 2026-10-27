import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  getOwnerEnquiriesApi,
  replyOwnerEnquiryApi,
  type OwnerEnquiryResponse,
} from '../../../api/ownerApi';
import type { OwnerOutletContextType } from '../layouts/OwnerLayout';
import './EnquiriesPage.css';

interface Enquiry {
  id: string;
  studentName: string;
  studentEmail?: string;
  college: string;
  phone: string;
  category: string;
  planType: string;
  message: string;
  date: string;
  status: 'new' | 'replied';
  replyNotes?: string;
}

export const EnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const outletCtx = useOutletContext<OwnerOutletContextType | null>();
  const isDemoOwner = user.email === 'rajesh.sharma@annapurnamess.com' || user.messId === 'MESS-101';
  const displayMessName = outletCtx?.ownerMess?.name || user.messName || (isDemoOwner ? 'Annapurna Mess' : 'My Mess');

  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const fetchEnquiries = async () => {
    const token = localStorage.getItem('messmap_auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await getOwnerEnquiriesApi(token, outletCtx?.ownerMess?.id);
      if (res?.data) {
        const loaded: Enquiry[] = res.data.map((item: OwnerEnquiryResponse) => ({
          id: String(item.id),
          studentName: item.studentName || 'Student Diner',
          studentEmail: item.studentEmail,
          college: item.studentCollege || 'Campus Student',
          phone: item.studentPhone || 'Not provided',
          category: item.category || 'General Enquiry',
          planType: item.planPreference || item.category || 'General',
          message: item.message,
          date: item.createdAt
            ? new Date(item.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'Recently',
          status: item.status === 'REPLIED' ? 'replied' : 'new',
          replyNotes: item.replyNotes,
        }));
        setEnquiries(loaded);
      } else {
        setEnquiries([]);
      }
    } catch (err: any) {
      console.error('[EnquiriesPage] Failed to fetch owner enquiries:', err);
      setError(err?.message || 'Failed to load customer enquiries from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [outletCtx?.ownerMess?.id]);

  const handleMarkReplied = async (id: string, notes?: string) => {
    const token = localStorage.getItem('messmap_auth_token');
    const finalNotes = notes || 'Marked as replied by owner.';

    if (token) {
      setIsReplying(true);
      try {
        await replyOwnerEnquiryApi(token, id, finalNotes);
        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'replied',
                  replyNotes: finalNotes,
                }
              : e
          )
        );
        setReplyInputId(null);
        setReplyText('');
      } catch (err: any) {
        console.error('[EnquiriesPage] Error replying to enquiry:', err);
        setError(err?.message || 'Failed to submit enquiry reply.');
      } finally {
        setIsReplying(false);
      }
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.studentName.toLowerCase().includes(q) ||
      e.college.toLowerCase().includes(q) ||
      e.phone.includes(q) ||
      e.message.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="enquiries-page-container">
      {/* Top Header */}
      <div className="enquiries-header-row">
        <div>
          <h2 className="page-heading">Student & Customer Enquiries</h2>
          <p className="page-subheading">
            Review prospective diners, inquiries about monthly meal passes, and trial bookings.
          </p>
        </div>

        <div className="badge badge-green" style={{ fontSize: '13px', padding: '6px 14px' }}>
          <Sparkles size={14} /> Quick Response builds higher trust & rating
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="enquiries-controls-bar">
        <div className="filter-pill-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Enquiries ({enquiries.length})
          </button>
          <button
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            Awaiting Response ({enquiries.filter((e) => e.status === 'new').length})
          </button>
          <button
            className={`filter-btn ${filter === 'replied' ? 'active' : ''}`}
            onClick={() => setFilter('replied')}
          >
            Answered ({enquiries.filter((e) => e.status === 'replied').length})
          </button>
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student, college, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchEnquiries}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
          <p>Loading student & customer enquiries from server...</p>
        </div>
      ) : (
        /* Enquiries Feed */
        <div className="enquiries-list">
        {filteredEnquiries.map((item) => (
          <div key={item.id} className={`card enquiry-card ${item.status === 'new' ? 'is-new' : ''}`}>
            <div className="enquiry-card-header">
              <div className="student-profile-info">
                <div className="student-avatar-badge">
                  {item.studentName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="student-name">{item.studentName}</h4>
                  <p className="student-college">{item.college}</p>
                </div>
              </div>

              <div className="enquiry-header-meta">
                <span className="plan-badge">{item.planType}</span>
                <span className="enquiry-date"><Clock size={12} /> {item.date}</span>
                {item.status === 'new' ? (
                  <span className="badge badge-warning">New</span>
                ) : (
                  <span className="badge badge-green">
                    <CheckCircle2 size={12} /> Answered
                  </span>
                )}
              </div>
            </div>

            <div className="enquiry-card-body">
              <p className="enquiry-message-content">"{item.message}"</p>

              {item.replyNotes && (
                <div className="reply-notes-box">
                  <strong>Owner Note:</strong> {item.replyNotes}
                </div>
              )}
            </div>

            <div className="enquiry-card-footer">
              <div className="contact-quick-info">
                <Phone size={14} className="phone-icon" />
                <span className="phone-number">{item.phone}</span>
              </div>

              <div className="enquiry-action-buttons">
                {/* WhatsApp Direct Action */}
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                    item.studentName
                  )},%20this%20is%20${encodeURIComponent(displayMessName)}.%20Regarding%20your%20enquiry:`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-green-subtle"
                  onClick={() => handleMarkReplied(item.id, 'Responded via WhatsApp')}
                >
                  <MessageCircle size={15} /> WhatsApp Reply
                </a>

                {/* Call Student */}
                <a href={`tel:${item.phone}`} className="btn btn-secondary">
                  <Phone size={14} /> Call
                </a>

                {item.status === 'new' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (replyInputId === item.id) {
                        setReplyInputId(null);
                      } else {
                        setReplyInputId(item.id);
                      }
                    }}
                  >
                    Add Note
                  </button>
                )}
              </div>
            </div>

            {/* In-card Note Form */}
            {replyInputId === item.id && (
              <div className="quick-reply-form">
                <input
                  type="text"
                  placeholder="e.g. Called student, confirmed 3-day trial pass..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="quick-reply-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleMarkReplied(item.id, replyText)}
                >
                  Save & Resolve
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredEnquiries.length === 0 && (
          <div className="empty-enquiries-card">
            <MessageSquare size={44} className="empty-icon" />
            <h3>No enquiries found</h3>
            <p>
              {enquiries.length === 0
                ? 'No customer enquiries received yet. When students submit enquiries for your mess, they will appear here.'
                : 'You have responded to all enquiries in this category.'}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
